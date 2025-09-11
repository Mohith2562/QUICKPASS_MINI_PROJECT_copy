"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import StudentHeader from "@/app/components/common/StudentHeader";
import StudentSidebar from "@/app/components/common/StudentSidebar";
import Footer from "@/app/components/common/Footer";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-[#FFFFFF] m-0 p-0 flex flex-col">
            {/* Top header */}
            <StudentHeader />

            {/* Sidebar + Content - flex-1 to take remaining space */}
            <div className="flex px-3 flex-1">
                {/* Sidebar with fixed width */}
                <div className="w-72">
                    <StudentSidebar />
                </div>

                {/* Main content area */}
                <main className="flex-1 relative overflow-hidden px-3 ">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            {/* Footer */}
            <Footer />
        </div>
    );
}
