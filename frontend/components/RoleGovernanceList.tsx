'use client';
import { useState } from 'react';
import { useClientTable, ClientSortHeader, ClientPaginationBar, ClientSearchBar } from '@/hooks/useClientTable';
import { Shield, User, Briefcase, Settings, Store, Check, Info } from 'lucide-react';

/**
 * ============================================================================
 * ARCHITECTURE NOTICE: CLIENT-SIDE DATA MANAGEMENT (BOUNDED DATASET)
 * ============================================================================
 * The system role hierarchy (ADMIN, MANAGER, FINANCE, SALES_REP, CUSTOMER) is a
 * small, fixed, config-like dataset (strictly 5 defined enterprise roles).
 * Because roles do not dynamically grow into thousands of transactional records,
 * this component loads the full role specification once and performs all searching,
 * sorting, and pagination entirely on the client (filter first -> sort second -> paginate last).
 * ============================================================================
 */

export interface SystemRoleItem {
  id: string;
  name: string;
  label: string;
  hierarchyRank: number;
  category: 'Internal Staff' | 'Customer External';
  description: string;
  permissionsCount: number;
  keyCapabilities: string[];
}

export const SYSTEM_ROLES: SystemRoleItem[] = [
  {
    id: 'ADMIN',
    name: 'ADMIN',
    label: 'System Administrator',
    hierarchyRank: 1,
    category: 'Internal Staff',
    description: 'Full platform governance override, user provisioning, security audit logs, discount policies',
    permissionsCount: 12,
    keyCapabilities: ['User Provisioning & Deactivation', 'Discount Tier Policies', 'Audit Logs Inspection', 'Global Approval Override'],
  },
  {
    id: 'MANAGER',
    name: 'MANAGER',
    label: 'Sales Manager / Approver',
    hierarchyRank: 2,
    category: 'Internal Staff',
    description: 'Tier-1 commercial discount approvals, margin exceptions, team deals supervision, warehouse split',
    permissionsCount: 8,
    keyCapabilities: ['Tier-1 Discount Approvals', 'Team Deal Pipeline', 'Fulfillment Execution', 'SLA Exception Overrides'],
  },
  {
    id: 'FINANCE',
    name: 'FINANCE',
    label: 'Finance Lead & Controller',
    hierarchyRank: 3,
    category: 'Internal Staff',
    description: 'Tier-2 CFO high-risk discount approvals, invoices & A/R tracking, subscription billing',
    permissionsCount: 9,
    keyCapabilities: ['Tier-2 High Risk Approvals', 'Invoices & A/R Ledgers', 'Subscription MRR Tracking', 'Fulfillment Backorders'],
  },
  {
    id: 'SALES_REP',
    name: 'SALES_REP',
    label: 'Sales Representative',
    hierarchyRank: 4,
    category: 'Internal Staff',
    description: 'Direct CPQ quotation authoring, customer deal tracking, product variant configuration',
    permissionsCount: 5,
    keyCapabilities: ['Create & Send Quotations', 'Add Product Lines & Variants', 'Negotiation Chat & Comments', 'Customer Directory View'],
  },
  {
    id: 'CUSTOMER',
    name: 'CUSTOMER',
    label: 'Customer Procurement',
    hierarchyRank: 5,
    category: 'Customer External',
    description: 'Customer self-service portal, quote inspection, discount counter-proposals, digital sign-off',
    permissionsCount: 3,
    keyCapabilities: ['View Assigned Quotations', 'Submit Discount Counter-Offers', 'Execute Binding Digital Acceptance'],
  },
];

