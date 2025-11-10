"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    Users,
    TrendingUp,
    FileText,
    History,
    AlertCircle,
    Zap
} from "lucide-react"

type HodDetails = {
    name: string
    email: string
    department: string
    role: string
    totalFaculty: number
    totalStudents: number
}

type HodStats = {
    pendingApprovals: number
    approvedToday: number
    rejectedToday: number
    totalFaculty: number
}

type PendingApproval = {
    requestId: string
    studentName: string
    rollNumber: string
    class: string
    department: string
    reasonCategory: string
    reason: string
    teacherApprover: string
    parentContact: string
    attendanceAtApply: number
    attendanceStatus: string
    exitTime: string
    returnTime: string
    requestedAt: string
    urgency: string
    parentVerification?: {
        status: boolean
        verifiedBy?: string
        verifierRole?: string
        verifiedAt?: string
    }
}

type UrgentAlert = {
    requestId: string
    message: string
    class: string
    timeAgo: string
    parentVerified?: boolean
}

type HodDashboardResponse = {
    hodDetails: HodDetails
    stats: HodStats
    recentPendingApprovals: PendingApproval[]
    urgentAlerts: UrgentAlert[]
}

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") as string) || "http://localhost:5000"

const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
        case "high":
            return "text-gray-700"
        case "normal":
            return "text-green-600"
        case "low":
            return "text-green-500"
        default:
            return "text-gray-600"
    }
}

const getPriorityLabel = (priority?: string) => priority?.toUpperCase() ?? "NORMAL"

const ParentVerifiedBadge = ({ verified }: { verified: boolean }) => {
    if (!verified) return null
    return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Parent Verified
        </span>
    )
}

export default function HodDashboardPage() {
    const router = useRouter()
    const [dashboardData, setDashboardData] = useState<HodDashboardResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        const fetchDashboard = async () => {
            try {
                const token =
                    typeof window !== "undefined" ? window.localStorage.getItem("token") : null

                if (!token) {
                    setError("Authentication required. Please log in again.")
                    setLoading(false)
                    return
                }

                const response = await fetch(`${API_BASE}/api/hod/dashboard`, {
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
                            `Failed to load dashboard data (status ${response.status})`
                    )
                }

                const data: HodDashboardResponse = await response.json()
                setDashboardData(data)
            } catch (err: unknown) {
                if ((err as Error)?.name === "AbortError") {
                    return
                }
                setError((err as Error)?.message ?? "Something went wrong while loading dashboard.")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()

        return () => controller.abort()
    }, [])

    if (loading) {
        return <div className="p-6 text-gray-600">Loading dashboard...</div>
    }

    if (error) {
        return (
            <div className="p-6 text-red-600">
                {error}
            </div>
        )
    }

    if (!dashboardData) {
        return (
            <div className="p-6 text-gray-600">
                No dashboard data available.
            </div>
        )
    }

    const { hodDetails, stats, recentPendingApprovals, urgentAlerts } = dashboardData
    const lastName = hodDetails.name?.split(" ").slice(-1)[0] ?? hodDetails.name

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {lastName}! 👋
                        </h1>
                        <p className="text-green-100">
                            HOD, {hodDetails.department}
                        </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                            <div className="text-sm text-green-100">Pending Approvals</div>
                        </div>
                        <div className="w-px h-12 bg-green-400" />
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.totalFaculty}</div>
                            <div className="text-sm text-green-100">Faculty Members</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Approvals</p>
                            <p className="text-2xl font-bold text-green-600">{stats.pendingApprovals}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Approved Today</p>
                            <p className="text-2xl font-bold text-green-700">{stats.approvedToday}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Rejected Today</p>
                            <p className="text-2xl font-bold text-gray-700">{stats.rejectedToday}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <XCircle className="w-6 h-6 text-gray-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Department Faculty</p>
                            <p className="text-2xl font-bold text-green-800">{stats.totalFaculty}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-green-800" />
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
                                Awaiting HOD Approval
                            </h2>
                            <button
                                onClick={() => router.push("/hod/pending-approvals")}
                                className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                            >
                                View All →
                            </button>
                        </div>

                        <div className="space-y-3">
                            {recentPendingApprovals.length === 0 && (
                                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                    No pending approvals at the moment.
                                </div>
                            )}
                            {recentPendingApprovals.map((request) => (
                                <div key={request.requestId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{request.studentName}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {request.rollNumber} • {request.teacherApprover}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {request.class} • {request.department}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border text-green-800 bg-green-100 border-green-400">
                                                Teacher Approved
                                            </span>
                                            <span className={`text-xs font-medium ${getPriorityColor(request.urgency)}`}>
                                                {getPriorityLabel(request.urgency)}
                                            </span>
                                            <ParentVerifiedBadge verified={Boolean(request.parentVerification?.status)} />
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mt-3">
                                        <span className="font-medium text-gray-700">{request.reasonCategory}:</span>{" "}
                                        {request.reason}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        <span>Attendance: {request.attendanceAtApply}%</span>
                                        <span>Status: {request.attendanceStatus}</span>
                                        <span>
                                            Exit {request.exitTime} • Return {request.returnTime}
                                        </span>
                                        <span>{request.requestedAt}</span>
                                        {request.parentVerification?.verifiedAt && (
                                            <span>
                                                Parent verified {request.parentVerification.verifiedAt}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-xs text-gray-500">
                                            Parent Contact: {request.parentContact}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center space-x-1">
                                                <CheckCircle className="w-3 h-3" />
                                                <span>Approve</span>
                                            </button>
                                            <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors flex items-center space-x-1">
                                                <XCircle className="w-3 h-3" />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-[#1F8941]" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push("/hod/pending-approvals")}
                                className="w-full bg-[#1F8941] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1a7a39] transition-colors flex items-center justify-center space-x-2"
                            >
                                <Clock className="w-4 h-4" />
                                <span>Review Pending</span>
                            </button>

                            <button
                                onClick={() => router.push("/hod/bulk-actions")}
                                className="w-full border border-[#1F8941] text-[#1F8941] px-4 py-3 rounded-lg font-medium hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-2"
                            >
                                <Users className="w-4 h-4" />
                                <span>Bulk Approve</span>
                            </button>

                            <button
                                onClick={() => router.push("/hod/reports")}
                                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>View Reports</span>
                            </button>

                            <button
                                onClick={() => router.push("/hod/history")}
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
                            Urgent Alerts
                        </h2>
                        <div className="space-y-3">
                            {urgentAlerts.length === 0 && (
                                <div className="rounded-lg border border-dashed border-red-200 p-6 text-center text-sm text-red-500">
                                    No urgent alerts right now.
                                </div>
                            )}
                            {urgentAlerts.map((alert) => (
                                <div key={alert.requestId} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">{alert.message}</p>
                                    <p className="text-xs text-red-600 mt-1">
                                        {alert.class} • {alert.timeAgo}
                                    </p>
                                    {alert.parentVerified && (
                                        <p className="mt-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Parent Verified
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

