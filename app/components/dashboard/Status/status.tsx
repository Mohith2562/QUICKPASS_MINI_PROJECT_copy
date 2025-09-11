'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, XCircle, AlertCircle, RefreshCw, X, User, FileText, Shield, Download } from 'lucide-react'

interface Outpass {
  _id: string
  reason: string
  dateFrom: string
  dateTo: string
  status: 'pending_faculty' | 'pending_hod' | 'approved' | 'rejected'
  facultyApproval: { status: string; timestamp?: string }
  hodApproval: { status: string; timestamp?: string }
  createdAt: string
  updatedAt: string
  studentId: {
    name: string
    rollNumber: string
    department: string
  }
}

export default function Status() {
  const router = useRouter()
  const [outpass, setOutpass] = useState<Outpass | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchOutpass = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/outpass/mine', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Failed to fetch outpass')
      const data: Outpass[] = await res.json()

      if (data.length === 0) {
        setOutpass(null)
      } else {
        setOutpass(data[0]) // latest request
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOutpass()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchOutpass()
  }

  const handleCancelRequest = () => {
    if (confirm('Are you sure you want to cancel this request?')) {
      router.push('/student/profile')
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_faculty':
        return {
          color: 'text-yellow-800 bg-yellow-100 border-yellow-400',
          icon: <Clock className="w-6 h-6" />,
          title: 'Waiting for Faculty Approval',
          message: 'Your request is pending faculty review.'
        }
      case 'pending_hod':
        return {
          color: 'text-blue-800 bg-blue-100 border-blue-400',
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Waiting for HOD Approval',
          message: 'Your request has been approved by faculty and is waiting for HOD review.'
        }
      case 'approved':
        return {
          color: 'text-green-700 bg-green-50 border-green-300',
          icon: <CheckCircle className="w-6 h-6" />,
          title: 'Approved',
          message: 'Your outpass request has been approved!'
        }
      case 'rejected':
        return {
          color: 'text-red-700 bg-red-100 border-red-300',
          icon: <XCircle className="w-6 h-6" />,
          title: 'Rejected',
          message: 'Your outpass request has been rejected.'
        }
      default:
        return {
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: <Clock className="w-6 h-6" />,
          title: 'Unknown Status',
          message: 'Please refresh to get the latest status.'
        }
    }
  }

  if (loading) {
    return <p className="p-6">Loading...</p>
  }

  if (error) {
    return <p className="p-6 text-red-600">Error: {error}</p>
  }

  if (!outpass) {
    return <p className="p-6 text-gray-600">No outpass requests found.</p>
  }

  const statusConfig = getStatusConfig(outpass.status)

  return (
    <div className="p-6 space-y-6">
      {/* Status Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Request Status</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className={`p-6 rounded-lg border ${statusConfig.color}`}>
          <div className="flex items-center space-x-4">
            <div>{statusConfig.icon}</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{statusConfig.title}</h2>
              <p className="text-sm mt-1">{statusConfig.message}</p>
              <p className="text-xs mt-2 font-mono">Outpass ID: {outpass._id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Applied On</p>
              <p className="text-xs">{new Date(outpass.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Request Details
        </h2>
        <p><b>Reason:</b> {outpass.reason}</p>
        <p><b>From:</b> {new Date(outpass.dateFrom).toLocaleString()}</p>
        <p><b>To:</b> {new Date(outpass.dateTo).toLocaleString()}</p>
        <p><b>Faculty Approval:</b> {outpass.facultyApproval.status}</p>
        <p><b>HOD Approval:</b> {outpass.hodApproval.status}</p>
      </div>

      {/* Gatepass Display */}
      {outpass.status === 'approved' && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Digital Gatepass
          </h2>
          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6 rounded-lg">
            <p className="text-lg font-bold">QUICKPASS</p>
            <p className="mt-2">{outpass.studentId.name} ({outpass.studentId.rollNumber})</p>
            <p className="text-sm opacity-80">{outpass.studentId.department}</p>
            <p className="mt-4 text-sm">Valid From: {new Date(outpass.dateFrom).toLocaleString()}</p>
            <p className="text-sm">Valid Until: {new Date(outpass.dateTo).toLocaleString()}</p>
          </div>
          <button className="w-full mt-4 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download Gatepass</span>
          </button>
        </div>
      )}

      {/* Actions */}
      {(outpass.status === 'pending_faculty' || outpass.status === 'pending_hod') && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <button
            onClick={handleCancelRequest}
            className="w-full border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel Request</span>
          </button>
        </div>
      )}
    </div>
  )
}
