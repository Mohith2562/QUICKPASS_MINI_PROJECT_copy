"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock } from "lucide-react";

export default function Box() {
  const router = useRouter();

  const [studentForm, setStudentForm] = useState({ email: "", password: "" });
  const [employeeForm, setEmployeeForm] = useState({ email: "", password: "" });
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });

  const loginCards = [
    {
      id: "student",
      title: "Student Login",
      form: studentForm,
      setForm: setStudentForm,
      redirectPath: "/student",
    },
    {
      id: "employee",
      title: "Employee Login",
      form: employeeForm,
      setForm: setEmployeeForm,
    }, // no fixed path here
    {
      id: "admin",
      title: "Admin Login",
      form: adminForm,
      setForm: setAdminForm,
      redirectPath: "/admin",
    },
  ];

  const handleInputChange = (cardId: string, field: string, value: string) => {
    const card = loginCards.find((c) => c.id === cardId);
    if (card) {
      card.setForm((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleLogin = async (cardId: string) => {
    const card = loginCards.find((c) => c.id === cardId);
    if (!card) return;

    const { email, password } = card.form;
    console.log(`Attempting login for ${card.title} with email: ${email}`);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <-- crucial for cookie auth
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Login successful!", data);

        // Role check
        if (data.role !== cardId && cardId !== "employee") {
          console.error(`Login failed: Invalid role for ${card.title} card.`);
          alert("Login failed: Invalid role for this login card.");
          return;
        }

        // Save token + user info (optional if you want token for API calls via Authorization header)
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        // Role-based redirect
        if (cardId === "employee") {
          if (data.role === "mentor" || data.role === "faculty") {
            router.push("/teacher");
          } else if (data.role === "hod") {
            router.push("/hod");
          } else if (data.role === "protocol_officer") {
            router.push("/protocol");
          } else {
            alert("Unknown employee role. Please contact admin.");
          }
        } else {
          router.push(card.redirectPath!);
        }
      } else {
        const error = await res.json();
        console.error("Login failed:", error.message);
        alert(`Login failed: ${error.message}`);
      }
    } catch (err) {
      console.error("Network or server error:", err);
      alert("Network or server error. Please try again.");
    }
  };

  const handleForgotPassword = (cardId: string) => {
    alert(`Forgot password for ${cardId} is not implemented yet.`);
  };

  return (
    <main className="flex flex-col min-h-screen items-center bg-white overscroll-none">
      {/* Header */}
      <header className="w-full px-3 my-3 space-y-3">
        <div>
          <Image
            src="/images/title.png"
            alt="Title header"
            width={1242}
            height={149}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="w-full">
          <Image
            src="/images/line1.png"
            alt="Divider line"
            width={1242}
            height={1}
            className="w-full h-auto"
          />
        </div>
      </header>

      {/* Banner */}
      <div className="w-full px-3">
        <h1 className="w-full bg-[#1f8941] flex justify-center items-center font-['Albert_Sans-Bold'] font-bold text-white text-2xl sm:text-3xl py-3">
          QUICKPASS
        </h1>
      </div>

      {/* Login Cards */}
      <div className="w-full flex flex-wrap justify-evenly items-center grow py-6 md:px-8 lg:px-12">
        {loginCards.map((card) => (
          <section
            key={card.id}
            className="w-full my-3 sm:w-[calc(50%-12px)] md:w-[300px] bg-[#fffefc] rounded-lg border border-[#bebab9] shadow-md p-4"
            aria-labelledby={`${card.id}-title`}
          >
            <h2
              id={`${card.id}-title`}
              className="font-medium text-[#1f8941] text-2xl text-center mb-4"
            >
              {card.title}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(card.id);
              }}
              className="space-y-4"
            >
              {/* Email */}
              <div className="relative">
                <User
                  size={20}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-green-700"
                />
                <input
                  type="email"
                  value={card.form.email}
                  onChange={(e) => handleInputChange(card.id, "email", e.target.value)}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-2 border border-[#bebab9] rounded-lg"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-green-700"
                />
                <input
                  type="password"
                  value={card.form.password}
                  onChange={(e) => handleInputChange(card.id, "password", e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2 border border-[#bebab9] rounded-lg"
                  required
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-[#1f8941] text-white py-2 rounded-lg text-lg hover:bg-[#1a7a39] transition duration-200"
              >
                Login
              </button>
            </form>

            <button
              type="button"
              onClick={() => handleForgotPassword(card.id)}
              className="block mt-3 mx-auto text-sm hover:text-[#1f8941]"
            >
              Forgot Password
            </button>
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="w-full mt-auto px-3 mb-3">
        <Image
          src="/bott.png"
          alt="Bottom background"
          width={1242}
          height={62}
          className="w-full h-auto"
        />
      </footer>
    </main>
  );
}
