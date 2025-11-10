type PendingStatusFilter = 'pending' | 'urgent'
type SortOrder = 'newest' | 'oldest'

export type OutpassApplication = {
  _id: string
  applicationId: string
  status: string
  submittedAt: string
  studentInfo: {
    id?: string
    name: string
    rollNumber: string
    department: string
    attendancePercentage: number | null
  }
  requestDetails: {
    reasonCategory: string
    detailedReason: string
    exitDate: string
    exitTime: string
    returnDate: string
    returnTime: string
  }
  parentContacts: {
    primaryContact: string | null
    secondaryContact?: string | null
  }
  metadata?: {
    isEmergency?: boolean
    priority?: 'urgent' | 'normal'
    raw?: any
  }
}

export type PendingRequestsFilters = {
  page?: number
  limit?: number
  status?: PendingStatusFilter
  search?: string
  sortOrder?: SortOrder
}

type PendingRequestsSummary = {
  totalPending: number
  urgentRequests: number
  normalRequests: number
  parentVerificationPending: number
}

type PendingRequestsPagination = {
  currentPage: number
  totalPages: number
  totalRecords: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

type PendingRequestsSuccess = {
  success: true
  data: {
    requests: OutpassApplication[]
    pagination: PendingRequestsPagination
    summary: PendingRequestsSummary
  }
}

type PendingRequestsFailure = {
  success: false
  error: string
}

export type PendingRequestsResponse = PendingRequestsSuccess | PendingRequestsFailure

type ProcessAction = 'approve' | 'reject'

type ProcessPayload = {
  notes?: string
}

type ProcessResponse =
  | { success: true; data: any }
  | { success: false; error: string }

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') as string) || 'http://localhost:5000'

const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('token')
}

