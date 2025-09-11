'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    UserPlus,
    GraduationCap,
    Calendar,
    TrendingUp,
    AlertTriangle
} from 'lucide-react'

export default function StudentManagementPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('all')

    // Sample data - replace with real data from your backend
    const studentsData = [
        {
            id: 'CS21B1001',
            name: 'John Doe',
            class: '3rd Year',
            department: 'Computer Science',
            attendance: 85,
            totalRequests: 12,
            approvedRequests: 10,
            score: 85,
            status: 'active'
        },
        {
            id: 'EC21B1002',
            name: 'Jane Smith',
            class: '3rd Year',
            department: 'Electronics',
            attendance: 92,
            totalRequests: 8,
            approvedRequests: 8,
            score: 95,
            status: 'active'
        },
        {
            id: 'ME21B1003',
            name: 'Mike Johnson',
            class: '3rd Year',
            department: 'Mechanical',
            attendance: 67,
            totalRequests: 15,
            approvedRequests: 9,
            score: 65,
            status: 'warning'
        },
        {
            id: 'CS21B1004',
            name: 'Sarah Wilson',
            class: '3rd Year',
            department: 'Computer Science',
            attendance: 88,
            totalRequests: 6,
            approvedRequests: 6,
            score: 90,
            status: 'active'
        }
    ]

    const stats = {
        totalStudents: 1250,
        activeStudents: 1180,
        lowAttendance: 45,
        highPerformers: 320
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-50 border-green-200'
            case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'inactive': return 'text-red-600 bg-red-50 border-red-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const filteredStudents = studentsData.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.department.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter

        return matchesSearch && matchesFilter
    })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2 flex items-center">
                            <Users className="w-6 h-6 mr-2" />
                            Student Management
                        </h1>
                        <p className="text-green-100">
                            Manage student profiles, attendance, and outpass history
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/admin/student-management/add')}
                        className="bg-white text-[#1F8941] px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Students</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Students</p>
                            <p className="text-2xl font-bold text-green-600">{stats.activeStudents}</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Low Attendance</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.lowAttendance}</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">High Performers</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.highPerformers}</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F8941] focus:border-transparent"
                            />
                        </div>

                        <select
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F8941] focus:border-transparent"
                        >
                            <option value="all">All Students</option>
                            <option value="active">Active</option>
                            <option value="warning">Warning</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <button className="bg-[#1F8941] text-white px-4 py-2 rounded-lg hover:bg-[#1a7a39] transition-colors flex items-center space-x-2">
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                    </button>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Attendance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Outpass Stats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            <div className="text-sm text-gray-500">{student.id}</div>
                                            <div className="text-sm text-gray-500">{student.class}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{student.department}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{student.attendance}%</div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                                className={`h-1.5 rounded-full ${student.attendance >= 75 ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${student.attendance}%` }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {student.approvedRequests}/{student.totalRequests}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {Math.round((student.approvedRequests / student.totalRequests) * 100)}% approved
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.score}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(student.status)}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button className="text-[#1F8941] hover:text-[#1a7a39]">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <Edit className="w-4 h-4" />
                                        </button>
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
