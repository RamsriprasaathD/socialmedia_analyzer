import { cookies } from "next/headers";
import { verifyToken } from "../../lib/auth";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !verifyToken(token)) {
    redirect("/login"); // 🚀 force login if no valid token
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl">Welcome to Dashboard 🚀</h1>
    </div>
  );
}
