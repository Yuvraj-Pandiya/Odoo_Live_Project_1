'use client';
import { useState, useMemo, useEffect, useTransition } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

/**
 * ============================================================================
 * ARCHITECTURE NOTICE: CLIENT-SIDE DATA MANAGEMENT (BOUNDED CONFIG DATASETS)
 * ============================================================================
 * Some datasets in DealFlow360 are small, fixed, and config-like by design
 * (e.g. Discount Tiers, System Roles, Approval Stepper Steps, Physical Warehouses,
 * and Subscription Plans). Because these collections are strictly bounded (<200 items),
 * fetching the complete dataset once and performing Debounced Searching (300ms),
 * Client-Side Sorting, and In-Memory Pagination eliminates redundant network round-trips
 * while guaranteeing instantaneous UI interactivity.
 *
 * UNBOUNDED BUSINESS DATASETS (Quotations, Approvals Queue, Invoices, Admin User Directory)
 * MUST NEVER USE THIS PATTERN and MUST REMAIN SERVER-PAGINATED.
 *
 * Composition Order:
 * 1. FILTER FIRST: Case-insensitive substring search matching across specified fields.
 * 2. SORT SECOND: In-memory comparator with ascending/descending toggle.
 * 3. PAGINATE LAST: Array slicing [pageIndex * pageSize, (pageIndex + 1) * pageSize].
 * ============================================================================
 */

export interface SortConfig<T> {
  key: keyof T | string | null;
  direction: 'asc' | 'desc';
}

export interface UseClientTableOptions<T> {
  data: T[];
  searchFields?: ((item: T) => (string | number | boolean | null | undefined)[]) | (keyof T)[];
  initialSort?: {
    key: keyof T | string;
    direction?: 'asc' | 'desc';
  };
  sortExtractors?: Record<string, (item: T) => any>;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  debounceMs?: number;
}

export function useClientTable<T extends Record<string, any>>({
  data,
  searchFields,
  initialSort,
  sortExtractors = {},
  initialPageSize = 5,
  pageSizeOptions = [5, 10, 25, 50],
  debounceMs = 300,
}: UseClientTableOptions<T>) {
  // 1. Search Query & Debounce State
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(rawQuery);
      });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [rawQuery, debounceMs]);

  // 2. Sort State
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialSort?.key ?? null,
    direction: initialSort?.direction ?? 'asc',
  });

  // 3. Pagination State
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset pageIndex when filter query changes
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedQuery, pageSize]);

  // ── Step 1: Filter First ──────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) return data;
    const query = debouncedQuery.toLowerCase().trim();

    return data.filter((item) => {
      if (typeof searchFields === 'function') {
        const values = searchFields(item);
        return values.some((val) => val != null && String(val).toLowerCase().includes(query));
      }

      if (Array.isArray(searchFields) && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val != null && String(val).toLowerCase().includes(query);
        });
      }

      // Default: Search all string and number values of the object
      return Object.values(item).some(
        (val) => val != null && (typeof val === 'string' || typeof val === 'number') && String(val).toLowerCase().includes(query)
      );
    });
  }, [data, debouncedQuery, searchFields]);

  // ── Step 2: Sort Second ───────────────────────────────────────────────────
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;
    const keyStr = String(key);
    const extractor = sortExtractors[keyStr];

    return [...filteredData].sort((a, b) => {
      const aVal = extractor ? extractor(a) : a[key as keyof T];
      const bVal = extractor ? extractor(b) : b[key as keyof T];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === 'asc' ? -1 : 1;
      if (bVal == null) return direction === 'asc' ? 1 : -1;

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Boolean comparison
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return direction === 'asc' ? (aVal === bVal ? 0 : aVal ? 1 : -1) : (aVal === bVal ? 0 : aVal ? -1 : 1);
      }

      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        return direction === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortConfig, sortExtractors]);

  // ── Step 3: Paginate Last ─────────────────────────────────────────────────
  const totalFilteredCount = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  // Guard against out of range page
  const safePageIndex = Math.min(pageIndex, totalPages - 1);

  const paginatedData = useMemo(() => {
    const start = safePageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePageIndex, pageSize]);

  // Toggle sort direction helper
  const toggleSort = (key: keyof T | string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  return {
    // Processed data
    paginatedData,
    allFilteredData: sortedData,
    totalRawCount: data.length,
    totalFilteredCount,
    totalPages,

    // Search
    searchQuery: rawQuery,
    setSearchQuery: setRawQuery,
    debouncedQuery,
    isSearching: isPending || rawQuery !== debouncedQuery,

    // Sort
    sortConfig,
    setSortConfig,
    toggleSort,

    // Pagination
    pageIndex: safePageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    pageSizeOptions,
  };
}

