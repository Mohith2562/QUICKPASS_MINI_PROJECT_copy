'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react'

interface PendingSummary {
  pending: number
  urgent: number
}

interface PendingRequest {
  requestId: string
  studentName: string
  rollNumber: string
  email: string
  phone: string
  class: string
  department: string
  reasonCategory: string
  reason: string
  attendanceAtApply?: number
  lowAttendance?: boolean
  parentName?: string
  parentContact?: string
  alternateContact?: string
  exitTime?: string
  returnTime?: string
  requestedAt?: string
  isEmergency?: boolean
  parentVerified?: boolean
}

type FilterOption = 'all' | 'myclass'

export default function PendingRequestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filterParam = searchParams.get('filter') === 'myclass' ? 'myclass' : 'all'

  const [summary, setSummary] = useState<PendingSummary>({ pending: 0, urgent: 0 })
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [parentVerifiedMap, setParentVerifiedMap] = useState<Record<string, boolean>>({})

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchPendingRequests = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) {
          setLoading(true)
        } else {
          setRefreshing(true)
        }
        setError(null)

        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Authentication required. Please log in again.')
        }

        const url = new URL(`${apiUrl}/api/faculty/pending-requests`)
        url.searchParams.set('filter', filterParam)

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.message || 'Failed to load pending requests')
        }

        const data = await res.json()
        const requestsData: PendingRequest[] = Array.isArray(data.requests) ? data.requests : []

        setSummary(data.summary || { pending: 0, urgent: 0 })
        setRequests(requestsData)
        setParentVerifiedMap(
          requestsData.reduce((acc, request) => {
            acc[request.requestId] = Boolean(request.parentVerified)
            return acc
          }, {} as Record<string, boolean>)
        )
      } catch (err: any) {
        console.error('Error fetching pending requests:', err)
        setSummary({ pending: 0, urgent: 0 })
        setRequests([])
        setParentVerifiedMap({})
        setError(err.message || 'Unable to fetch pending requests. Please try again later.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [apiUrl, filterParam]
  )

  useEffect(() => {
    fetchPendingRequests()
  }, [fetchPendingRequests])

  const handleFilterChange = (value: FilterOption) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('filter')
    } else {
      params.set('filter', value)
    }
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?')
  }

  const toggleParentVerified = (requestId: string) => {
    setParentVerifiedMap(prev => ({ ...prev, [requestId]: !prev[requestId] }))
  }

  const handleProcess = async (
    request: PendingRequest,
    action: 'approve' | 'reject'
  ) => {
    if (action === 'reject') {
      const reason = window.prompt('Please provide a reason for rejection:')
      if (!reason) return
      await submitAction(request.requestId, action, { rejectionReason: reason })
    } else {
      await submitAction(request.requestId, action, {
        parentVerified: !!parentVerifiedMap[request.requestId]
      })
    }
  }

  const submitAction = async (
    requestId: string,
    action: 'approve' | 'reject',
    payload: { parentVerified?: boolean; rejectionReason?: string }
  ) => {
    try {
      setProcessingId(requestId)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required. Please log in again.')
      }

      const res = await fetch(`${apiUrl}/api/faculty/outpass/${requestId}/action`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          ...(action === 'approve'
            ? { parentVerified: !!payload.parentVerified }
            : { rejectionReason: payload.rejectionReason })
        })
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(body?.message || `Failed to ${action} request`)
      }

      window.alert(body?.message || `Request ${action}d successfully.`)
      await fetchPendingRequests(false)
    } catch (err: any) {
      console.error(`Error during ${action}:`, err)
      window.alert(err.message || `Unable to ${action} this request. Please try again.`)
    } finally {
      setProcessingId(null)
    }
  }

  const pendingPreview = useMemo(() => requests.slice(0, 3), [requests])
  const emergencyPreview = useMemo(
    () => requests.filter(req => req.isEmergency).slice(0, 3),
    [requests]
  )

  const renderRequestCard = (request: PendingRequest) => {
    const isProcessing = processingId === request.requestId
    const isEmergency = request.isEmergency
    const attendance = request.attendanceAtApply ?? null

    return (
      <div
        key={request.requestId}
        className={`border rounded-lg p-4 space-y-3 ${isEmergency ? 'border-red-300 bg-red-50/60' : 'border-gray-200 bg-white'}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEmergency ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
              <User className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-900">{request.studentName}</h3>
              <p className="text-sm text-gray-500">{request.rollNumber}</p>
              <p className="text-xs text-gray-400">{request.class} • {request.department}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-1 text-[11px] font-medium text-yellow-700">
              <Clock className="w-3 h-3" />
              Awaiting Review
            </span>
            {request.requestedAt && <span>{request.requestedAt}</span>}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">Reason:</span> {request.reason}
          </p>
          <p className="mt-1 text-xs text-gray-500 uppercase tracking-wide">
            Category: {request.reasonCategory}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
          <span>Exit: <span className="text-gray-800 font-medium">{request.exitTime || '—'}</span></span>
          <span>Return: <span className="text-gray-800 font-medium">{request.returnTime || '—'}</span></span>
          {attendance !== null && (
            <span>
              Attendance at apply: {attendance}%
              {request.lowAttendance ? ' (Low)' : ''}
            </span>
          )}
          <span>Parent Contact: {request.parentContact || '—'}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#1F8941] focus:ring-[#1F8941]"
              checked={!!parentVerifiedMap[request.requestId]}
              onChange={() => toggleParentVerified(request.requestId)}
            />
            Parent verified
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleProcess(request, 'approve')}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1F8941] px-3 py-2 text-xs font-medium text-white hover:bg-[#1a7a39] disabled:cursor-wait disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => handleProcess(request, 'reject')}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
            <button
              onClick={() => {
                if (request.parentContact) {
                  window.alert(`Initiating call to parent: ${request.parentContact}`)
                } else {
                  window.alert('Parent contact not available.')
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <Phone className="w-4 h-4" />
              Call Parent
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>
          <p className="text-sm text-gray-500">
            Review, approve, or reject student outpass requests awaiting faculty action.
          </p>
        </div>
        <button
          onClick={() => fetchPendingRequests(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600">Filter:</span>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 text-sm font-medium ${filterParam === 'all' ? 'bg-[#1F8941] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Department
          </button>
          <button
            onClick={() => handleFilterChange('myclass')}
            className={`px-4 py-2 text-sm font-medium ${filterParam === 'myclass' ? 'bg-[#1F8941] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            My Class
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Total pending requests</p>
          <p className="text-3xl font-semibold text-[#1F8941]">{summary.pending}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">Urgent requests</p>
          <p className="text-3xl font-semibold text-red-600">{summary.urgent}</p>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Awaiting Your Action</h2>
          <span className="text-sm text-gray-500">Showing first {pendingPreview.length} requests</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading pending requests…
          </div>
        ) : pendingPreview.length === 0 ? (
          <p className="text-sm text-gray-500">No pending outpass requests found.</p>
        ) : (
          <div className="space-y-4">
            {pendingPreview.map(renderRequestCard)}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Emergency Requests
          </h2>
          <span className="text-sm text-gray-500">Auto-detected from incoming requests</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking for emergencies…
          </div>
        ) : emergencyPreview.length === 0 ? (
          <p className="text-sm text-gray-500">No emergency requests at the moment.</p>
        ) : (
          <div className="space-y-3">
            {emergencyPreview.map(request => (
              <div key={`${request.requestId}-emergency`} className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
                <p className="font-semibold">{request.studentName}</p>
                <p className="mt-1">{request.reason}</p>
                <p className="mt-1 text-xs text-red-500">{request.requestedAt || 'Just now'}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}