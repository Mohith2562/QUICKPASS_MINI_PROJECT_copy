'use client'

import { useRouter } from 'next/navigation'
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
} from 'lucide-react'

export default function HodDashboardPage() {
    const router = useRouter()

    // Sample data - replace with real data from your backend
    const dashboardData = {
        hod: {
            name: 'Prof. Michael Smith',
            department: 'Computer Science Engineering',
            employeeId: 'H001'
        },
        stats: {
            pendingApprovals: 15,
            approvedToday: 28,
            rejectedToday: 3,
            totalTeachers: 12
        },
        recentRequests: [
            {
                id: 'REQ001',
                student: 'John Doe',
                studentId: 'CS21B1001',
                teacher: 'Dr. Sarah Johnson',
                reason: 'Medical Appointment',
                status: 'teacher_approved',
                time: '5 mins ago',
                priority: 'normal'
            },
            {
                id: 'REQ002',
                student: 'Jane Smith',
                studentId: 'CS21B1002',
                teacher: 'Dr. Sarah Johnson',
                reason: 'Family Emergency',
                status: 'teacher_approved',
                time: '10 mins ago',
                priority: 'high'
            },
            {
                id: 'REQ003',
                student: 'Mike Johnson',
                studentId: 'CS21B1003',
                teacher: 'Prof. Kumar',
                reason: 'Interview',
                status: 'teacher_approved',
                time: '15 mins ago',
                priority: 'normal'
            }
        ],
        urgentAlerts: [
            {
                id: 1,
                type: 'timeout',
                message: 'Multiple requests pending approval for over 30 minutes',
                time: '2 mins ago'
            },
            {
                id: 2,
                type: 'bulk_request',
                message: '8 students from hackathon event need bulk approval',
                time: '10 mins ago'
            }
        ]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'teacher_approved': return 'text-green-800 bg-green-100 border-green-400'
            case 'hod_approved': return 'text-green-700 bg-green-50 border-green-300'
            case 'rejected': return 'text-gray-700 bg-gray-100 border-gray-300'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-gray-700'
            case 'normal': return 'text-green-600'
            case 'low': return 'text-green-500'
            default: return 'text-gray-600'
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {dashboardData.hod.name.split(' ').slice(-1)[0]}! 👋
                        </h1>
                        <p className="text-green-100">
                            {dashboardData.hod.employeeId} • HOD, {dashboardData.hod.department}
                        </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.pendingApprovals}</div>
                            <div className="text-sm text-green-100">Pending Approvals</div>
                        </div>
                        <div className="w-px h-12 bg-green-400"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.totalTeachers}</div>
                            <div className="text-sm text-green-100">Teachers</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Approvals</p>
                            <p className="text-2xl font-bold text-green-600">{dashboardData.stats.pendingApprovals}</p>
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
                            <p className="text-2xl font-bold text-green-700">{dashboardData.stats.approvedToday}</p>
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
                            <p className="text-2xl font-bold text-gray-700">{dashboardData.stats.rejectedToday}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <XCircle className="w-6 h-6 text-gray-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Department Teachers</p>
                            <p className="text-2xl font-bold text-green-800">{dashboardData.stats.totalTeachers}</p>
                        </div>
                        <div className="bg-green-25 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-green-800" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Teacher Approvals */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-[#1F8941]" />
                                Awaiting HOD Approval
                            </h2>
                            <button
                                onClick={() => router.push('/hod/pending-approvals')}
                                className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                            >
                                View All →
                            </button>
                        </div>

                        <div className="space-y-3">
                            {dashboardData.recentRequests.map((request) => (
                                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{request.student}</h3>
                                                <p className="text-sm text-gray-500">{request.studentId} • {request.teacher}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                                                Teacher Approved
                                            </span>
                                            <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                {request.priority.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{request.time}</span>
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

                {/* Quick Actions & Alerts */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Zap className="w-5 h-5 mr-2 text-[#1F8941]" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/hod/pending-approvals')}
                                className="w-full bg-[#1F8941] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1a7a39] transition-colors flex items-center justify-center space-x-2"
                            >
                                <Clock className="w-4 h-4" />
                                <span>Review Pending</span>
                            </button>

                            <button
                                onClick={() => router.push('/hod/bulk-actions')}
                                className="w-full border border-[#1F8941] text-[#1F8941] px-4 py-3 rounded-lg font-medium hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-2"
                            >
                                <Users className="w-4 h-4" />
                                <span>Bulk Approve</span>
                            </button>

                            <button
                                onClick={() => router.push('/hod/reports')}
                                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>View Reports</span>
                            </button>

                            <button
                                onClick={() => router.push('/hod/history')}
                                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <History className="w-4 h-4" />
                                <span>View History</span>
                            </button>
                        </div>
                    </div>

                    {/* Urgent Alerts */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                            Urgent Alerts
                        </h2>
                        <div className="space-y-3">
                            {dashboardData.urgentAlerts.map((alert) => (
                                <div key={alert.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">{alert.message}</p>
                                    <p className="text-xs text-red-600 mt-1">{alert.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
