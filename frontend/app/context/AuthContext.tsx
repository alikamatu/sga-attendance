"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation"; // Updated import for Next.js 15
import { AuthContextType, User } from "../type/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Changed null to undefined

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const isValid = await verifyToken(token);
          if (isValid) {
            setUser({ token });
          } else {
            localStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
  
      const data = await res.json();
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", data.token);
        setUser({ token: data.token, email });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }

      router.push("/login");
    } catch (err) {
      console.error("Registration failed", err);
      throw err;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Changed check from !context to context === undefined
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};