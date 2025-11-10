"use client"

import { useEffect, useMemo, useState } from "react"
import type { ElementType } from "react"
import {
    BarChart3,
    Download,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp
} from "lucide-react"

type SummaryMetric = {
    title: string
    value: string
    icon: ElementType
    accent: {
        background: string
        text: string
    }
}

type TeacherPerformance = {
    id: string
    name: string
    totalRequests: number
    approved: number
    rejected: number
    approvalRate: number
}

type HodReportsResponse = {
    department: string
    timeRange: string
    stats: {
        totalRequests: number
        approved: number
        rejected: number
        avgApprovalTime: string
    }
    performance: {
        name: string
        totalRequests: number
        approved: number
        rejected: number
        approvalRate: string
    }[]
}

const SUMMARY_CONFIG: Array<{
    key: keyof HodReportsResponse["stats"]
    title: string
    icon: ElementType
    accent: {
        background: string
        text: string
    }
}> = [
    {
        key: "totalRequests",
        title: "Total Requests",
        icon: Users,
        accent: {
            background: "bg-blue-100",
            text: "text-blue-600"
        }
    },
    {
        key: "approved",
        title: "Approved",
        icon: CheckCircle,
        accent: {
            background: "bg-green-100",
            text: "text-green-600"
        }
    },
    {
        key: "rejected",
        title: "Rejected",
        icon: XCircle,
        accent: {
            background: "bg-red-100",
            text: "text-red-600"
        }
    },
    {
        key: "avgApprovalTime",
        title: "Avg Approval Time",
        icon: Clock,
        accent: {
            background: "bg-purple-100",
            text: "text-purple-600"
        }
    }
]

const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500"
    if (rate >= 80) return "bg-yellow-500"
    return "bg-red-500"
}

const periodOptions: Array<{ label: string; value: "overall" | "this_month" }> = [
    { label: "Overall", value: "overall" },
    { label: "This Month", value: "this_month" }
]

const API_BASE =
    (process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") as string) || "http://localhost:5000"

export default function HodReportsPage() {
    const [period, setPeriod] = useState<"overall" | "this_month">("this_month")
    const [reports, setReports] = useState<HodReportsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        const fetchReports = async () => {
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
                if (period !== "overall") {
                    params.set("range", period)
                }

                const response = await fetch(
                    `${API_BASE}/api/hod/reports${params.toString() ? `?${params}` : ""}`,
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
                            `Failed to load reports data (status ${response.status})`
                    )
                }

                const payload: HodReportsResponse = await response.json()
                setReports(payload)
            } catch (err: unknown) {
                if ((err as Error)?.name === "AbortError") return
                setError((err as Error)?.message ?? "Unable to load reports data.")
            } finally {
                setLoading(false)
            }
        }

        fetchReports()

        return () => controller.abort()
    }, [period])

    const teacherPerformance = useMemo(() => {
        if (!reports?.performance) return []
        return reports.performance.map((item, index) => ({
            id: `${item.name}-${index}`,
            ...item,
            approvalRateValue: parseFloat(item.approvalRate.replace("%", "")) || 0
        }))
    }, [reports])

    const summaryMetrics = useMemo<SummaryMetric[]>(() => {
        if (!reports) return []

        return SUMMARY_CONFIG.map((config) => ({
            title: config.title,
            value: String(reports.stats[config.key]),
            icon: config.icon,
            accent: config.accent
        }))
    }, [reports])

    const handleExport = () => {
        console.log("Export not implemented yet")
    }

    if (loading) {
        return <div className="p-6 text-gray-600">Loading department reports...</div>
    }

    if (error) {
        return (
            <div className="p-6 text-red-600">
                {error}
            </div>
        )
    }

    if (!reports) {
        return (
            <div className="p-6 text-gray-600">
                No reports data available.
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-gradient-to-r from-[#1F8941] to-[#1a7a39] p-6 text-white md:flex-row md:items-center">
                <div>
                    <h1 className="mb-2 flex items-center text-2xl font-bold">
                        <BarChart3 className="mr-2 h-6 w-6" />
                        Department Reports
                    </h1>
                    <p className="text-green-100">
                        View comprehensive analytics for your department
                    </p>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <select
                        value={period}
                        onChange={event => setPeriod(event.target.value as "overall" | "this_month")}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1F8941] transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                        {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1F8941] transition-colors hover:bg-green-50"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {summaryMetrics.map(metric => {
                    const Icon = metric.icon
                    return (
                        <div key={metric.title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{metric.title}</p>
                                    <p className={`text-2xl font-bold ${metric.accent.text}`}>
                                        {metric.value}
                                    </p>
                                </div>
                                <div className={`${metric.accent.background} rounded-lg p-3`}>
                                    <Icon className={`h-6 w-6 ${metric.accent.text}`} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="flex items-center text-lg font-semibold text-gray-900">
                        <TrendingUp className="mr-2 h-5 w-5 text-[#1F8941]" />
                        Teacher Performance
                    </h2>
                    <p className="text-sm text-gray-500">Period: {reports.timeRange}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Teacher
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Total Requests
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Approved
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Rejected
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Approval Rate
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Performance
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {teacherPerformance.map((teacher) => (
                                <tr key={teacher.id} className="transition-colors hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {teacher.name}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {teacher.totalRequests}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600">
                                        {teacher.approved}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">
                                        {teacher.rejected}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {teacher.approvalRate}%
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-2 w-full rounded-full bg-gray-200">
                                            <div
                                                className={`h-2 rounded-full ${getPerformanceColor(teacher.approvalRateValue)}`}
                                                style={{ width: `${teacher.approvalRateValue}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

