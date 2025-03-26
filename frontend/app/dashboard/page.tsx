"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <ProtectedRoute>
    <div className="container">
      <h2>Welcome to Dashboard</h2>
      <button onClick={logout}>Logout</button>
    </div>
    </ProtectedRoute>
  );
}
