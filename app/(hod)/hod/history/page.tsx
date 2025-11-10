"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
    History as HistoryIcon,
    CheckCircle,
    XCircle,
    Search,
    Download,
    Filter,
    Eye
} from "lucide-react"

type HodHistoryStats = {
    totalProcessed: number
    approvedCount: number
    rejectedCount: number
    approvalRate: number
}

type HodHistoryRecord = {
    id: string
    studentName: string
    studentId: string
    teacher: string
    reasonCategory: string
    reason: string
    status: "hod_approved" | "hod_rejected"
    processedAt: string
}

type HodHistoryResponse = {
    stats: HodHistoryStats
    history: HodHistoryRecord[]
}

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") as string) || "http://localhost:5000"

const statusBadgeStyles: Record<
    HodHistoryRecord["status"],
    { badge: string; icon: typeof CheckCircle }
> = {
    hod_approved: {
        badge: "text-green-600 bg-green-50 border-green-200",
        icon: CheckCircle
    },
    hod_rejected: {
        badge: "text-red-600 bg-red-50 border-red-200",
        icon: XCircle
    }
}

export default function HodHistoryPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") ?? "all")
    const [historyData, setHistoryData] = useState<HodHistoryResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        const controller = new AbortController()

        const fetchHistory = async () => {
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

                const params = new URLSearchParams()
                if (selectedStatus !== "all") {
                    params.set("status", selectedStatus)
                }

                const response = await fetch(
                    `${API_BASE}/api/hod/history${params.toString() ? `?${params}` : ""}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        cache: "no-store",
                        signal: controller.signal
                    }
                )

                if (!response.ok) {
                    const body = await response.json().catch(() => null)
                    throw new Error(
                        body?.message ||
                            `Failed to load decision history (status ${response.status})`
                    )
                }

                const payload: HodHistoryResponse = await response.json()
                setHistoryData(payload)
            } catch (err: unknown) {
                if ((err as Error)?.name === "AbortError") return
                setError((err as Error)?.message ?? "Unable to load decision history.")
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()

        return () => controller.abort()
    }, [selectedStatus])

    useEffect(() => {
        const status = searchParams.get("status")
        if (status && ["all", "hod_approved", "hod_rejected"].includes(status)) {
            setSelectedStatus(status)
        }
    }, [searchParams])

    const filteredHistory = useMemo(() => {
        if (!historyData) return []
        const query = searchTerm.trim().toLowerCase()
        return historyData.history.filter((record) => {
            const matchesSearch =
                query.length === 0 ||
                record.studentName.toLowerCase().includes(query) ||
                record.studentId.toLowerCase().includes(query) ||
                record.reason.toLowerCase().includes(query)

            if (!matchesSearch) return false

            if (selectedStatus === "all") return true

            return record.status === selectedStatus
        })
    }, [historyData, searchTerm, selectedStatus])

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value)
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete("status")
        } else {
            params.set("status", value)
        }
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const handleExport = () => {
        setIsExporting(true)
        // Placeholder for future CSV/PDF export implementation
        setTimeout(() => setIsExporting(false), 500)
    }

    if (loading) {
        return <div className="p-6 text-gray-600">Loading decision history...</div>
    }

    if (error) {
        return (
            <div className="p-6 text-red-600">
                {error}
            </div>
        )
    }

    if (!historyData) {
        return (
            <div className="p-6 text-gray-600">
                No history available.
            </div>
        )
    }

    const { stats } = historyData

    return (
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center mb-2">
                            <HistoryIcon className="w-6 h-6 mr-2" />
                            HOD Decision History
                        </h1>
                        <p className="text-green-100">
                            View all processed requests and their outcomes
                        </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.totalProcessed}</div>
                            <div className="text-sm text-green-100">Total Processed</div>
                        </div>
                        <div className="w-px h-12 bg-green-400" />
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.approvalRate}%</div>
                            <div className="text-sm text-green-100">Approval Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Processed</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalProcessed}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <HistoryIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-green-600">{stats.approvedCount}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                    <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Rejected</p>
                            <p className="text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Approval Rate</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.approvalRate}%</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-purple-600" />
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
                            placeholder="Search history..."
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1F8941]"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <select
                            value={selectedStatus}
                            onChange={(event) => handleStatusChange(event.target.value)}
                            className="appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1F8941]"
                        >
                            <option value="all">All Status</option>
                            <option value="hod_approved">Approved</option>
                            <option value="hod_rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-3">
                    <button
                        onClick={handleExport}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F8941] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1a7a39] disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={isExporting}
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? "Preparing..." : "Export"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Teacher
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Request Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    HOD Decision
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Processed Time
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredHistory.map((record) => {
                                const statusConfig = statusBadgeStyles[record.status]
                                const StatusIcon = statusConfig.icon
                                return (
                                    <tr key={record.id} className="transition-colors hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {record.studentName}
                                            </div>
                                            <div className="text-sm text-gray-500">{record.studentId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {record.teacher}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="font-medium text-gray-900">{record.reasonCategory}</div>
                                            <div className="text-gray-500">{record.reason}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${statusConfig.badge}`}
                                            >
                                                <StatusIcon className="h-3 w-3" />
                                                <span className="ml-1 capitalize">
                                                    {record.status.replace("hod_", "")}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {record.processedAt}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button className="inline-flex items-center justify-center rounded-full p-2 text-[#1F8941] transition-colors hover:text-[#1a7a39]">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredHistory.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                    <HistoryIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No history records found</p>
                </div>
            )}
        </div>
    )
}

