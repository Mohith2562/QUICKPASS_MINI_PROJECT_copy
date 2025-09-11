'use client'

import { useRouter } from 'next/navigation'
import {
    Users,
    UserCheck,
    ClipboardList,
    Settings,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    FileText,
    BarChart3,
    Calendar,
    GraduationCap,
    Crown
} from 'lucide-react'

export default function AdminDashboardPage() {
    const router = useRouter()

    // Sample data - replace with real data from your backend
    const dashboardData = {
        admin: {
            name: 'Dr. Admin Kumar',
            role: 'System Administrator',
            department: 'Administration'
        },
        stats: {
            totalStudents: 1250,
            totalEmployees: 85,
            pendingRequests: 23,
            approvedToday: 45,
            systemAlerts: 3
        },
        recentActivity: [
            { id: 1, type: 'student_registered', user: 'John Doe', action: 'New student registered', time: '10 mins ago' },
            { id: 2, type: 'employee_added', user: 'Prof. Smith', action: 'New teacher added', time: '25 mins ago' },
            { id: 3, type: 'system_alert', user: 'System', action: 'High request volume detected', time: '1 hour ago' }
        ],
        systemHealth: {
            outpassRequests: 156,
            approvalRate: 92,
            avgProcessingTime: '15 mins',
            activeUsers: 234
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'student_registered': return <UserCheck className="w-4 h-4 text-blue-600" />
            case 'employee_added': return <Users className="w-4 h-4 text-green-600" />
            case 'system_alert': return <AlertCircle className="w-4 h-4 text-orange-600" />
            default: return <Clock className="w-4 h-4 text-gray-600" />
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {dashboardData.admin.name.split(' ').slice(-1)[0]}! 👋
                        </h1>
                        <p className="text-green-100">
                            {dashboardData.admin.role} • {dashboardData.admin.department}
                        </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.totalStudents}</div>
                            <div className="text-sm text-green-100">Total Students</div>
                        </div>
                        <div className="w-px h-12 bg-green-400"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.totalEmployees}</div>
                            <div className="text-sm text-green-100">Total Employees</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Overview Cards */}
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
                            <p className="text-sm text-gray-600">System Alerts</p>
                            <p className="text-2xl font-bold text-gray-700">{dashboardData.stats.systemAlerts}</p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-gray-700" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Users</p>
                            <p className="text-2xl font-bold text-green-800">{dashboardData.systemHealth.activeUsers}</p>
                        </div>
                        <div className="bg-green-25 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-green-800" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-[#1F8941]" />
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/admin/student-management')}
                                className="w-full bg-[#1F8941] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1a7a39] transition-colors flex items-center justify-center space-x-2"
                            >
                                <Users className="w-4 h-4" />
                                <span>Manage Students</span>
                            </button>

                            <button
                                onClick={() => router.push('/admin/employee-management')}
                                className="w-full border border-[#1F8941] text-[#1F8941] px-4 py-3 rounded-lg font-medium hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-2"
                            >
                                <UserCheck className="w-4 h-4" />
                                <span>Manage Employees</span>
                            </button>

                            <button
                                onClick={() => router.push('/admin/student-teacher-assignments')}
                                className="w-full border border-[#1F8941] text-[#1F8941] px-4 py-3 rounded-lg font-medium hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-2"
                            >
                                <GraduationCap className="w-4 h-4" />
                                <span>Assign Teachers</span>
                            </button>

                            <button
                                onClick={() => router.push('/admin/teacher-hod-assignments')}
                                className="w-full border border-[#1F8941] text-[#1F8941] px-4 py-3 rounded-lg font-medium hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-2"
                            >
                                <Crown className="w-4 h-4" />
                                <span>Assign HODs</span>
                            </button>

                            <button
                                onClick={() => router.push('/admin/system-reports')}
                                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>View Reports</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-[#1F8941]" />
                                System Health
                            </h2>
                            <button
                                onClick={() => router.push('/admin/system-reports')}
                                className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                            >
                                View Detailed Reports →
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-xl font-bold text-blue-600">{dashboardData.systemHealth.outpassRequests}</div>
                                <div className="text-xs text-blue-800">Today's Requests</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-xl font-bold text-green-600">{dashboardData.systemHealth.approvalRate}%</div>
                                <div className="text-xs text-green-800">Approval Rate</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-xl font-bold text-purple-600">{dashboardData.systemHealth.avgProcessingTime}</div>
                                <div className="text-xs text-purple-800">Avg Processing</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <div className="text-xl font-bold text-orange-600">{dashboardData.systemHealth.activeUsers}</div>
                                <div className="text-xs text-orange-800">Active Users</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-[#1F8941]" />
                        Recent System Activity
                    </h2>
                    <button
                        onClick={() => router.push('/admin/system-reports')}
                        className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                    >
                        View All Activity →
                    </button>
                </div>

                <div className="space-y-3">
                    {dashboardData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    <span className="font-semibold">{activity.user}</span> - {activity.action}
                                </p>
                                <p className="text-xs text-gray-500">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
