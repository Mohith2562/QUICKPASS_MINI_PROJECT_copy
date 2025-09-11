"use client"

import { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  User,
  Search,
  GraduationCap
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function PendingRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For parent verification screen
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [facultyApproval, setFacultyApproval] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [notes, setNotes] = useState('')

  // Define fetchOutpasses outside of useEffect to make it reusable
  const fetchOutpasses = useCallback(async () => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If no token exists, set an error and stop
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
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch outpasses');
      }
      const data = await res.json()
      setPendingRequests(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array means the function is only created once

  // Use useEffect to call the function on initial load
  useEffect(() => {
    fetchOutpasses()
  }, [fetchOutpasses]) // Add fetchOutpasses to the dependency array

  // Approve/Reject functions
  const handleFacultyDecision = async (id: string, decision: 'approved' | 'rejected') => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token missing. Please log in again.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/outpass/${id}/faculty-approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Use the token from localStorage
        },
        body: JSON.stringify({ status: decision, notes }),
      })
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update outpass');
      }

      // Re-fetch the data to get the updated list
      await fetchOutpasses();
      setSelectedRequest(null); // go back to list
      resetVerification();
    } catch (err: any) {
      console.error(err);
      alert('Error submitting decision: ' + err.message);
    }
  }

  const resetVerification = () => {
    setFacultyApproval('pending')
    setNotes('')
  }

  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch =
      request.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentId?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // ... (rest of the component)
  if (selectedRequest) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
          <h1 className="text-2xl font-bold flex items-center">
            <Phone className="w-6 h-6 mr-2" />
            Outpass Review
          </h1>
          <p className="text-green-100">Review request and approve/reject</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-[#1F8941]" />
              Request Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedRequest.studentId?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.studentId?.rollNumber} • {selectedRequest.studentId?.department}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-sm"><span className="font-medium">Reason:</span> {selectedRequest.reason}</p>
                <p className="text-sm"><span className="font-medium">From:</span> {new Date(selectedRequest.dateFrom).toLocaleString()}</p>
                <p className="text-sm"><span className="font-medium">To:</span> {new Date(selectedRequest.dateTo).toLocaleString()}</p>
                <p className="text-sm"><span className="font-medium">Parent Phone:</span> {selectedRequest.studentId?.parentPhone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Faculty Approval Buttons */}
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-[#1F8941]" />
                Faculty Decision
              </h2>
              <p className="text-sm text-gray-600 mb-4">Please manually call the parent at the number provided to verify the request.</p>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleFacultyDecision(selectedRequest._id, 'approved')}
                  className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleFacultyDecision(selectedRequest._id, 'rejected')}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F8941]"
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Back Button */}
            <button
              onClick={() => { setSelectedRequest(null); resetVerification() }}
              className="mt-4 text-sm text-gray-500 hover:underline"
            >
              ← Back to Pending Requests
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================
  //  PENDING LIST SCREEN
  // ============================
  if (loading) return <div className="p-6">Loading pending requests...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Pending Requests
            </h1>
            <p className="text-green-100">Review and process student outpass requests</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{filteredRequests.length}</div>
            <div className="text-sm text-green-100">Pending</div>
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request._id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{request.studentId?.name}</h3>
                  <p className="text-sm text-gray-600">
                    {request.studentId?.rollNumber} • {request.studentId?.department}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">#{request._id}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
              <p className="text-sm text-gray-900">{request.reason}</p>
              <p className="text-sm font-medium text-gray-700 mt-2">From:</p>
              <p className="text-sm text-gray-900">{new Date(request.dateFrom).toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-700 mt-2">To:</p>
              <p className="text-sm text-gray-900">{new Date(request.dateTo).toLocaleString()}</p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedRequest(request)}
                className="bg-[#1F8941] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#166a2f] transition-colors flex items-center space-x-1"
              >
                <Phone className="w-3 h-3" />
                <span>Review Request</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No pending requests found</p>
        </div>
      )}
    </div>
  )
}
