'use client'

import { useState } from 'react'
import {
    Phone,
    User,
    CheckCircle,
    XCircle,
    GraduationCap
} from 'lucide-react'

export default function ParentVerificationPage() {
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'completed'>('idle')
    const [verificationResult, setVerificationResult] = useState<'approved' | 'rejected' | null>(null)
    const [facultyApproval, setFacultyApproval] = useState<'pending' | 'approved' | 'rejected'>('pending')
    const [notes, setNotes] = useState('')

    // Sample request data
    const currentRequest = {
        id: 'REQ001',
        student: 'John Doe',
        studentId: 'CS21B1001',
        class: '3rd Year CSE',
        reason: 'Medical Appointment',
        category: 'Appointments',
        exitTime: '2024-01-15 14:30',
        parentName: 'Mr. Robert Doe',
        parentPhone: '+91 9876543210',
        submittedTime: '10 mins ago'
    }

    const handleStartCall = () => {
        setCallStatus('calling')
        setTimeout(() => setCallStatus('connected'), 2000) // simulate connection
    }

    const handleVerificationComplete = (result: 'approved' | 'rejected') => {
        setVerificationResult(result)
        setCallStatus('completed')
    }

    const handleFacultyApproval = (result: 'approved' | 'rejected') => {
        setFacultyApproval(result)
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F8941] to-[#1a7a39] text-white rounded-xl p-6">
                <h1 className="text-2xl font-bold flex items-center">
                    <Phone className="w-6 h-6 mr-2" />
                    Parent Verification
                </h1>
                <p className="text-green-100">Verify outpass requests by calling parents & faculty</p>
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
                                <h3 className="font-semibold text-gray-900">{currentRequest.student}</h3>
                                <p className="text-sm text-gray-600">{currentRequest.studentId} • {currentRequest.class}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <p className="text-sm"><span className="font-medium">Reason:</span> {currentRequest.reason}</p>
                            <p className="text-sm"><span className="font-medium">Category:</span> {currentRequest.category}</p>
                            <p className="text-sm"><span className="font-medium">Exit Time:</span> {currentRequest.exitTime}</p>
                            <p className="text-sm"><span className="font-medium">Submitted:</span> {currentRequest.submittedTime}</p>
                        </div>
                    </div>
                </div>

                {/* Call + Approval Interface */}
                <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
                    {/* Parent Verification */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-[#1F8941]" />
                            Parent Contact
                        </h2>

                        <div className="space-y-4 text-center">
                            {callStatus === 'idle' && (
                                <button
                                    onClick={handleStartCall}
                                    className="bg-[#1F8941] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a7a39] transition-colors flex items-center justify-center mx-auto"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Parent
                                </button>
                            )}

                            {callStatus === 'calling' && (
                                <p className="text-yellow-600 font-medium animate-pulse">Calling parent...</p>
                            )}

                            {callStatus === 'connected' && (
                                <div className="space-y-4">
                                    <p className="text-green-600 font-medium">Connected - Speak with parent</p>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => handleVerificationComplete('approved')}
                                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                        >
                                            Parent Approved
                                        </button>
                                        <button
                                            onClick={() => handleVerificationComplete('rejected')}
                                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                        >
                                            Parent Rejected
                                        </button>
                                    </div>
                                </div>
                            )}

                            {callStatus === 'completed' && verificationResult && (
                                <p className={`font-medium ${verificationResult === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                    Parent {verificationResult === 'approved' ? 'Approved' : 'Rejected'} the request
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Faculty Approval */}
                    {verificationResult === 'approved' && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2 text-[#1F8941]" />
                                Faculty Approval
                            </h2>

                            {facultyApproval === 'pending' && (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleFacultyApproval('approved')}
                                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                    >
                                        Faculty Approved
                                    </button>
                                    <button
                                        onClick={() => handleFacultyApproval('rejected')}
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                    >
                                        Faculty Rejected
                                    </button>
                                </div>
                            )}

                            {facultyApproval !== 'pending' && (
                                <p className={`font-medium ${facultyApproval === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                    Faculty {facultyApproval === 'approved' ? 'Approved' : 'Rejected'} the request
                                </p>
                            )}
                        </div>
                    )}

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
                </div>
            </div>
        </div>
    )
}
