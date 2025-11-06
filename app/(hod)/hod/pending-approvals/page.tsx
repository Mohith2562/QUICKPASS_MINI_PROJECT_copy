"use client"

import { useState, useEffect, useCallback } from 'react'
import {
    Clock,
    CheckCircle,
    XCircle,
    Phone, // Still useful for a visual indicator
    User,
    Search,
    GraduationCap,
    Shield
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function PendingApprovalsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [pendingRequests, setPendingRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [notes, setNotes] = useState('')

    // Define fetchOutpasses outside of useEffect to make it reusable
    const fetchOutpasses = useCallback(async () => {
        const token = localStorage.getItem('token')
        
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true)
            const res = await fetch(`${API_URL}/api/outpass/pending`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Failed to fetch outpasses')
            }
            const data = await res.json()
            setPendingRequests(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOutpasses()
    }, [fetchOutpasses])

    // Handle HOD's decision
    const handleHodDecision = async (id: string, decision: 'approved' | 'rejected') => {
        const token = localStorage.getItem('token')
        if (!token) {
            alert('Authentication token missing. Please log in again.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/outpass/${id}/hod-approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: decision, notes }),
            })
            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Failed to update outpass status')
            }
            
            // Re-fetch the data to get the updated list
            await fetchOutpasses()

        } catch (err: any) {
            console.error(err);
            alert('Error submitting decision: ' + err.message);
        }
    }

    const filteredRequests = pendingRequests.filter(request => {
        const matchesSearch =
            request.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.studentId?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.reason?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

    if (loading) return <div className="p-6">Loading pending requests...</div>
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#005128] to-[#123118] text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2 flex items-center">
                            <Shield className="w-6 h-6 mr-2" />
                            Pending HOD Approvals
                        </h1>
                        <p className="text-green-100">Review and approve outpass requests</p>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{filteredRequests.length}</div>
                        <div className="text-sm text-green-100">Awaiting Approval</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F8941] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Approvals List */}
            <div className="space-y-4">
                {filteredRequests.map((request) => (
                    <div key={request._id} className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{request.studentId?.name}</h3>
                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Faculty Approved
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {request.studentId?.rollNumber} • {request.studentId?.department}
                                    </p>
                                    <p className="text-sm text-gray-600">Faculty Approved: <span className="font-medium">{new Date(request.facultyApproval?.timestamp).toLocaleString()}</span></p>
                                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                        <p className="text-sm"><span className="font-medium">Reason:</span> {request.reason}</p>
                                        <p className="text-sm"><span className="font-medium">From:</span> {new Date(request.dateFrom).toLocaleString()}</p>
                                        <p className="text-sm"><span className="font-medium">To:</span> {new Date(request.dateTo).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">#{request._id}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 mt-4">
                            <button
                                onClick={() => handleHodDecision(request._id, 'approved')}
                                className="bg-green-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center space-x-1"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Approve</span>
                            </button>

                            <button
                                onClick={() => handleHodDecision(request._id, 'rejected')}
                                className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center space-x-1"
                            >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredRequests.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No pending approvals found</p>
                </div>
            )}
        </div>
    )
}