// app/(auth)/layout.tsx

import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  description: "Login or Signup to HITAM Quickpass",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div >
      
        <div >
          {children}
        </div>

        
        </div>
      
  );
}
