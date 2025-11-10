'use client'

import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  RefreshCw,
  Shield,
  TimerReset,
  User,
  X,
  XCircle
} from 'lucide-react'

type RawStatus =
  | 'submitted'
  | 'under_review'
  | 'teacher_approved'
  | 'hod_approved'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'cancelled_by_student'
  | 'pending_faculty'
  | 'pending_hod'
  | 'pending_gatepass'
  | 'unknown'

interface OutpassApplication {
  requestId: string
  status: RawStatus | string
  reasonCategory: string
  reason: string
  dateFrom: string
  dateTo: string
  exitTime: string
  returnTime: string
  supportingDocumentUrl?: string
  assignedFaculty: PersonContact | null
  assignedHod: PersonContact | null
  assignedMentors: PersonContact[]
  notifiedFaculty: PersonContact[]
  statusUpdates: StatusUpdate[]
}

interface StatusUpdate {
  time: string
  message: string
}

type StatusConfig = {
  title: string
  message: string
  cardBg: string
  border: string
  textColor: string
  iconBg: string
  iconColor: string
  icon: ReactNode
}

type UpdateTheme = {
  border: string
  background: string
  text: string
  icon: ReactNode
}

type NormalizedStatus =
  | 'submitted'
  | 'under_review'
  | 'teacher_approved'
  | 'hod_approved'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'cancelled_by_student'
  | 'unknown'

type PersonContact = {
  name: string
  email?: string
  phone?: string
}

const normalizeStatus = (status: RawStatus | string | undefined): NormalizedStatus => {
  if (!status) return 'unknown'
  const map: Record<string, NormalizedStatus> = {
    submitted: 'submitted',
    under_review: 'under_review',
    teacher_approved: 'teacher_approved',
    hod_approved: 'hod_approved',
    pending_faculty: 'under_review',
    pending_hod: 'teacher_approved',
    pending_gatepass: 'hod_approved',
    approved: 'approved',
    rejected: 'rejected',
    cancelled: 'cancelled',
    cancelled_by_student: 'cancelled_by_student'
  }
  return map[status] ?? 'unknown'
}

const statusConfigs: Record<NormalizedStatus, StatusConfig> = {
  submitted: {
    title: 'Request Submitted',
    message: 'Your outpass request has been submitted and is waiting for teacher review.',
    cardBg: 'bg-blue-50',
    border: 'border-blue-100',
    textColor: 'text-blue-900',
    iconBg: 'bg-blue-100/80',
    iconColor: 'text-blue-600',
    icon: <Clock className="w-6 h-6" />
  },
  under_review: {
    title: 'Under Faculty Review',
    message: 'Your request is being reviewed by the assigned faculty member.',
    cardBg: 'bg-yellow-50',
    border: 'border-yellow-100',
    textColor: 'text-yellow-900',
    iconBg: 'bg-yellow-100/80',
    iconColor: 'text-yellow-600',
    icon: <AlertCircle className="w-6 h-6" />
  },
  teacher_approved: {
    title: 'Faculty Approved',
    message: 'Faculty has approved your request. Pending HOD review.',
    cardBg: 'bg-purple-50',
    border: 'border-purple-100',
    textColor: 'text-purple-900',
    iconBg: 'bg-purple-100/80',
    iconColor: 'text-purple-600',
    icon: <CheckCircle className="w-6 h-6" />
  },
  hod_approved: {
    title: 'HOD Approved',
    message: 'HOD has approved your request. Gatepass is being prepared.',
    cardBg: 'bg-indigo-50',
    border: 'border-indigo-100',
    textColor: 'text-indigo-900',
    iconBg: 'bg-indigo-100/80',
    iconColor: 'text-indigo-600',
    icon: <CheckCircle className="w-6 h-6" />
  },
  approved: {
    title: 'Approved',
    message: 'Your request is fully approved. Download your digital gatepass below.',
    cardBg: 'bg-green-50',
    border: 'border-green-100',
    textColor: 'text-green-900',
    iconBg: 'bg-green-100/80',
    iconColor: 'text-green-600',
    icon: <CheckCircle className="w-6 h-6" />
  },
  rejected: {
    title: 'Request Rejected',
    message: 'Unfortunately, your request was rejected. See details below.',
    cardBg: 'bg-red-50',
    border: 'border-red-100',
    textColor: 'text-red-900',
    iconBg: 'bg-red-100/80',
    iconColor: 'text-red-600',
    icon: <XCircle className="w-6 h-6" />
  },
  cancelled: {
    title: 'Request Cancelled',
    message: 'You have cancelled this request.',
    cardBg: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-800',
    iconBg: 'bg-gray-200/80',
    iconColor: 'text-gray-500',
    icon: <XCircle className="w-6 h-6" />
  },
  cancelled_by_student: {
    title: 'Request Cancelled',
    message: 'You have cancelled this request.',
    cardBg: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-800',
    iconBg: 'bg-gray-200/80',
    iconColor: 'text-gray-500',
    icon: <XCircle className="w-6 h-6" />
  },
  unknown: {
    title: 'Status Unavailable',
    message: 'We could not determine the current status. Try refreshing the page.',
    cardBg: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-600',
    iconBg: 'bg-gray-100/80',
    iconColor: 'text-gray-500',
    icon: <AlertCircle className="w-6 h-6" />
  }
}

