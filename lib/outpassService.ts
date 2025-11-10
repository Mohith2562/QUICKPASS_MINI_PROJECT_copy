type HistoryStatusFilter = 'all' | 'approved' | 'rejected' | 'cancelled'
type HistorySortOrder = 'newest' | 'oldest'

export type HistoryFilters = {
  page?: number
  limit?: number
  status?: HistoryStatusFilter
  sort?: HistorySortOrder
  month?: string
  startDate?: string
  endDate?: string
}

export type OutpassHistoryRecord = {
  id: string
  requestId: string
  reasonCategory: string
  reason: string
  status: string
  requestedAt?: string
  lastUpdatedAt?: string
  exitTime?: string
  returnTime?: string
  supportingDocumentUrl?: string | null
  rejectionReason?: string | null
  approvalNotes?: string[] | null
  approvedBy?: string | null
  teacherApprovedAt?: string | null
  hodApprovedAt?: string | null
  metadata?: Record<string, unknown>
}

export type OutpassHistorySummary = {
  total: number
  approved: number
  rejected: number
  cancelled: number
}

export type OutpassHistoryPagination = {
  currentPage: number
  totalPages: number
  totalRecords: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type OutpassHistoryResponse = {
  records: OutpassHistoryRecord[]
  summary: OutpassHistorySummary
  pagination: OutpassHistoryPagination
}

const DEFAULT_SUMMARY: OutpassHistorySummary = {
  total: 0,
  approved: 0,
  rejected: 0,
  cancelled: 0
}

const normalizeStatus = (status?: string): string => {
  if (!status) return 'unknown'
  if (status === 'cancelled_by_student') return 'cancelled'
  return status
}

const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') as string) || 'http://localhost:5000'

const buildQueryParams = (filters: HistoryFilters = {}) => {
  const params = new URLSearchParams()

  if (filters.page !== undefined) params.set('page', String(filters.page))
  if (filters.limit !== undefined) params.set('limit', String(filters.limit))
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.sort) params.set('sort', filters.sort)

  if (filters.month) {
    const [year, month] = filters.month.split('-')
    if (year) params.set('year', year)
    if (month) params.set('month', month)
  } else {
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
  }

  return params.toString()
}

const mapHistoryRecord = (record: any): OutpassHistoryRecord => {
  const requestId = sanitizeString(record?.requestId || record?._id || '')

  return {
    id: requestId,
    requestId,
    reasonCategory: sanitizeString(record?.reasonCategory || 'General'),
    reason: sanitizeString(record?.reason || record?.reasonDescription || ''),
    status: normalizeStatus(record?.status),
    requestedAt: sanitizeString(record?.requestedAt || record?.createdAt || ''),
    lastUpdatedAt: sanitizeString(record?.lastUpdatedAt || record?.updatedAt || ''),
    exitTime: sanitizeString(record?.exitTime || record?.dateFrom || ''),
    returnTime: sanitizeString(record?.returnTime || record?.dateTo || ''),
    supportingDocumentUrl: record?.supportingDocumentUrl ?? null,
    rejectionReason: record?.rejectionReason ?? null,
    approvalNotes: record?.approvalNotes ?? null,
    approvedBy: record?.approvedBy ?? null,
    teacherApprovedAt: record?.teacherApprovedAt ?? null,
    hodApprovedAt: record?.hodApprovedAt ?? null,
    metadata: record ?? {}
  }
}

const derivePagination = (
  incoming: any,
  fallback: { page?: number; limit?: number; total?: number }
): OutpassHistoryPagination => {
  const currentPage =
    Number(incoming?.currentPage ?? fallback.page ?? 1) || 1

  const limit = Number(incoming?.limit ?? fallback.limit ?? fallback.total ?? 0) || 0
  const totalRecords =
    Number(incoming?.totalRecords ?? incoming?.total ?? fallback.total ?? 0) || 0

  const totalPages =
    Number(incoming?.totalPages ??
      (limit > 0 ? Math.max(1, Math.ceil(totalRecords / limit)) : totalRecords ? 1 : 0)) || 0

  const hasNextPage =
    Boolean(
      incoming?.hasNextPage ??
        (totalPages > 0 ? currentPage < totalPages : false)
    )
  const hasPrevPage =
    Boolean(
      incoming?.hasPrevPage ??
        (totalPages > 0 ? currentPage > 1 : false)
    )

  return {
    currentPage,
    totalPages,
    totalRecords,
    hasNextPage,
    hasPrevPage
  }
}

const parseHistoryResponse = (
  raw: any,
  context: { filters: HistoryFilters }
): OutpassHistoryResponse => {
  const recordsSource =
    raw?.data?.applications ??
    raw?.data?.outpasses ??
    raw?.outpasses ??
    raw?.records ??
    []

  const records = Array.isArray(recordsSource)
    ? recordsSource.map(mapHistoryRecord)
    : []

  const fullRecordCount = Array.isArray(recordsSource) ? recordsSource.length : records.length

  let paginatedRecords = records

  const hasServerPagination = Boolean(raw?.data?.pagination || raw?.pagination)

  if (!hasServerPagination && context.filters.limit && context.filters.limit > 0) {
    const page = context.filters.page && context.filters.page > 0 ? context.filters.page : 1
    const startIndex = (page - 1) * context.filters.limit
    const endIndex = startIndex + context.filters.limit
    paginatedRecords = records.slice(startIndex, endIndex)
  }

  const summarySource =
    raw?.data?.summary ??
    raw?.summary ??
    DEFAULT_SUMMARY

  const summary: OutpassHistorySummary = {
    total: Number(summarySource?.total ?? records.length) || 0,
    approved: Number(summarySource?.approved ?? 0) || 0,
    rejected: Number(summarySource?.rejected ?? 0) || 0,
    cancelled: Number(summarySource?.cancelled ?? summarySource?.canceled ?? 0) || 0
  }

  const pagination = derivePagination(
    raw?.data?.pagination ?? raw?.pagination,
    {
      page: context.filters.page,
      limit: context.filters.limit,
      total:
        Number(raw?.data?.pagination?.totalRecords ??
          raw?.count ??
          fullRecordCount) || fullRecordCount
    }
  )

  return { records: paginatedRecords, summary, pagination }
}

export const outpassService = {
  async getHistory(filters: HistoryFilters = {}, token?: string): Promise<OutpassHistoryResponse> {
    const apiBase = getApiBaseUrl()
    const query = buildQueryParams(filters)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    const resolvedToken =
      token ??
      (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

    if (resolvedToken) {
      headers.Authorization = `Bearer ${resolvedToken}`
    }

    const response = await fetch(
      `${apiBase}/api/outpass/history${query ? `?${query}` : ''}`,
      {
        headers,
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null)
      const message =
        errorBody?.message ||
        errorBody?.error ||
        `Failed to fetch outpass history (status ${response.status})`
      throw new Error(message)
    }

    const json = await response.json().catch(() => ({}))
    return parseHistoryResponse(json, { filters })
  }
}