export function RoleGovernanceList({
  selectedRole,
  onSelectRole,
  mode = 'embedded',
}: {
  selectedRole?: string;
  onSelectRole?: (roleId: string) => void;
  mode?: 'embedded' | 'standalone';
}) {
  const {
    paginatedData,
    totalRawCount,
    totalFilteredCount,
    totalPages,
    searchQuery,
    setSearchQuery,
    isSearching,
    sortConfig,
    toggleSort,
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    pageSizeOptions,
  } = useClientTable<SystemRoleItem>({
    data: SYSTEM_ROLES,
    searchFields: (item) => [item.id, item.label, item.description, item.category, ...item.keyCapabilities],
    initialSort: { key: 'hierarchyRank', direction: 'asc' },
    sortExtractors: {
      hierarchyRank: (item) => item.hierarchyRank,
      permissionsCount: (item) => item.permissionsCount,
      name: (item) => item.name,
      label: (item) => item.label,
    },
    initialPageSize: 5,
    pageSizeOptions: [5, 10],
    debounceMs: 300,
  });

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'ADMIN':
        return <Settings size={16} className="text-purple-600" />;
      case 'MANAGER':
        return <Briefcase size={16} className="text-blue-600" />;
      case 'FINANCE':
        return <Shield size={16} className="text-emerald-600" />;
      case 'CUSTOMER':
        return <Store size={16} className="text-amber-600" />;
      default:
        return <User size={16} className="text-indigo-600" />;
    }
  };

  return (
    <div className="df-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header & Search */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border, #DCDCD9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#FFFFFF',
        }}
      >
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #1F1F1C)' }}>
            System Role Definitions & Privileges
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary, #4B4B42)', margin: '2px 0 0' }}>
            Bounded RBAC catalog with client-side sorting and 300ms debounced search
          </p>
        </div>

        <ClientSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search roles, permissions, capabilities..."
          isSearching={isSearching}
          totalCount={totalRawCount}
          filteredCount={totalFilteredCount}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border, #DCDCD9)' }}>
              <ClientSortHeader label="Role & Identifier" sortKey="name" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
              <ClientSortHeader label="Rank" sortKey="hierarchyRank" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="center" />
              <ClientSortHeader label="Category" sortKey="category" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
              <ClientSortHeader label="Granted Privileges" sortKey="permissionsCount" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="center" />
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary, #4B4B42)' }}>
                Key Capabilities
              </th>
              {onSelectRole && (
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary, #4B4B42)' }}>
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <tr
                  key={role.id}
                  style={{
                    borderBottom: '1px solid var(--border, #DCDCD9)',
                    background: isSelected ? '#EEF2FF' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Role Name */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {getRoleIcon(role.id)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary, #1F1F1C)' }}>{role.label}</div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted, #91918F)' }}>{role.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Rank */}
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, background: '#F1F5F9', padding: '2px 8px', borderRadius: '4px', color: '#334155' }}>
                      Level {role.hierarchyRank}
                    </span>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: '12px', color: role.category === 'Internal Staff' ? '#1E40AF' : '#92400E', fontWeight: 600, background: role.category === 'Internal Staff' ? '#DBEAFE' : '#FEF3C7', padding: '2px 8px', borderRadius: '4px' }}>
                      {role.category}
                    </span>
                  </td>

                  {/* Permissions Count */}
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#4F46E5', fontSize: '13px' }}>
                      {role.permissionsCount} actions
                    </span>
                  </td>

                  {/* Key Capabilities */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '380px' }}>
                      {role.keyCapabilities.map((cap, idx) => (
                        <span key={idx} style={{ fontSize: '11px', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                          {cap}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Selection Action */}
                  {onSelectRole && (
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onSelectRole(role.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: isSelected ? '1px solid #4F46E5' : '1px solid var(--border, #DCDCD9)',
                          background: isSelected ? '#4F46E5' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : 'var(--text-primary, #1F1F1C)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isSelected ? <><Check size={12} /> Selected</> : 'Select Role'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <ClientPaginationBar
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalItems={totalFilteredCount}
        totalPages={totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        pageSizeOptions={pageSizeOptions}
        entityName="system roles"
      />
    </div>
  );
}