const updateThemes: Record<NormalizedStatus, UpdateTheme> = {
  submitted: {
    border: 'border-blue-200',
    background: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <Clock className="w-5 h-5 text-blue-500" />
  },
  under_review: {
    border: 'border-yellow-200',
    background: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: <AlertCircle className="w-5 h-5 text-yellow-500" />
  },
  teacher_approved: {
    border: 'border-purple-200',
    background: 'bg-purple-50',
    text: 'text-purple-700',
    icon: <CheckCircle className="w-5 h-5 text-purple-500" />
  },
  hod_approved: {
    border: 'border-indigo-200',
    background: 'bg-indigo-50',
    text: 'text-indigo-700',
    icon: <CheckCircle className="w-5 h-5 text-indigo-500" />
  },
  approved: {
    border: 'border-green-200',
    background: 'bg-green-50',
    text: 'text-green-700',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />
  },
  rejected: {
    border: 'border-red-200',
    background: 'bg-red-50',
    text: 'text-red-700',
    icon: <XCircle className="w-5 h-5 text-red-500" />
  },
  cancelled: {
    border: 'border-gray-200',
    background: 'bg-gray-50',
    text: 'text-gray-700',
    icon: <X className="w-5 h-5 text-gray-500" />
  },
  cancelled_by_student: {
    border: 'border-gray-200',
    background: 'bg-gray-50',
    text: 'text-gray-700',
    icon: <X className="w-5 h-5 text-gray-500" />
  },
  unknown: {
    border: 'border-gray-200',
    background: 'bg-gray-50',
    text: 'text-gray-600',
    icon: <AlertCircle className="w-5 h-5 text-gray-400" />
  }
}