/**
 * Reusable Sortable Column Header Component
 */
export function ClientSortHeader({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  onSort,
  align = 'left',
  style = {},
}: {
  label: string;
  sortKey: string;
  currentSortKey: string | null;
  currentDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}) {
  const isSorted = currentSortKey === sortKey;

  return (
    <th
      onClick={() => onSort(sortKey)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        textAlign: align,
        padding: '12px 16px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: isSorted ? '#4F46E5' : 'var(--text-secondary, #4B4B42)',
        background: isSorted ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
        transition: 'all 0.15s ease',
        ...style,
      }}
      title={`Click to sort by ${label} (${isSorted && currentDirection === 'asc' ? 'descending' : 'ascending'})`}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        }}
      >
        <span>{label}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          {isSorted ? (
            currentDirection === 'asc' ? (
              <ChevronUp size={14} className="text-indigo-600 stroke-[2.5]" />
            ) : (
              <ChevronDown size={14} className="text-indigo-600 stroke-[2.5]" />
            )
          ) : (
            <ChevronsUpDown size={13} style={{ opacity: 0.35 }} />
          )}
        </span>
      </div>
    </th>
  );
}

/**
 * Reusable DealFlow360 Pagination Controls Component
 */
export function ClientPaginationBar({
  pageIndex,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  entityName = 'items',
}: {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  entityName?: string;
}) {
  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderTop: '1px solid var(--border, #DCDCD9)',
        background: '#FFFFFF',
        fontSize: '13px',
        color: 'var(--text-secondary, #4B4B42)',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {/* Left: Summary and Page Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <span>
          Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{totalItems}</strong> {entityName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #91918F)' }}>Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border, #DCDCD9)',
              background: '#FFFFFF',
              color: 'var(--text-primary, #1F1F1C)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border, #DCDCD9)',
            background: pageIndex === 0 ? '#F5F5F3' : '#FFFFFF',
            color: pageIndex === 0 ? '#A2A0A1' : 'var(--text-primary, #1F1F1C)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <ChevronLeft size={14} /> Previous
        </button>

        {/* Page pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {Array.from({ length: totalPages }, (_, i) => {
            const isCurrent = i === pageIndex;
            // Only render up to 5 surrounding pages if total is large
            if (totalPages > 7 && Math.abs(i - pageIndex) > 2 && i !== 0 && i !== totalPages - 1) {
              if (Math.abs(i - pageIndex) === 3) {
                return <span key={i} style={{ padding: '0 4px', color: '#91918F' }}>…</span>;
              }
              return null;
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => onPageChange(i)}
                style={{
                  minWidth: '28px',
                  height: '28px',
                  padding: '0 6px',
                  borderRadius: '6px',
                  border: isCurrent ? '1px solid #4F46E5' : '1px solid var(--border, #DCDCD9)',
                  background: isCurrent ? '#4F46E5' : '#FFFFFF',
                  color: isCurrent ? '#FFFFFF' : 'var(--text-primary, #1F1F1C)',
                  fontSize: '12px',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages - 1}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border, #DCDCD9)',
            background: pageIndex >= totalPages - 1 ? '#F5F5F3' : '#FFFFFF',
            color: pageIndex >= totalPages - 1 ? '#A2A0A1' : 'var(--text-primary, #1F1F1C)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: pageIndex >= totalPages - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Reusable Client Search Input with 300ms Debounce Indicator
 */
export function ClientSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  isSearching = false,
  totalCount,
  filteredCount,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isSearching?: boolean;
  totalCount?: number;
  filteredCount?: number;
}) {
  return (
    <div style={{ position: 'relative', minWidth: '240px', maxWidth: '380px', width: '100%' }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted, #91918F)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px 8px 36px',
          borderRadius: '8px',
          border: '1px solid var(--border, #DCDCD9)',
          background: '#FFFFFF',
          fontSize: '13px',
          color: 'var(--text-primary, #1F1F1C)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border, #DCDCD9)')}
      />
      {value && (
        <span
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '11px',
            fontWeight: 600,
            color: '#4F46E5',
            background: '#EEF2FF',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {filteredCount != null && totalCount != null ? `${filteredCount}/${totalCount}` : 'Filtered'}
        </span>
      )}
    </div>
  );
}
