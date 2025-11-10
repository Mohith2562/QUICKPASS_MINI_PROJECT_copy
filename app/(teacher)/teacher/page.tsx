'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Shield,
    History,
    FileText
} from 'lucide-react'

interface PendingRequestSummary {
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

export default function TeacherDashboardPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const filterParam = searchParams.get('filter') === 'myclass' ? 'myclass' : 'all'

    const [summary, setSummary] = useState<PendingRequestSummary>({ pending: 0, urgent: 0 })
    const [requests, setRequests] = useState<PendingRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPendingRequests = async () => {
            try {
                setLoading(true)
                setError(null)

                const token = localStorage.getItem('token')
                if (!token) {
                    setError('Authentication required. Please log in again.')
                    setSummary({ pending: 0, urgent: 0 })
                    setRequests([])
                    return
                }

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
                const url = new URL(`${apiUrl}/api/faculty/pending-requests`)
                url.searchParams.set('filter', filterParam)

                const res = await fetch(url.toString(), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (!res.ok) {
                    const body = await res.json().catch(() => ({}))
                    throw new Error(body?.message || 'Failed to load pending requests')
                }

                const data = await res.json()

                setSummary(data.summary || { pending: 0, urgent: 0 })
                setRequests(Array.isArray(data.requests) ? data.requests : [])
            } catch (err: any) {
                console.error('Failed to fetch pending requests:', err)
                setError(err.message || 'Unable to fetch pending requests. Please try again later.')
                setSummary({ pending: 0, urgent: 0 })
                setRequests([])
            } finally {
                setLoading(false)
            }
        }

        fetchPendingRequests()
    }, [filterParam])

    const handleFilterChange = (value: 'all' | 'myclass') => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('filter')
        } else {
            params.set('filter', value)
        }
        const queryString = params.toString()
        router.replace(queryString ? `?${queryString}` : '?')
    }

    const pendingRequests = useMemo(() => {
        return requests.slice(0, 3)
    }, [requests])

    const emergencyRequests = useMemo(() => {
        return requests.filter(request => request.isEmergency).slice(0, 2)
    }, [requests])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-700 bg-green-50 border-green-300'
            case 'rejected': return 'text-gray-700 bg-gray-100 border-gray-300'
            case 'pending_verification': return 'text-orange-600 bg-orange-50 border-orange-200'
            default: return 'text-green-600 bg-green-25 border-green-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4" />
            case 'rejected': return <XCircle className="w-4 h-4" />
            case 'pending_verification': return <Phone className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Pending Outpass Requests
                        </h1>
                        <p className="text-green-100">
                            Filter: {filterParam === 'myclass' ? 'My Class' : 'Entire Department'}
                        </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{summary.pending}</div>
                            <div className="text-sm text-green-100">Pending</div>
                        </div>
                        <div className="w-px h-12 bg-green-400"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{summary.urgent}</div>
                            <div className="text-sm text-green-100">Urgent</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-600">Show requests for:</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Requests</p>
                            <p className="text-2xl font-bold text-green-600">{summary.pending}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Urgent Requests</p>
                            <p className="text-2xl font-bold text-red-600">{summary.urgent}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Awaiting Review (Preview)</p>
                            <p className="text-2xl font-bold text-gray-700">{pendingRequests.length}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-700" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-[#1F8941]" />
                                Pending Requests
                            </h2>
                            <button
                                onClick={() => router.push('/teacher/pending-requests')}
                                className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                            >
                                View All →
                            </button>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-sm text-gray-500">Loading pending requests…</p>
                            ) : pendingRequests.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No pending requests to display.
                                </p>
                            ) : (
                                pendingRequests.map((request) => (
                                    <div key={request.requestId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{request.studentName}</h3>
                                                    <p className="text-sm text-gray-500">{request.rollNumber}</p>
                                                    <p className="text-xs text-gray-400">{request.class}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.parentVerified ? 'pending_verification' : 'pending')}`}>
                                                {getStatusIcon(request.parentVerified ? 'pending_verification' : 'pending')}
                                                <span className="ml-1 capitalize">{request.parentVerified ? 'parent verified' : 'awaiting review'}</span>
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <span className="font-medium">{request.reasonCategory}:</span> {request.reason}
                                        </p>
                                        <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
                                            <span>Exit: {request.exitTime || '—'}</span>
                                            <span>Return: {request.returnTime || '—'}</span>
                                            {request.lowAttendance && (
                                                <span className="inline-flex items-center text-red-600 font-medium">
                                                    Low attendance at apply ({request.attendanceAtApply ?? '—'}%)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-[#1F8941]" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/teacher/pending-requests')}
                                className="w-full bg-[#1F8941] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1a7a39] transition-colors flex items-center justify-center space-x-2"
                            >
                                <Clock className="w-4 h-4" />
                                <span>Review Pending</span>
                            </button>
                            <button
                                onClick={() => router.push('/teacher/history')}
                                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <History className="w-4 h-4" />
                                <span>View History</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                            Emergency Alerts
                        </h2>
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-sm text-gray-500">Checking for emergencies…</p>
                            ) : emergencyRequests.length === 0 ? (
                                <p className="text-sm text-gray-500">No urgent alerts or emergency requests.</p>
                            ) : (
                                emergencyRequests.map((request) => (
                                    <div key={request.requestId} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm text-red-800">
                                            <span className="font-medium">{request.studentName}</span> needs immediate attention for: {request.reason}
                                        </p>
                                        <p className="text-xs text-red-600 mt-1">{request.requestedAt || 'Just now'}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}