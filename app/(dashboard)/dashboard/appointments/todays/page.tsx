import TodayAppointments from "@/app/components/dashboard/appointments/todays";
import { TodayAppointmentRecord } from "@/app/types/appointments/today";

const dummyData: TodayAppointmentRecord[] = [
  {
    applicationNumber: "APP001",
    membershipNumber: "MEM001",
    type: "Consultation",
    name: "Dr. Aarti Sharma",
    email: "aarti@example.com",
    mobile: "9876543210",
    timeAndDate: "2025-07-08 10:30 AM",
    category: "General",
  },
  
  {
    applicationNumber: "APP002",
    membershipNumber: "MEM002",
    type: "Follow-up",
    name: "Dr. Vijay Kumar",
    email: "vijay@example.com",
    mobile: "9123456789",
    timeAndDate: "2025-07-08 2:15 PM",
    category: "Orthodontics",
  },
    {
    applicationNumber: "APP003",
    membershipNumber: "MEM003",
    type: "Follow-up",
    name: "Dr. Satish Kumar",
    email: "kumar@example.com",
    mobile: "8886016033",
    timeAndDate: "2025-07-10 2:15 PM",
    category: "Orthodontics",
  },
];

export default function Page() {
  return <TodayAppointments data={dummyData} />;
}
