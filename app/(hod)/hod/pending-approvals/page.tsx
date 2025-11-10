"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    Search,
    Shield,
    User,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    Filter,
    Calendar,
    ChevronDown
} from "lucide-react"

type HodPendingSummary = {
    totalPending: number
    urgentCount: number
    department: string
}

type HodPendingRequest = {
    requestId: string
    studentName: string
    rollNumber: string
    class: string
    department: string
    facultyApprovedBy: string
    facultyApprovedAt: string
    attendanceAtApply: number
    attendanceStatus: string
    reasonCategory: string
    reason: string
    exitTime: string
    returnTime: string
    requestedAgo: string
    timeInHodQueue: string
    isEmergency: boolean
}

type HodPendingApprovalsResponse = {
    summary: HodPendingSummary
    requests: HodPendingRequest[]
}

const CATEGORY_OPTIONS = [
    { value: "all", label: "All Categories" },
    { value: "emergency", label: "Emergency" },
    { value: "personal", label: "Personal/Travel" },
    { value: "appointment", label: "Appointments" },
    { value: "religious", label: "Religious" },
    { value: "academic", label: "Academic" }
]

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") as string) || "http://localhost:5000"

const normalizeCategory = (value: string) =>
    value.toLowerCase().replace(/[^a-z]/g, "")

const findCategoryLabel = (value: string) =>
    CATEGORY_OPTIONS.find(option => option.value === value)?.label ?? value

