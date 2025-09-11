'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Users,
    Search,
    UserPlus,
    Eye,
    Edit,
    Shield,
    GraduationCap,
    Lock
} from 'lucide-react'

export default function EmployeeManagementPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedRole, setSelectedRole] = useState('all')

    const employeesData = [
        {
            id: 'T001',
            name: 'Dr. Sarah Johnson',
            role: 'Teacher',
            department: 'Computer Science',
            email: 'sarah.johnson@college.edu',
            phone: '+91 9876543210',
            status: 'active'
        },
        {
            id: 'H001',
            name: 'Prof. Michael Smith',
            role: 'HOD',
            department: 'Electronics',
            email: 'michael.smith@college.edu',
            phone: '+91 9876543211',
            status: 'active'
        },
        {
            id: 'S001',
            name: 'Mr. Rajesh Kumar',
            role: 'Security',
            department: 'Security',
            email: 'rajesh.kumar@college.edu',
            phone: '+91 9876543212',
            status: 'active'
        }
    ]

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'Teacher': return <GraduationCap className="w-4 h-4" />
            case 'HOD': return <Users className="w-4 h-4" />
            case 'Security': return <Shield className="w-4 h-4" />
            default: return <Users className="w-4 h-4" />
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Teacher': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'HOD': return 'text-purple-600 bg-purple-50 border-purple-200'
            case 'Security': return 'text-orange-600 bg-orange-50 border-orange-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2 flex items-center">
                            <Users className="w-6 h-6 mr-2" />
                            Employee Management
                        </h1>
                        <p className="text-green-100">
                            Manage teacher, HOD, and security staff profiles
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/admin/employee-management/add')}
                        className="bg-white text-[#1F8941] px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center space-x-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Employee</span>
                    </button>
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
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F8941] focus:border-transparent"
                            />
                        </div>

                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F8941] focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="Teacher">Teachers</option>
                            <option value="HOD">HODs</option>
                            <option value="Security">Security</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employeesData.map((employee) => (
                    <div key={employee.id} className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${getRoleColor(employee.role)}`}>
                                    {getRoleIcon(employee.role)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                                    <p className="text-sm text-gray-500">{employee.id}</p>
                                </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRoleColor(employee.role)}`}>
                                {employee.role}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Department:</span> {employee.department}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Email:</span> {employee.email}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Phone:</span> {employee.phone}
                            </p>
                        </div>

                        <div className="flex space-x-2">
                            <button className="flex-1 bg-[#1F8941] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#1a7a39] transition-colors flex items-center justify-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                            </button>
                            <button className="flex-1 border border-[#1F8941] text-[#1F8941] px-3 py-2 rounded-lg text-sm hover:bg-[#1F8941] hover:text-white transition-colors flex items-center justify-center space-x-1">
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
