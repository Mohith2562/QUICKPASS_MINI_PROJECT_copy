'use client'

import { useRouter } from 'next/navigation'
import {
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Users,
    TrendingUp,
    FileText,
    History,
    Shield,
    Eye
} from 'lucide-react'

export default function TeacherDashboardPage() {
    const router = useRouter()

    // Sample data - replace with real data from your backend
    const dashboardData = {
        teacher: {
            name: 'Dr. Sarah Johnson',
            department: 'Computer Science Engineering',
            employeeId: 'T001'
        },
        stats: {
            pendingRequests: 8,
            approvedToday: 12,
            rejectedToday: 2,
            totalStudents: 45
        },
        recentRequests: [
            {
                id: 'REQ001',
                student: 'John Doe',
                studentId: 'CS21B1001',
                reason: 'Medical Appointment',
                status: 'pending',
                time: '10 mins ago',
                parentVerified: false
            },
            {
                id: 'REQ002',
                student: 'Jane Smith',
                studentId: 'CS21B1002',
                reason: 'Family Emergency',
                status: 'approved',
                time: '30 mins ago',
                parentVerified: true
            },
            {
                id: 'REQ003',
                student: 'Mike Johnson',
                studentId: 'CS21B1003',
                reason: 'Personal Work',
                status: 'pending_verification',
                time: '1 hour ago',
                parentVerified: false
            }
        ],
        urgentAlerts: [
            {
                id: 1,
                type: 'timeout',
                message: 'Parent verification timeout for REQ001 - John Doe',
                time: '5 mins ago'
            },
            {
                id: 2,
                type: 'multiple_requests',
                message: 'Mike Johnson has submitted 3 requests this week',
                time: '15 mins ago'
            }
        ]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-700 bg-green-50 border-green-300'
            case 'rejected': return 'text-gray-700 bg-gray-100 border-gray-300'
            case 'pending': return 'text-green-600 bg-green-25 border-green-200'
            case 'pending_verification': return 'text-green-800 bg-green-100 border-green-400'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4" />
            case 'rejected': return <XCircle className="w-4 h-4" />
            case 'pending': return <Clock className="w-4 h-4" />
            case 'pending_verification': return <Phone className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {dashboardData.teacher.name.split(' ').slice(-1)[0]}! 👋
                        </h1>
                        <p className="text-green-100">
                            {dashboardData.teacher.employeeId} • {dashboardData.teacher.department}
                        </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.pendingRequests}</div>
                            <div className="text-sm text-green-100">Pending Requests</div>
                        </div>
                        <div className="w-px h-12 bg-green-400"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.totalStudents}</div>
                            <div className="text-sm text-green-100">My Students</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Requests</p>
                            <p className="text-2xl font-bold text-green-600">{dashboardData.stats.pendingRequests}</p>
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
                            <p className="text-sm text-gray-600">My Students</p>
                            <p className="text-2xl font-bold text-green-800">{dashboardData.stats.totalStudents}</p>
                        </div>
                        <div className="bg-green-25 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-green-800" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Requests */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-[#1F8941]" />
                                Recent Requests
                            </h2>
                            <button
                                onClick={() => router.push('/teacher/pending-requests')}
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
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{request.student}</h3>
                                                <p className="text-sm text-gray-500">{request.studentId}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                            <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{request.time}</span>
                                        <div className="flex space-x-2">
                                            {request.status === 'pending_verification' && (
                                                <button
                                                    onClick={() => router.push('/teacher/parent-verification')}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors flex items-center space-x-1"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    <span>Call Parent</span>
                                                </button>
                                            )}
                                            {request.status === 'pending' && (
                                                <div className="flex space-x-1">
                                                    <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors">
                                                        Approve
                                                    </button>
                                                    <button className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors">
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
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
                                onClick={() => router.push('/teacher/parent-verification')}
                                className="w-full border border-[#1F8941] text-[#1F8941] px-4 py-3 rounded-lg font-medium hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-2"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Call Parents</span>
                            </button>

                            <button
                                onClick={() => router.push('/teacher/student-profiles')}
                                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Users className="w-4 h-4" />
                                <span>Student Profiles</span>
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