const getAuthHeaders = () => {
  const token = getAuthToken()
  if (!token) {
    return null
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
}

const normalizeStatus = (status?: string): string => {
  if (!status) return 'pending'
  const map: Record<string, string> = {
    pending_faculty: 'pending',
    pending_hod: 'under_review',
    under_review: 'under_review',
    pending: 'pending',
    urgent: 'urgent'
  }
  return map[status] ?? status
}

const parseDateParts = (value?: string) => {
  if (!value) {
    const now = new Date()
    return {
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    }
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return {
      date: value,
      time: value
    }
  }
  return {
    date: date.toISOString().split('T')[0],
    time: date.toTimeString().slice(0, 5)
  }
}

const detectEmergency = (record: any) => {
  const category = String(record?.reasonCategory || record?.reason || '').toLowerCase()
  const reason = String(record?.reason || record?.requestDetails?.detailedReason || '').toLowerCase()
  const emergencyKeywords = ['emergency', 'urgent', 'accident', 'sudden', 'fever', 'hospital']
  return emergencyKeywords.some(keyword => category.includes(keyword) || reason.includes(keyword))
}

const mapOutpassToApplication = (record: any): OutpassApplication => {
  const normalizedStatus = normalizeStatus(record?.status)
  const student = record?.student || record?.studentId || {}
  const classInfo = student?.class || {}
  const department = classInfo?.department

  const submittedAt = record?.createdAt || record?.submittedAt || new Date().toISOString()
  const exitParts = parseDateParts(record?.dateFrom)
  const returnParts = parseDateParts(record?.dateTo)

  const isEmergency = detectEmergency(record)

  return {
    _id: record?._id || record?.id || '',
    applicationId: record?.requestId || record?._id || record?.id || '',
    status: isEmergency ? 'urgent' : normalizedStatus,
    submittedAt,
    studentInfo: {
      id: student?._id || student?.id,
      name: student?.name || 'Unknown Student',
      rollNumber: student?.rollNumber || 'N/A',
      department:
        department?.name ||
        classInfo?.name ||
        student?.department ||
        record?.department ||
        'Unknown Department',
      attendancePercentage:
        typeof record?.attendanceAtApply === 'number'
          ? record.attendanceAtApply
          : typeof student?.attendancePercentage === 'number'
          ? student.attendancePercentage
          : null
    },
    requestDetails: {
      reasonCategory: record?.reasonCategory || record?.requestDetails?.reasonCategory || 'General',
      detailedReason: record?.reason || record?.requestDetails?.detailedReason || 'Not provided',
      exitDate: exitParts.date,
      exitTime: exitParts.time,
      returnDate: returnParts.date,
      returnTime: returnParts.time
    },
    parentContacts: {
      primaryContact:
        record?.parentContact ||
        student?.primaryParentPhone ||
        student?.parentPhone ||
        record?.alternateContact ||
        null,
      secondaryContact: student?.secondaryParentPhone || null
    },
    metadata: {
      isEmergency,
      priority: isEmergency ? 'urgent' : 'normal',
      raw: record
    }
  }
}

const applySearchFilter = (requests: OutpassApplication[], search?: string) => {
  if (!search) return requests
  const query = search.toLowerCase()
  return requests.filter(request => {
    const parts = [
      request.studentInfo.name,
      request.studentInfo.rollNumber,
      request.requestDetails.reasonCategory,
      request.requestDetails.detailedReason
    ]
    return parts.some(part => part?.toLowerCase?.().includes(query))
  })
}

const applyStatusFilter = (requests: OutpassApplication[], status?: PendingStatusFilter) => {
  if (!status) return requests
  if (status === 'urgent') {
    return requests.filter(request => request.status === 'urgent' || request.metadata?.priority === 'urgent')
  }
  return requests.filter(request => request.status !== 'urgent')
}

const applySort = (requests: OutpassApplication[], sortOrder: SortOrder = 'newest') => {
  const sorted = [...requests].sort((a, b) => {
    const dateA = new Date(a.submittedAt).getTime()
    const dateB = new Date(b.submittedAt).getTime()
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
  })
  return sorted
}

const paginate = (requests: OutpassApplication[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  return requests.slice(startIndex, endIndex)
}

const buildSummary = (requests: OutpassApplication[]): PendingRequestsSummary => {
  const urgentRequests = requests.filter(
    request => request.status === 'urgent' || request.metadata?.priority === 'urgent'
  ).length

  const parentVerificationPending = requests.filter(request => request.status === 'pending').length

  return {
    totalPending: requests.length,
    urgentRequests,
    normalRequests: requests.length - urgentRequests,
    parentVerificationPending
  }
}

const teacherGetPendingRequests = async (
  filters: PendingRequestsFilters = {}
): Promise<PendingRequestsResponse> => {
  const headers = getAuthHeaders()
  if (!headers) {
    return { success: false, error: 'Authentication required. Please log in again.' }
  }

  const response = await fetch(`${API_BASE}/api/outpass/pending`, {
    headers,
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const message =
      errorBody?.message || `Failed to fetch pending requests (status ${response.status})`
    return { success: false, error: message }
  }

  const raw = await response.json().catch(() => [])
  const recordsSource = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
  const mappedRecords = recordsSource.map(mapOutpassToApplication)

  const statusFiltered = applyStatusFilter(mappedRecords, filters.status)
  const searchFiltered = applySearchFilter(statusFiltered, filters.search)
  const sorted = applySort(searchFiltered, filters.sortOrder)

  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.max(1, filters.limit ?? 10)
  const paginated = paginate(sorted, page, limit)

  const pagination: PendingRequestsPagination = {
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(sorted.length / limit)),
    totalRecords: sorted.length,
    hasNextPage: page * limit < sorted.length,
    hasPrevPage: page > 1
  }

  const summary = buildSummary(sorted)

  return {
    success: true,
    data: {
      requests: paginated,
      pagination,
      summary
    }
  }
}

const teacherProcessRequest = async (
  requestId: string,
  action: ProcessAction,
  payload: ProcessPayload = {}
): Promise<ProcessResponse> => {
  const headers = getAuthHeaders()
  if (!headers) {
    return { success: false, error: 'Authentication required. Please log in again.' }
  }

  const endpoint = `${API_BASE}/api/outpass/${requestId}/faculty-approve`
  const body =
    action === 'approve'
      ? { status: 'approved', notes: payload.notes }
      : { status: 'rejected', rejectionReason: payload.notes }

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const message =
      errorBody?.message || `Failed to ${action} request (status ${response.status})`
    return { success: false, error: message }
  }

  const json = await response.json().catch(() => ({}))
  return { success: true, data: json }
}

export const teacherService = {
  getPendingRequests: teacherGetPendingRequests,
  processRequest: teacherProcessRequest
}


