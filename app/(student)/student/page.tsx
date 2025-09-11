'use client'

import { useRouter } from 'next/navigation'
import {
    User,
    Plus,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    TrendingUp,
    FileText,
    Bell,
    Eye,
    History,
    Trophy,
    Shield
} from 'lucide-react'

export default function StudentDashboardPage() {
    const router = useRouter()

    // Sample data - replace with real data from your backend
    const dashboardData = {
        student: {
            name: 'John Doe',
            collegeId: 'CS21B1001',
            class: '3rd Year',
            department: 'Computer Science Engineering'
        },
        currentRequest: {
            hasActive: true,
            status: 'approved', // 'pending', 'approved', 'rejected', null
            id: 'GP2024001',
            reason: 'Medical Appointment',
            exitTime: '2024-01-15 14:30',
            validUntil: '2024-01-15 18:00'
        },
        stats: {
            totalRequests: 15,
            approvedRequests: 13,
            rejectedRequests: 2,
            approvalRate: 87,
            currentScore: 85
        },
        recentActivity: [
            { id: 1, type: 'approved', reason: 'Medical Appointment', date: '2024-01-15', time: '10:30' },
            { id: 2, type: 'rejected', reason: 'Personal Work', date: '2024-01-12', time: '09:15' },
            { id: 3, type: 'approved', reason: 'Family Emergency', date: '2024-01-10', time: '08:45' }
        ]
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'text-green-700 bg-green-50 border-green-300'
            case 'rejected': return 'text-gray-700 bg-gray-100 border-gray-300'
            case 'pending': return 'text-green-600 bg-green-25 border-green-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-5 h-5" />
            case 'rejected': return <XCircle className="w-5 h-5" />
            case 'pending': return <AlertCircle className="w-5 h-5" />
            default: return <Clock className="w-5 h-5" />
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Welcome back, {dashboardData.student.name.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-green-100">
                            {dashboardData.student.collegeId} • {dashboardData.student.class} • {dashboardData.student.department}
                        </p>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.totalRequests}</div>
                            <div className="text-sm text-green-100">Total Requests</div>
                        </div>
                        <div className="w-px h-12 bg-green-400"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{dashboardData.stats.approvalRate}%</div>
                            <div className="text-sm text-green-100">Approval Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Status */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-[#1F8941]" />
                                Current Status
                            </h2>
                            <button
                                onClick={() => router.push('/student/status')}
                                className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                            >
                                View Details →
                            </button>
                        </div>

                        {dashboardData.currentRequest.hasActive ? (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-lg border ${getStatusColor(dashboardData.currentRequest.status)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(dashboardData.currentRequest.status)}
                                            <span className="font-medium capitalize">{dashboardData.currentRequest.status}</span>
                                        </div>
                                        <span className="text-sm font-mono">#{dashboardData.currentRequest.id}</span>
                                    </div>
                                    <p className="text-sm mb-2">{dashboardData.currentRequest.reason}</p>
                                    <div className="flex items-center justify-between text-xs">
                                        <span>Exit Time: {dashboardData.currentRequest.exitTime}</span>
                                        {dashboardData.currentRequest.status === 'approved' && (
                                            <span>Valid Until: {dashboardData.currentRequest.validUntil}</span>
                                        )}
                                    </div>
                                </div>

                                {dashboardData.currentRequest.status === 'approved' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-green-800">✓ Gatepass Ready</h3>
                                                <p className="text-sm text-green-700">Show this to security when exiting</p>
                                            </div>
                                            <button
                                                onClick={() => router.push('/student/status')}
                                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                                            >
                                                View Gatepass
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 mb-2">No active requests</p>
                                <p className="text-sm text-gray-400 mb-4">Ready to apply for a new outpass?</p>
                                <button
                                    onClick={() => router.push('/student/apply')}
                                    className="bg-[#1F8941] text-white px-6 py-2 rounded-lg hover:bg-[#1a7a39] transition-colors inline-flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Apply New Outpass</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/student/apply')}
                                className="w-full bg-[#1F8941] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1a7a39] transition-colors flex items-center justify-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Apply New Outpass</span>
                            </button>

                            <button
                                onClick={() => router.push('/student/status')}
                                className="w-full border border-[#1F8941] text-[#1F8941] px-4 py-3 rounded-lg font-medium hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-2"
                            >
                                <Eye className="w-4 h-4" />
                                <span>Check Status</span>
                            </button>

                            <button
                                onClick={() => router.push('/student/history')}
                                className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <History className="w-4 h-4" />
                                <span>View History</span>
                            </button>
                        </div>
                    </div>

                    {/* Score Overview */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Trophy className="w-5 h-5 mr-2 text-[#1F8941]" />
                                My Score
                            </h2>
                            <button
                                onClick={() => router.push('/student/myoutpassScore')}
                                className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                            >
                                View Details →
                            </button>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                                {dashboardData.stats.currentScore}
                            </div>
                            <div className="text-sm text-gray-500 mb-3">Good Performance</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${dashboardData.stats.currentScore}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <History className="w-5 h-5 mr-2 text-[#1F8941]" />
                        Recent Activity
                    </h2>
                    <button
                        onClick={() => router.push('/student/history')}
                        className="text-sm text-[#1F8941] hover:text-[#1a7a39] font-medium"
                    >
                        View All →
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dashboardData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.type)}`}>
                                {getStatusIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{activity.reason}</p>
                                <p className="text-xs text-gray-500">{activity.date} at {activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#1F8941]" />
                    Overview Statistics
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{dashboardData.stats.totalRequests}</div>
                        <div className="text-sm text-green-600">Total Requests</div>
                    </div>
                    <div className="text-center p-4 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-800">{dashboardData.stats.approvedRequests}</div>
                        <div className="text-sm text-green-700">Approved</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">{dashboardData.stats.rejectedRequests}</div>
                        <div className="text-sm text-gray-600">Rejected</div>
                    </div>
                    <div className="text-center p-4 bg-green-25 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{dashboardData.stats.approvalRate}%</div>
                        <div className="text-sm text-green-500">Success Rate</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