export default function HodPendingApprovalsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState("")
    const [data, setData] = useState<HodPendingApprovalsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [rejectionNote, setRejectionNote] = useState("")
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const categoryParam = searchParams.get("category") ?? "all"

    useEffect(() => {
        const controller = new AbortController()

        const fetchPendingApprovals = async () => {
            try {
                setLoading(true)
                setError(null)

                const token =
                    typeof window !== "undefined" ? window.localStorage.getItem("token") : null

                if (!token) {
                    setError("Authentication required. Please log in again.")
                    setLoading(false)
                    return
                }

                const response = await fetch(`${API_BASE}/api/hod/pending-approvals`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    cache: "no-store",
                    signal: controller.signal
                })

                if (!response.ok) {
                    const body = await response.json().catch(() => null)
                    throw new Error(
                        body?.message ||
                            `Failed to load pending approvals (status ${response.status})`
                    )
                }

                const payload: HodPendingApprovalsResponse = await response.json()
                setData(payload)
            } catch (err: unknown) {
                if ((err as Error)?.name === "AbortError") return
                setError((err as Error)?.message ?? "Unable to load pending approvals.")
            } finally {
                setLoading(false)
            }
        }

        fetchPendingApprovals()

        return () => controller.abort()
    }, [])

    const filteredRequests = useMemo(() => {
        if (!data) return []
        const selectedLabel = findCategoryLabel(categoryParam)
        const normalizedSelectedLabel = normalizeCategory(selectedLabel)

        return data.requests.filter(request => {
            const query = searchTerm.trim().toLowerCase()
            const matchesSearch =
                query.length === 0 ||
                request.studentName.toLowerCase().includes(query) ||
                request.rollNumber.toLowerCase().includes(query) ||
                request.reason.toLowerCase().includes(query)

            if (!matchesSearch) return false

            if (categoryParam === "all") return true

            const normalizedReasonCategory = normalizeCategory(request.reasonCategory)
            const normalizedParam = normalizeCategory(categoryParam)

            if (normalizedReasonCategory === normalizedParam) return true
            if (normalizedSelectedLabel && normalizedReasonCategory === normalizedSelectedLabel)
                return true

            return false
        })
    }, [data, searchTerm, categoryParam])

    const handleCategoryChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete("category")
        } else {
            params.set("category", value)
        }
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const refetchData = async () => {
        const token =
            typeof window !== "undefined" ? window.localStorage.getItem("token") : null

        if (!token) {
            setError("Authentication required. Please log in again.")
            return
        }

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`${API_BASE}/api/hod/pending-approvals`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                cache: "no-store"
            })

            if (!response.ok) {
                const body = await response.json().catch(() => null)
                throw new Error(
                    body?.message ||
                        `Failed to refresh pending approvals (status ${response.status})`
                )
            }

            const payload: HodPendingApprovalsResponse = await response.json()
            setData(payload)
        } catch (err: unknown) {
            setError((err as Error)?.message ?? "Unable to refresh pending approvals.")
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (
        id: string,
        action: "approve" | "reject",
        rejectionReason?: string
    ) => {
        const token =
            typeof window !== "undefined" ? window.localStorage.getItem("token") : null
        if (!token) {
            setActionError("Authentication required. Please log in again.")
            return
        }

        try {
            setProcessingId(id)
            setActionError(null)

            const response = await fetch(`${API_BASE}/api/hod/outpass/${id}/action`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(
                    action === "approve"
                        ? { action: "approve" }
                        : { action: "reject", rejectionReason: rejectionReason?.trim() }
                )
            })

            if (!response.ok) {
                const body = await response.json().catch(() => null)
                throw new Error(
                    body?.message ||
                        `Failed to ${action} request (status ${response.status})`
                )
            }

            await refetchData()
        } catch (err: unknown) {
            setActionError((err as Error)?.message ?? `Unable to ${action} request.`)
        } finally {
            setProcessingId(null)
        }
    }

    const handleApproveAll = () => {
        console.log("Approving all pending requests")
    }

    const handleExport = () => {
        console.log("Exporting approval list")
    }

    if (loading) {
        return <div className="p-6 text-gray-600">Loading pending approvals...</div>
    }

    if (error) {
        return (
            <div className="p-6 text-red-600">
                {error}
            </div>
        )
    }

    if (!data) {
        return (
            <div className="p-6 text-gray-600">
                No pending approvals found.
            </div>
        )
    }

    const { summary } = data

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center mb-1">
                            <Shield className="w-6 h-6 mr-2" />
                            Pending HOD Approvals
                        </h1>
                        <p className="text-green-100">
                            Review teacher-verified requests for {summary.department}
                        </p>
                    </div>
                    <div className="text-center md:text-right">
                        <div className="text-3xl font-semibold">
                            {summary.totalPending}
                        </div>
                        <div className="text-sm text-green-100">
                            Awaiting Approval • {summary.urgentCount} urgent
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-6">
                <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search approvals..."
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1F8941]"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                            value={categoryParam}
                            onChange={event => handleCategoryChange(event.target.value)}
                            className="appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-12 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1F8941]"
                        >
                            {CATEGORY_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                            <ChevronDown className="h-4 w-4" />
                        </span>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-3">
                    <button
                        onClick={handleApproveAll}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F8941] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a7a39]"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Approve All
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        Export List
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredRequests.map((request) => (
                    <div key={request.requestId} className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex flex-1 items-start space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {request.studentName}
                                        </h3>
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Teacher Verified
                                        </span>
                                        {request.isEmergency && (
                                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                HIGH PRIORITY
                                            </span>
                                        )}
                                        {request.attendanceAtApply < 75 && (
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                                <AlertTriangle className="mr-1 h-3 w-3" />
                                                Low Attendance
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {request.rollNumber} • {request.department}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Approved by:{" "}
                                        <span className="font-medium">{request.facultyApprovedBy}</span>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <span>
                                            Attendance:{" "}
                                            <span className="font-medium text-gray-900">
                                                {request.attendanceAtApply}%
                                            </span>
                                        </span>
                                <span>
                                    Category:{" "}
                                    <span className="font-medium text-gray-900">
                                        {request.reasonCategory}
                                    </span>
                                </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-sm font-medium text-gray-700">Teacher approved</p>
                                <p className="text-xs text-gray-500 flex items-center justify-start md:justify-end">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {request.facultyApprovedAt}
                                </p>
                                <p className="mt-2 text-xs text-gray-400">#{request.requestId}</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-lg bg-gray-50 p-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Reason</p>
                                    <p className="text-sm text-gray-900">{request.reason}</p>
                                </div>
                                <div className="space-y-1 text-sm text-gray-900">
                                    <p className="font-medium text-gray-700">Schedule</p>
                                    <p>
                                        Exit: <span className="font-medium">{request.exitTime}</span>
                                    </p>
                                    <p>
                                        Return: <span className="font-medium">{request.returnTime}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Teacher Verified
                                </span>
                                {request.attendanceAtApply < 75 && (
                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                        <AlertTriangle className="mr-1 h-3 w-3" />
                                        Low Attendance
                                    </span>
                                )}
                                <span>Requested {request.requestedAgo}</span>
                                <span>In queue {request.timeInHodQueue}</span>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <button
                                    onClick={() => handleAction(request.requestId, "approve")}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
                                    disabled={processingId === request.requestId}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedRejectId(request.requestId)
                                        setRejectionNote("")
                                        setShowRejectModal(true)
                                        setActionError(null)
                                    }}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRequests.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                    <Shield className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">
                        {categoryParam === "all"
                            ? "No pending approvals match your filters"
                            : `No ${findCategoryLabel(categoryParam).toLowerCase()} requests right now`}
                    </p>
                </div>
            )}

            {showRejectModal && selectedRejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Provide Rejection Reason
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please explain why this outpass request is being rejected. The student will see this note.
                        </p>
                        <textarea
                            value={rejectionNote}
                            onChange={event => setRejectionNote(event.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1F8941] min-h-[120px]"
                        />
                        {actionError && (
                            <p className="mt-2 text-sm text-red-600">
                                {actionError}
                            </p>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false)
                                    setSelectedRejectId(null)
                                    setRejectionNote("")
                                    setActionError(null)
                                }}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={processingId === selectedRejectId}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (!rejectionNote.trim()) {
                                        setActionError("Rejection reason is required.")
                                        return
                                    }
                                    setShowRejectModal(false)
                                    handleAction(selectedRejectId, "reject", rejectionNote)
                                }}
                                className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                disabled={processingId === selectedRejectId}
                            >
                                <XCircle className="h-4 w-4" />
                                Submit Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}