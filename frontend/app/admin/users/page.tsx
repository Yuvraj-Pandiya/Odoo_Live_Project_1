'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HeaderNavbar from '@/components/HeaderNavbar';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  KeyRound,
  History,
  Edit2,
  UserX,
  UserCheck,
  X,
  Briefcase,
  Building,
  Mail,
  User as UserIcon,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import { adminUsersApi, getStoredUser } from '@/lib/api';
import { RoleGovernanceList } from '@/components/RoleGovernanceList';

/* ─── Light Workspace Tokens ─────────────────────────────────────────────── */
const t = {
  surface:       '#FFFFFF',
  canvas:        '#F5F5F3',
  border:        '#DCDCD9',
  borderSubtle:  '#EBEBE8',
  textPrimary:   '#1F1F1C',
  textSecondary: '#4B4B42',
  textMuted:     '#91918F',
  accent:        '#4F46E5',
  accentHover:   '#4338CA',
  accentSubtle:  '#EEF2FF',
  success:       '#16A34A',
  successSubtle: '#DCFCE7',
  warning:       '#D97706',
  warningSubtle: '#FEF3C7',
  error:         '#DC2626',
  errorSubtle:   '#FEE2E2',
};

export default function AdminUserManagementPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [tempPasswordModal, setTempPasswordModal] = useState<{ open: boolean; user: any; password: string }>({
    open: false,
    user: null,
    password: '',
  });

  // Forms state
  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'SALES_REP',
    department: 'Sales Operations',
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    firstName: '',
    lastName: '',
    role: 'SALES_REP',
    department: '',
    isActive: true,
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Load current user and verify ADMIN access
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminUsersApi.list();
      setUsers(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        router.replace('/dashboard');
      } else {
        setErrorMsg('Failed to fetch internal users.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const u = getStoredUser();
    setCurrentUser(u);
    if ((u?.role || '').toUpperCase() !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }
    loadData();
  }, [router, loadData]);

  const loadAuditLogs = async () => {
    try {
      const res = await adminUsersApi.getAuditLogs();
      setAuditLogs(res.data || []);
      setShowAuditDrawer(true);
    } catch {
      setErrorMsg('Failed to load governance audit logs.');
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        selectedRole === 'ALL' || u.role === selectedRole;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'ACTIVE' && u.isActive) ||
        (selectedStatus === 'INACTIVE' && !u.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const managers = users.filter((u) => u.role === 'MANAGER').length;
    const finance = users.filter((u) => u.role === 'FINANCE').length;
    const sales = users.filter((u) => u.role === 'SALES_REP').length;
    const pending = users.filter((u) => !u.isActive).length;
    return { total, admins, managers, finance, sales, pending };
  }, [users]);

  // Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminUsersApi.create(addForm);
      setShowAddModal(false);
      setAddForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'SALES_REP',
        department: 'Sales Operations',
      });
      await loadData();
      setTempPasswordModal({
        open: true,
        user: res.data.user,
        password: res.data.temporaryPassword,
      });
      setSuccessMsg(`User ${res.data.user.email} provisioned successfully.`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create internal user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);
    try {
      await adminUsersApi.update(editForm.id, editForm);
      setShowEditModal(false);
      setSuccessMsg('User profile updated successfully.');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (user: any) => {
    const actionName = user.isActive ? 'deactivate' : 'reactivate';
    if (user.id === currentUser?.id) {
      setErrorMsg('You cannot deactivate your own administrative account.');
      return;
    }
    if (user.role === 'ADMIN' && user.isActive && stats.admins <= 1) {
      setErrorMsg('Cannot deactivate the last remaining active Administrator.');
      return;
    }

    try {
      if (user.isActive) {
        await adminUsersApi.deactivate(user.id);
        setSuccessMsg(`User ${user.email} deactivated.`);
      } else {
        await adminUsersApi.reactivate(user.id);
        setSuccessMsg(`User ${user.email} reactivated.`);
      }
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || `Failed to ${actionName} user.`);
    }
  };

  const openEditModal = (user: any) => {
    setEditForm({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      department: user.department || '',
      isActive: Boolean(user.isActive),
    });
    setErrorMsg(null);
    setShowEditModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Shield size={12} /> Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span style={{ background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
            Sales Manager
          </span>
        );
      case 'FINANCE':
        return (
          <span style={{ background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
            Finance
          </span>
        );
      case 'SALES_REP':
      default:
        return (
          <span style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '3px 9px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
            Sales Rep
          </span>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.canvas, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <HeaderNavbar />

      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 32px 64px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: t.textPrimary, margin: 0, letterSpacing: '-0.02em' }}>
                User Governance &amp; Staff Access
              </h1>
              <span style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                Role: ADMIN
              </span>
            </div>
            <p style={{ fontSize: '14px', color: t.textSecondary, margin: 0 }}>
              Provision internal employee credentials, manage role assignments, and enforce security policies.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={loadAuditLogs}
              style={{
                height: '38px',
                padding: '0 14px',
                borderRadius: '8px',
                background: t.surface,
                border: `1px solid ${t.border}`,
                color: t.textPrimary,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <History size={15} color={t.textSecondary} />
              <span>Audit Trail</span>
            </button>

            <Link
              href="/admin/discount-tiers"
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                background: t.surface,
                border: `1px solid ${t.border}`,
                color: t.textPrimary,
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <Percent size={15} color="#4F46E5" />
              <span>Discount Tiers</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setShowAddModal(true);
              }}
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                background: '#4F46E5',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
                transition: 'background 0.15s ease',
              }}
            >
              <UserPlus size={15} />
              <span>Provision User</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: t.errorSubtle, border: '1px solid #FCA5A5', color: t.error, fontSize: '13.5px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
            <button type="button" onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.error }}>
              <X size={15} />
            </button>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: t.successSubtle, border: '1px solid #86EFAC', color: t.success, fontSize: '13.5px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
            <button type="button" onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.success }}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* Pending Approvals Notice Banner */}
        {stats.pending > 0 && (
          <div style={{ padding: '14px 18px', borderRadius: '10px', background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', boxShadow: '0 1px 3px rgba(217,119,6,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} color="#D97706" style={{ flexShrink: 0 }} />
              <span>
                <strong>{stats.pending} User Registration(s) Pending Approval:</strong> Review new employee applicants below and activate their accounts with the appropriate role assignment.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedStatus('INACTIVE')}
              style={{ padding: '5px 12px', borderRadius: '6px', background: '#D97706', color: '#FFFFFF', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Filter Pending ({stats.pending})
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Internal Staff', count: stats.total, icon: <Users size={18} color="#4F46E5" />, bg: '#EEF2FF' },
            { label: 'Pending Approval', count: stats.pending, icon: <ShieldAlert size={18} color="#D97706" />, bg: '#FEF3C7' },
            { label: 'System Administrators', count: stats.admins, icon: <ShieldCheck size={18} color="#16A34A" />, bg: '#DCFCE7' },
            { label: 'Sales Managers', count: stats.managers, icon: <Briefcase size={18} color="#D97706" />, bg: '#FEF3C7' },
            { label: 'Finance & Treasury', count: stats.finance, icon: <Building size={18} color="#0891B2" />, bg: '#CFFAFE' },
            { label: 'Sales Representatives', count: stats.sales, icon: <UserIcon size={18} color="#64748B" />, bg: '#F1F5F9' },
          ].map((item, idx) => (
            <div key={idx} style={{ background: t.surface, borderRadius: '12px', border: `1px solid ${t.border}`, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: t.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: t.textPrimary, marginTop: '4px' }}>
                  {item.count}
                </div>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation: Backend-Paginated Staff Directory vs Bounded Client-Side Role Specs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              background: activeTab === 'users' ? '#4F46E5' : t.surface,
              color: activeTab === 'users' ? '#FFFFFF' : t.textSecondary,
              border: `1px solid ${activeTab === 'users' ? '#4F46E5' : t.border}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Users size={15} />
            <span>Staff Directory ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              background: activeTab === 'roles' ? '#4F46E5' : t.surface,
              color: activeTab === 'roles' ? '#FFFFFF' : t.textSecondary,
              border: `1px solid ${activeTab === 'roles' ? '#4F46E5' : t.border}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={15} />
            <span>Role Specifications (5 Bounded Roles)</span>
          </button>
        </div>

        {activeTab === 'roles' ? (
          <div style={{ marginBottom: '24px' }}>
            <RoleGovernanceList />
          </div>
        ) : (
          <>
            {/* Filters & Search Bar */}
            <div style={{ background: t.surface, borderRadius: '12px', border: `1px solid ${t.border}`, padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, department..."
                  className="df-input"
                  style={{ width: '100%', height: '36px', fontSize: '13px', paddingLeft: '32px' }}
                />
                <Search size={14} color={t.textMuted} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

          {/* Role Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: t.textMuted, marginRight: '4px' }}>Role:</span>
            {['ALL', 'ADMIN', 'MANAGER', 'FINANCE', 'SALES_REP'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: selectedRole === r ? 700 : 500,
                  background: selectedRole === r ? '#4F46E5' : t.canvas,
                  color: selectedRole === r ? '#FFFFFF' : t.textSecondary,
                  border: `1px solid ${selectedRole === r ? '#4F46E5' : t.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {r === 'ALL' ? 'All Roles' : r === 'MANAGER' ? 'Manager' : r === 'SALES_REP' ? 'Sales Rep' : r}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: t.textMuted }}>Status:</span>
            {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: selectedStatus === st ? 700 : 500,
                  background: selectedStatus === st ? t.textPrimary : t.canvas,
                  color: selectedStatus === st ? '#FFFFFF' : t.textSecondary,
                  border: `1px solid ${selectedStatus === st ? t.textPrimary : t.border}`,
                  cursor: 'pointer',
                }}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div style={{ background: t.surface, borderRadius: '12px', border: `1px solid ${t.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: t.textSecondary }}>
              <Loader2 size={28} className="animate-spin text-indigo-600 mx-auto mb-2" />
              <p style={{ fontSize: '14px' }}>Loading employee directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: t.textMuted }}>
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p style={{ fontSize: '14px', fontWeight: 600, color: t.textPrimary, margin: '0 0 4px' }}>No users match the search criteria</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Try clearing filters or provision a new user account.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: `1px solid ${t.border}` }}>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Staff Member</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role Assigned</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password Policy</th>
                    <th style={{ padding: '12px 18px', fontSize: '12px', fontWeight: 700, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${t.borderSubtle}`, transition: 'background 0.15s ease' }}>
                        {/* Name & Email */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#F1F5F9', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: t.textPrimary }}>
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 600, color: t.textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{u.fullName || `${u.firstName} ${u.lastName}`}</span>
                                {isSelf && (
                                  <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#475569', padding: '1px 5px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                                    You
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: t.textMuted, marginTop: '1px' }}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '14px 18px' }}>
                          {getRoleBadge(u.role)}
                        </td>

                        {/* Department */}
                        <td style={{ padding: '14px 18px', fontSize: '13px', color: t.textSecondary }}>
                          {u.department || 'General'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '14px 18px' }}>
                          {u.isActive ? (
                            <span style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={11} /> Active
                            </span>
                          ) : (
                            <span style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '2px 8px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={11} /> Inactive
                            </span>
                          )}
                        </td>

                        {/* Password Policy */}
                        <td style={{ padding: '14px 18px' }}>
                          {u.mustChangePassword ? (
                            <span style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <KeyRound size={11} /> Force Change
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: t.textMuted }}>Standard</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: t.surface,
                                border: `1px solid ${t.border}`,
                                color: t.textPrimary,
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Edit2 size={12} /> Edit
                            </button>

                            <button
                              type="button"
                              disabled={isSelf}
                              onClick={() => handleToggleActive(u)}
                              title={isSelf ? 'Cannot deactivate yourself' : u.isActive ? 'Deactivate user' : 'Approve & Activate user'}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: u.isActive ? '#FFF1F2' : '#DCFCE7',
                                border: `1px solid ${u.isActive ? '#FECDD3' : '#86EFAC'}`,
                                color: u.isActive ? '#BE123C' : '#15803D',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: isSelf ? 'not-allowed' : 'pointer',
                                opacity: isSelf ? 0.4 : 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {u.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                              <span>{u.isActive ? 'Deactivate' : 'Approve & Activate'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )}
  </main>

      {/* ── Modal 1: Provision New User ───────────────────────────────── */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: t.surface, borderRadius: '16px', padding: '28px 32px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                  <UserPlus size={16} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.textPrimary, margin: 0 }}>Provision Internal User</h2>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.firstName}
                    onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                    placeholder="Vikram"
                    className="df-input"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={addForm.lastName}
                    onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                    placeholder="Malhotra"
                    className="df-input"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="v.malhotra@dealflow360.com"
                  className="df-input"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>Role Assignment *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="df-input"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                >
                  <option value="SALES_REP">Sales Representative (Create/Edit Quotes)</option>
                  <option value="MANAGER">Sales Manager (Level-1 Governance Approvals)</option>
                  <option value="FINANCE">Finance (Level-2 Approvals &amp; Billing)</option>
                  <option value="ADMIN">System Administrator (Full Enterprise Access)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>Department</label>
                <input
                  type="text"
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                  placeholder="Commercial Governance / Enterprise Sales"
                  className="df-input"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#F8FAFC', border: `1px solid ${t.border}`, fontSize: '12px', color: t.textSecondary }}>
                <KeyRound size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                A secure temporary password will be automatically generated. The employee will be forced to change password on first login.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', background: t.canvas, border: `1px solid ${t.border}`, color: t.textPrimary, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#4F46E5', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                >
                  {actionLoading ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Temporary Password Reveal ────────────────────────── */}
      {tempPasswordModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '440px', width: '100%', background: t.surface, borderRadius: '16px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', border: `1px solid ${t.border}`, textAlign: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={24} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: t.textPrimary, margin: '0 0 6px' }}>
              User Provisioned Successfully
            </h3>
            <p style={{ fontSize: '13px', color: t.textSecondary, margin: '0 0 16px' }}>
              Share this one-time temporary password with <strong>{tempPasswordModal.user?.email}</strong>.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', background: '#F1F5F9', border: '1px solid #CBD5E1', marginBottom: '16px' }}>
              <code style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '0.05em' }}>
                {tempPasswordModal.password}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(tempPasswordModal.password)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: copied ? '#16A34A' : '#4F46E5',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p style={{ fontSize: '12px', color: t.textMuted, margin: '0 0 20px', lineHeight: 1.4 }}>
              The employee must sign in with this temporary password and will be prompted to set their permanent password before accessing the platform.
            </p>

            <button
              type="button"
              onClick={() => setTempPasswordModal({ open: false, user: null, password: '' })}
              style={{ width: '100%', height: '38px', borderRadius: '8px', background: t.textPrimary, color: '#fff', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Modal 3: Edit User & Role Reassignment ───────────────────── */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '480px', width: '100%', background: t.surface, borderRadius: '16px', padding: '28px 32px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', border: `1px solid ${t.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}>
                  <Edit2 size={16} />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: t.textPrimary, margin: 0 }}>Edit Staff Profile &amp; Role</h2>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="df-input"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="df-input"
                    style={{ width: '100%', height: '38px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>
                  Role Reassignment
                  {editForm.id === currentUser?.id && (
                    <span style={{ color: t.error, fontSize: '11px', fontWeight: 500, marginLeft: '6px' }}>(Self-modification prohibited)</span>
                  )}
                </label>
                <select
                  disabled={editForm.id === currentUser?.id}
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="df-input"
                  style={{ width: '100%', height: '38px', fontSize: '13px', opacity: editForm.id === currentUser?.id ? 0.6 : 1 }}
                >
                  <option value="SALES_REP">Sales Representative</option>
                  <option value="MANAGER">Sales Manager (Approver)</option>
                  <option value="FINANCE">Finance &amp; Operations</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: t.textPrimary, marginBottom: '5px' }}>Department</label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="df-input"
                  style={{ width: '100%', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: editForm.id === currentUser?.id ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="checkbox"
                    disabled={editForm.id === currentUser?.id}
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#4F46E5' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: t.textPrimary }}>Account is Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', background: t.canvas, border: `1px solid ${t.border}`, color: t.textPrimary, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#4F46E5', border: 'none', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer' }}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Drawer: Audit Logs ───────────────────────────────────────── */}
      {showAuditDrawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '560px', maxWidth: '100%', background: t.surface, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="#4F46E5" />
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: t.textPrimary, margin: 0 }}>Governance Audit Trail</h2>
              </div>
              <button type="button" onClick={() => setShowAuditDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', color: t.textMuted, padding: '40px 0' }}>
                  <History size={32} className="mx-auto mb-2 opacity-50" />
                  <p style={{ fontSize: '14px' }}>No audit trail entries recorded yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {auditLogs.map((log) => (
                    <div key={log.id} style={{ padding: '14px', borderRadius: '10px', background: '#F8FAFC', border: `1px solid ${t.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, background: '#EEF2FF', color: '#4F46E5', padding: '2px 6px', borderRadius: '4px' }}>
                          {log.action}
                        </span>
                        <span style={{ fontSize: '11px', color: t.textMuted }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: t.textPrimary, fontWeight: 500, marginBottom: '4px' }}>
                        Actor: <strong>{log.actorEmail}</strong> &rarr; Target: <strong>{log.targetEmail}</strong>
                      </div>
                      {log.oldValue && (
                        <div style={{ fontSize: '12px', color: t.textSecondary }}>
                          Old: <span style={{ color: t.error }}>{log.oldValue}</span>
                        </div>
                      )}
                      {log.newValue && (
                        <div style={{ fontSize: '12px', color: t.textSecondary }}>
                          New: <span style={{ color: t.success }}>{log.newValue}</span>
                        </div>
                      )}
                      {log.notes && (
                        <div style={{ fontSize: '11.5px', color: t.textMuted, marginTop: '4px', fontStyle: 'italic' }}>
                          {log.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