const getUpdateTheme = (message: string): UpdateTheme => {
  const lower = message.toLowerCase()
  if (lower.includes('rejected')) {
    return updateThemes.rejected
  }
  if (lower.includes('cancelled')) {
    return updateThemes.cancelled_by_student
  }
  if (lower.includes('hod')) {
    return updateThemes.hod_approved
  }
  if (lower.includes('approved')) {
    return updateThemes.approved
  }
  if (lower.includes('faculty')) {
    return updateThemes.teacher_approved
  }
  if (lower.includes('pending') || lower.includes('review')) {
    return updateThemes.under_review
  }
  return updateThemes.submitted
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const formatTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

const reasonCategoryLabel = (category?: string) => {
  if (!category) return '—'
  return category
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatContact = (contact?: PersonContact | null) => {
  if (!contact) return 'Not assigned yet'
  const parts = [contact.name]
  if (contact.email) parts.push(contact.email)
  if (contact.phone) parts.push(contact.phone)
  return parts.join(' • ')
}

const sanitizeContacts = (contacts: any): PersonContact[] => {
  if (!contacts) return []
  const list = Array.isArray(contacts) ? contacts : [contacts]
  return list
    .map(contact => ({
      name: contact?.name?.trim?.() || '—',
      email: contact?.email?.trim?.() || undefined,
      phone: contact?.phone
        ?.toString()
        ?.replace(/\u202a|\u202c/g, '')
        ?.trim() || undefined
    }))
    .filter(contact => contact.name !== '—')
}

const PLACEHOLDER_QR =
  'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=QuickPass'

export default function Status() {
  const router = useRouter()

  const [application, setApplication] = useState<OutpassApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    rollNumber: '',
    department: '',
    year: ''
  })

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setStudentInfo({
          name: parsed?.name || '',
          rollNumber: parsed?.rollNumber || '',
          department: parsed?.department || '',
          year: parsed?.year ? `Year ${parsed.year}` : ''
        })
      }
    } catch (err) {
      console.warn('Failed to parse stored user info', err)
    }
  }, [])

  const fetchStatus = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null)
        if (isRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const headers = { Authorization: `Bearer ${token}` }

        const statusRes = await fetch(`${apiUrl}/api/outpass/current`, {
          headers
        })

        if (statusRes.status === 404) {
          setApplication(null)
          return
        }

        const statusJson = await statusRes.json().catch(() => null)

        if (!statusRes.ok) {
          throw new Error(
            statusJson?.message || 'Failed to fetch current application status'
          )
        }

        const rawApplication = statusJson?.data || statusJson || null

        if (!rawApplication) {
          setApplication(null)
          return
        }

        const facultyContacts = sanitizeContacts(rawApplication.assignedFaculty)
        const hodContacts = sanitizeContacts(rawApplication.assignedHod)
        const mentorContacts = sanitizeContacts(rawApplication.assignedMentors)
        const notifiedContacts = sanitizeContacts(rawApplication.notifiedFaculty)

        const sanitizedApplication: OutpassApplication = {
          requestId: rawApplication.requestId || '',
          status: rawApplication.status || 'unknown',
          reasonCategory: rawApplication.reasonCategory || '',
          reason: rawApplication.reason || '',
          dateFrom: rawApplication.dateFrom || '',
          dateTo: rawApplication.dateTo || '',
          exitTime: rawApplication.exitTime || '',
          returnTime: rawApplication.returnTime || '',
          supportingDocumentUrl: rawApplication.supportingDocumentUrl || '',
          assignedFaculty: facultyContacts[0] || null,
          assignedHod: hodContacts[0] || null,
          assignedMentors: mentorContacts,
          notifiedFaculty: notifiedContacts.length ? notifiedContacts : mentorContacts,
          statusUpdates: Array.isArray(rawApplication.statusUpdates)
            ? rawApplication.statusUpdates
            : []
        }

        setApplication(sanitizedApplication)
      } catch (err: any) {
        console.error('Failed to load status page:', err)
        setError(err.message || 'Something went wrong. Please try again.')
      } finally {
        setLoading(false)
        setRefreshing(false)
        setCancelling(false)
      }
    },
    [apiUrl, router]
  )

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const normalizedStatus = useMemo(
    () => normalizeStatus(application?.status),
    [application?.status]
  )

  const statusConfig = statusConfigs[normalizedStatus] ?? statusConfigs.unknown

  const submittedTimestamp =
    application?.statusUpdates?.[0]?.time || application?.dateFrom || ''

  const timelineData = useMemo(() => {
    if (!application) {
      return {
        steps: [] as Array<{
          key: string
          label: string
          complete: boolean
          timestamp?: string
          notes?: string
        }>,
        submittedUpdate: undefined as StatusUpdate | undefined,
        facultyUpdate: undefined as StatusUpdate | undefined,
        hodUpdate: undefined as StatusUpdate | undefined
      }
    }

    const updates = application.statusUpdates ?? []
    const findUpdate = (keywords: string[]) =>
      updates.find(update =>
        keywords.some(keyword => update.message.toLowerCase().includes(keyword))
      )

    const submittedUpdate =
      findUpdate(['submitted']) ||
      (submittedTimestamp
        ? {
          time: submittedTimestamp,
          message:
            'Outpass application submitted successfully and faculty notified.'
        }
        : undefined)

    const facultyUpdate =
      findUpdate(['faculty', 'teacher', 'mentor']) ||
      (normalizedStatus !== 'submitted' && normalizedStatus !== 'under_review'
        ? {
          time: submittedTimestamp,
          message: 'Faculty approved your request and forwarded it to HOD.'
        }
        : undefined)

    const hodUpdate =
      findUpdate(['hod', 'gatepass', 'principal']) ||
      (normalizedStatus === 'approved'
        ? {
          time: application.dateTo,
          message: 'HOD approved the request. Gatepass generated.'
        }
        : undefined)

    const steps = [
      {
        key: 'submitted',
        label: 'Request Submitted',
        complete: true,
        timestamp: submittedUpdate?.time,
        notes: submittedUpdate?.message
      },
      {
        key: 'teacher',
        label: 'Faculty Review',
        complete:
          normalizedStatus !== 'submitted' && normalizedStatus !== 'under_review',
        timestamp: facultyUpdate?.time,
        notes: facultyUpdate?.message
      },
      {
        key: 'hod',
        label: 'HOD Review',
        complete:
          normalizedStatus === 'approved' ||
          normalizedStatus === 'rejected' ||
          normalizedStatus === 'hod_approved',
        timestamp: hodUpdate?.time,
        notes: hodUpdate?.message
      },
      {
        key: 'gatepass',
        label: 'Gatepass Generated',
        complete: normalizedStatus === 'approved',
        timestamp: normalizedStatus === 'approved' ? application.dateTo : undefined,
        notes:
          normalizedStatus === 'approved'
            ? 'Digital gatepass ready to download.'
            : undefined
      }
    ]

    return { steps, submittedUpdate, facultyUpdate, hodUpdate }
  }, [application, normalizedStatus, submittedTimestamp])

  // Derived timeline information
  const timelineSteps = timelineData.steps
  const submittedUpdate = timelineData.submittedUpdate
  const facultyUpdate = timelineData.facultyUpdate
  const hodUpdate = timelineData.hodUpdate

  const statusUpdatesList = useMemo(() => {
    if (!application) return []

    const updates = [...(application.statusUpdates ?? [])]
    const seen = new Set(
      updates.map(update => `${update.message}-${update.time ?? ''}`)
    )

    const addUpdate = (update?: StatusUpdate) => {
      if (!update?.time) return
      const key = `${update.message}-${update.time}`
      if (seen.has(key)) return
      seen.add(key)
      updates.push(update)
    }

    addUpdate(submittedUpdate)

    if (
      normalizedStatus !== 'submitted' &&
      normalizedStatus !== 'under_review'
    ) {
      addUpdate(
        facultyUpdate ?? {
          time: submittedTimestamp || application.dateFrom,
          message: 'Faculty approved your request and forwarded it to HOD.'
        }
      )
    }

    if (
      normalizedStatus === 'hod_approved' ||
      normalizedStatus === 'approved' ||
      normalizedStatus === 'rejected'
    ) {
      addUpdate(
        hodUpdate ?? {
          time: application.dateTo || submittedTimestamp,
          message:
            normalizedStatus === 'rejected'
              ? 'Request was rejected by HOD.'
              : 'HOD approved the request.'
        }
      )
    }

    if (normalizedStatus === 'approved') {
      addUpdate({
        time: application.dateTo,
        message: 'Digital gatepass generated and ready for download.'
      })
    }

    if (
      normalizedStatus === 'cancelled' ||
      normalizedStatus === 'cancelled_by_student'
    ) {
      addUpdate({
        time: application.dateTo || submittedTimestamp,
        message: 'Request cancelled by student.'
      })
    }

    updates.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    )

    return updates
  }, [
    application,
    facultyUpdate,
    hodUpdate,
    normalizedStatus,
    submittedTimestamp,
    submittedUpdate
  ])

  const canCancel =
    normalizedStatus === 'submitted' ||
    normalizedStatus === 'under_review' ||
    normalizedStatus === 'teacher_approved'

  const handleRefresh = () => {
    fetchStatus(true)
  }

  const handleCancelRequest = async () => {
    if (!application?.requestId) return
    const confirmation = window.confirm(
      'Are you sure you want to cancel this outpass request? This action cannot be undone.'
    )
    if (!confirmation) return

    try {
      setCancelling(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const res = await fetch(
        `${apiUrl}/api/outpass/${application.requestId}/cancel`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const json = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(json?.message || 'Failed to cancel request')
      }

      fetchStatus(true)
    } catch (err: any) {
      console.error('Cancel request failed:', err)
      setError(err.message || 'Unable to cancel request. Please try again.')
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F8941]" />
          <p className="text-sm text-gray-600">
            Loading application status...
          </p>
        </div>
      </div>
    )
  }

  if (error && !application) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <div>
            <h2 className="text-lg font-semibold text-red-800">
              Unable to fetch status
            </h2>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            onClick={() => fetchStatus()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-4">
          <TimerReset className="w-12 h-12 mx-auto text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-800">
            No Active Outpass Request
          </h2>
          <p className="text-sm text-gray-500">
            You haven&apos;t started an outpass request yet. Apply now to get
            started.
          </p>
          <button
            onClick={() => router.push('/student/apply')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#1F8941] text-white hover:bg-[#1a7a39] transition-colors"
          >
            Apply for Outpass
          </button>
        </div>
      </div>
    )
  }

  const requestDetailsCard = (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-[#1F8941]" />
          Request Details
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailItem
          label="Reason Category"
          value={reasonCategoryLabel(application.reasonCategory)}
        />
        <DetailItem
          label="Exit Date"
          value={formatDate(application.dateFrom)}
        />
        <DetailItem
          label="Exit Time"
          value={application.exitTime || '—'}
        />
        <DetailItem
          label="Return Time"
          value={application.returnTime || '—'}
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
          Detailed Reason
        </p>
        <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-4">
          {application.reason || '—'}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Notified Faculty
        </p>
        {application.notifiedFaculty.length === 0 ? (
          <p className="text-sm text-gray-500">
            No faculty members have been notified yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {application.notifiedFaculty.map((faculty, idx) => (
              <ContactCard
                key={`${faculty.email || faculty.name}-${idx}`}
                contact={faculty}
              />
            ))}
          </div>
        )}
      </div>

      {application.supportingDocumentUrl && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
            Supporting Document
          </p>
          <a
            href={application.supportingDocumentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium text-[#1F8941] hover:text-[#1a7a39]"
          >
            View uploaded document
          </a>
        </div>
      )}

      {application.assignedHod && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Assigned HOD
          </p>
          <ContactCard contact={application.assignedHod} />
        </div>
      )}
    </div>
  )

  const gatepassCard = normalizedStatus === 'approved' && (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div className="flex items-center gap-2 text-gray-900">
        <Shield className="w-5 h-5 text-[#1F8941]" />
        <h2 className="text-lg font-semibold">Digital Gatepass</h2>
      </div>

      <div className="bg-gradient-to-br from-[#1F8941] to-[#1a7a39] text-white rounded-lg p-6 space-y-4 shadow-inner">
        <div>
          <p className="text-sm tracking-[0.3em] uppercase opacity-80">QuickPass</p>
          <p className="text-2xl font-bold mt-2">Gatepass</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">{studentInfo.name || '—'}</p>
          <p className="opacity-80">
            {studentInfo.rollNumber || '—'} • {studentInfo.department || '—'}
          </p>
          <p className="opacity-80">
            Exit: {formatDate(application.dateFrom)} at {application.exitTime || '—'}
          </p>
          <p className="opacity-80">
            Return: {formatDate(application.dateTo)} at {application.returnTime || '—'}
          </p>
          <p className="tracking-[0.3em] text-xs uppercase opacity-70">
            {application.requestId
              ? `QP-${application.requestId.slice(-6).toUpperCase()}`
              : 'QP-XXXXXX'}
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-3">
            <img
              src={PLACEHOLDER_QR}
              alt="Gatepass QR code"
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>
      </div>

      <button className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
        <Download className="w-4 h-4" />
        <span>Download Gatepass</span>
      </button>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 mt-1" />
          <div className="text-sm">
            <p className="font-medium">Something went wrong</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main Status Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Request Status
            </h1>
            <p className="text-sm text-gray-500">
              Keep track of your application&apos;s live progress.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        <div
          className={`rounded-2xl border ${statusConfig.border} ${statusConfig.cardBg} px-6 py-5 transition-all`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusConfig.iconBg} ${statusConfig.iconColor}`}
              >
                {statusConfig.icon}
              </div>
              <div className={`space-y-2 ${statusConfig.textColor}`}>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
                    Request Status
                  </p>
                  <h2 className="text-xl font-semibold">{statusConfig.title}</h2>
                </div>
                <p className="text-sm leading-relaxed max-w-xl">
                  {statusConfig.message}
                </p>
                {application?.requestId && (
                  <p className="text-xs font-mono opacity-80">
                    Request ID: #{application.requestId}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-right space-y-1">
              <p className="font-medium text-gray-600 uppercase tracking-wide">
                Submitted
              </p>
              <p className="font-semibold text-gray-900">
                {formatDateTime(submittedTimestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
          {timelineSteps.map((step, index) => {
            const isComplete = step.complete
            const previousStepsCompleted = timelineSteps
              .slice(0, index)
              .every(prev => prev.complete)
            const isCurrent = !step.complete && previousStepsCompleted

            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-2 flex-1">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${isComplete
                    ? 'border-[#1F8941] bg-[#E8F5EB] text-[#1F8941]'
                    : isCurrent
                      ? 'border-[#1F8941] border-dashed text-[#1F8941]'
                      : 'border-gray-200 text-gray-400 bg-white'
                    } shadow-sm`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className={`text-sm font-medium ${isComplete ? 'text-[#1F8941]' : 'text-gray-600'}`}>
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-gray-400">{formatDateTime(step.timestamp)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Request Details and Gatepass */}
      {gatepassCard ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requestDetailsCard}
          {gatepassCard}
        </div>
      ) : (
        requestDetailsCard
      )}

      {/* Status Updates */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Status Updates</h2>
        {statusUpdatesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-lg py-10 space-y-3">
            <Clock className="w-6 h-6 text-gray-400" />
            <p className="text-sm text-gray-500">No status updates available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {statusUpdatesList.map((update, index) => {
              const theme = getUpdateTheme(update.message)
              return (
                <div
                  key={`${update.time}-${index}`}
                  className={`flex items-start gap-3 rounded-lg border ${theme.border} ${theme.background} p-4`}
                >
                  <div className="mt-1">{theme.icon}</div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme.text}`}>{update.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDateTime(update.time)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
          <p className="text-sm text-gray-500">
            You can cancel your request while it is still pending approval.
          </p>
          <button
            onClick={handleCancelRequest}
            disabled={cancelling}
            className="w-full inline-flex items-center justify-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>{cancelling ? 'Cancelling...' : 'Cancel Request'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

type DetailItemProps = {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  )
}

type ContactCardProps = {
  contact: PersonContact
}

function ContactCard({ contact }: ContactCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 space-y-1">
      <p className="font-semibold text-gray-900">{contact.name}</p>
      {contact.email && <p className="text-xs text-gray-500">{contact.email}</p>}
      {contact.phone && <p className="text-xs text-gray-500">{contact.phone}</p>}
    </div>
  )
}
