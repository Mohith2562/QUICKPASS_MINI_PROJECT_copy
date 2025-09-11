'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Bell, User } from 'lucide-react'
import TeacherNotificationButton from '../teacher/NotificationButton/teacherNotificationButton'

export default function TeacherHeader() {
    const router = useRouter()
    const [open, setOpen] = useState(false) // dropdown open state
    const dropdownRef = useRef<HTMLDivElement | null>(null) // ref for dropdown click detection

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header
            className="w-full font-poppins space-y-3 mt-3 mb-3 p-0 px-3"
        // top spacing from other sections
        >

            {/* ---------- Banner Section (full width, no cropping) ---------- */}
            <div className="relative w-full bg-black">
                <Image
                    src="/images/title.png"
                    alt="Banner"
                    width={1920}
                    height={500}
                    style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain', // keeps entire image visible
                    }}
                    priority
                />
            </div>

            {/* ---------- Horizontal Divider Between Banner & Nav ---------- */}
            <div className="w-full border-t border-gray-400"></div>


            {/* ---------- Navigation Bar Section ---------- */}
            <div
                className="relative w-full bg-[#1F8941] border-b border-gray-200 flex items-center"
                style={{ height: '50px' }}
            >
                {/* Centered App Name — truly centered on page */}
                <span
                    className="font-['Albert_Sans-Bold'] font-bold text-white text-[32px] absolute left-1/2 transform -translate-x-1/2 font-bold text-white"
                // style={{
                //   fontSize: '32px',
                //   fontFamily: "'Albert Sans', sans-serif",
                //   width: '185px',
                //   display: 'inline-block',
                // }}
                >
                    QUICKPASS
                </span>

                {/* Right-Side Icons */}
                <div className="ml-auto flex items-center gap-[24px] mr-3">
                    {/* Notification Bell */}
                    <TeacherNotificationButton />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen((s) => !s)}
                            aria-expanded={open}
                            aria-haspopup="true"
                            className="p-0 bg-transparent hover:bg-transparent focus:outline-none text-white hover:opacity-50 transition-opacity"
                        >
                            <User className="w-[36px] h-[36px]" />
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                <div className="divide-y">
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                                        onClick={() => {
                                            router.push('/teacher/profile-settings')
                                            setOpen(false)
                                        }}
                                    >
                                        Profile Settings
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                                        onClick={() => {
                                            router.push('/login')
                                            setOpen(false)
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* ---------- Horizontal Divider Between nav & side-bar ---------- */}
            <div className="w-full border-t border-gray-400"></div>

        </header>
    )
}
