'use client';
import { useState } from 'react';
import { useClientTable, ClientSortHeader, ClientPaginationBar, ClientSearchBar } from '@/hooks/useClientTable';
import { CheckCircle2, Clock, ShieldCheck, UserCheck, AlertTriangle, ArrowRight, Layers } from 'lucide-react';

/**
 * ============================================================================
 * ARCHITECTURE NOTICE: CLIENT-SIDE DATA MANAGEMENT (BOUNDED STEPPER DATASET)
 * ============================================================================
 * Approval workflow steps (Submitted -> Sales Manager -> Finance -> Confirmed)
 * represent a small, fixed, config-like governance sequence (strictly 4–6 steps).
 * Because the stepper rules do not dynamically scale into thousands of transactional rows,
 * the step definitions are loaded in-memory once, and searching, sorting, and pagination
 * execute entirely client-side (filter first -> sort second -> paginate last).
 *
 * (Transactional approval queues on the other hand remain server-side paginated).
 * ============================================================================
 */

export interface StepperStepItem {
  id: string;
  order: number;
  name: string;
  stage: string;
  approverRole: string;
  requiredCondition: string;
  slaHours: number;
  policyScope: string;
  isMandatory: boolean;
  statusPreview: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'OPTIONAL';
}

export const APPROVAL_STEPPER_STEPS: StepperStepItem[] = [
  {
    id: 'STEP-1-SUBMISSION',
    order: 1,
    name: 'Draft Authoring & Submission',
    stage: 'Submitted',
    approverRole: 'Sales Representative',
    requiredCondition: 'Quotation created with valid customer and product lines',
    slaHours: 0,
    policyScope: 'Standard quote creation (No approval threshold needed if discount <= Tier limit)',
    isMandatory: true,
    statusPreview: 'COMPLETED',
  },
  {
    id: 'STEP-2-MANAGER',
    order: 2,
    name: 'Sales Manager Tier-1 Review',
    stage: 'Sales Manager',
    approverRole: 'Sales Manager / Regional Lead',
    requiredCondition: 'Line item discount exceeds standard policy ceiling by 1%–15%',
    slaHours: 24,
    policyScope: 'Commercial margin check, delivery timeline validation, backorder risk review',
    isMandatory: true,
    statusPreview: 'IN_PROGRESS',
  },
  {
    id: 'STEP-3-FINANCE',
    order: 3,
    name: 'Finance & Controller Tier-2 Sign-Off',
    stage: 'Finance',
    approverRole: 'VP of Finance & CFO Office',
    requiredCondition: 'High risk deal: discount > 20%, order value > ₹10,00,000, or negative margin',
    slaHours: 48,
    policyScope: 'EBITDA impact, payment term risk (Net 60+), revenue recognition compliance',
    isMandatory: false,
    statusPreview: 'PENDING',
  },
  {
    id: 'STEP-4-CONFIRMED',
    order: 4,
    name: 'Customer Final Acceptance',
    stage: 'Confirmed',
    approverRole: 'Customer Procurement Lead',
    requiredCondition: 'Digital signature on portal or manual signed order acceptance',
    slaHours: 72,
    policyScope: 'Legally binding order confirmation and automatic warehouse fulfillment split',
    isMandatory: true,
    statusPreview: 'PENDING',
  },
];

export function ApprovalStepperInspector({
  currentActiveStep = 'Sales Manager',
}: {
  currentActiveStep?: string;
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
  } = useClientTable<StepperStepItem>({
    data: APPROVAL_STEPPER_STEPS,
    searchFields: (item) => [item.name, item.stage, item.approverRole, item.requiredCondition, item.policyScope],
    initialSort: { key: 'order', direction: 'asc' },
    sortExtractors: {
      order: (item) => item.order,
      slaHours: (item) => item.slaHours,
      name: (item) => item.name,
      stage: (item) => item.stage,
    },
    initialPageSize: 4,
    pageSizeOptions: [4, 8, 12],
    debounceMs: 300,
  });

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} className="text-indigo-600" />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary, #1F1F1C)' }}>
              Governance Approval Stepper Protocol
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #4B4B42)', margin: '2px 0 0' }}>
              Bounded sequential workflow (Submitted → Manager → Finance → Confirmed)
            </p>
          </div>
        </div>

        <ClientSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search step name, approver role, trigger condition..."
          isSearching={isSearching}
          totalCount={totalRawCount}
          filteredCount={totalFilteredCount}
        />
      </div>

      {/* Stepper Visual Pills */}
      <div style={{ padding: '16px 20px', background: '#F8FAFC', borderBottom: '1px solid var(--border, #DCDCD9)', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
        {APPROVAL_STEPPER_STEPS.map((s, idx) => {
          const isCurrent = s.stage === currentActiveStep;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: isCurrent ? '#EEF2FF' : '#FFFFFF',
                  border: isCurrent ? '1.5px solid #4F46E5' : '1px solid var(--border, #DCDCD9)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isCurrent ? '#4F46E5' : 'var(--text-secondary, #4B4B42)',
                }}
              >
                <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: isCurrent ? '#4F46E5' : '#E2E8F0', color: isCurrent ? '#FFFFFF' : '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                  {s.order}
                </span>
                <span>{s.stage}</span>
              </div>
              {idx < APPROVAL_STEPPER_STEPS.length - 1 && <ArrowRight size={14} style={{ color: '#94A3B8' }} />}
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border, #DCDCD9)' }}>
              <ClientSortHeader label="Seq" sortKey="order" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="center" style={{ width: '60px' }} />
              <ClientSortHeader label="Stage / Step Name" sortKey="name" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
              <ClientSortHeader label="Authorized Reviewer" sortKey="approverRole" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} />
              <ClientSortHeader label="SLA Window" sortKey="slaHours" currentSortKey={sortConfig.key as string} currentDirection={sortConfig.direction} onSort={toggleSort} align="center" />
              <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary, #4B4B42)' }}>
                Trigger Condition & Policy Scope
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((step) => {
              const isCurrent = step.stage === currentActiveStep;
              return (
                <tr
                  key={step.id}
                  style={{
                    borderBottom: '1px solid var(--border, #DCDCD9)',
                    background: isCurrent ? 'rgba(79, 70, 229, 0.03)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Sequence */}
                  <td style={{ padding: '14px 18px', textAlign: 'center', fontWeight: 700 }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      {step.order}
                    </span>
                  </td>

                  {/* Stage & Name */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: isCurrent ? '#4F46E5' : 'var(--text-primary, #1F1F1C)' }}>
                      {step.name}
                    </div>
                    <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Stage: {step.stage}
                    </span>
                  </td>

                  {/* Reviewer */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary, #4B4B42)' }}>
                      {step.approverRole}
                    </div>
                    <span style={{ fontSize: '11px', color: step.isMandatory ? '#15803D' : '#92400E' }}>
                      {step.isMandatory ? '● Mandatory Gate' : '○ Risk Exception Gate'}
                    </span>
                  </td>

                  {/* SLA */}
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#FEF3C7', color: '#92400E', padding: '2px 7px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                      <Clock size={12} /> {step.slaHours === 0 ? 'Instant' : `${step.slaHours}h SLA`}
                    </span>
                  </td>

                  {/* Condition & Scope */}
                  <td style={{ padding: '14px 18px', maxWidth: '340px' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-primary, #1F1F1C)', fontWeight: 500 }}>
                      {step.requiredCondition}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #91918F)', marginTop: '2px' }}>
                      {step.policyScope}
                    </div>
                  </td>
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
        entityName="stepper steps"
      />
    </div>
  );
}
