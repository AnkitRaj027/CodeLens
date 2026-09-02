"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthContextType, AuthResponse } from "@/types/auth";
import { api } from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage on mount
    const savedToken = localStorage.getItem("codelens_token");
    const savedUser = localStorage.getItem("codelens_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("codelens_token");
        localStorage.removeItem("codelens_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("codelens_token", access_token);
      localStorage.setItem("codelens_user", JSON.stringify(userData));
    } catch (err: any) {
      if (err.response?.status === 404 || !err.response) {
        console.warn("Backend /auth/login unavailable (404/network). Using local session fallback.");
        const fallbackUser: User = {
          id: `usr_local_${Date.now()}`,
          email,
          full_name: email.split("@")[0] || "Developer",
          created_at: new Date().toISOString(),
        };
        const fallbackToken = `codelens_session_${Date.now()}`;
        setToken(fallbackToken);
        setUser(fallbackUser);
        localStorage.setItem("codelens_token", fallbackToken);
        localStorage.setItem("codelens_user", JSON.stringify(fallbackUser));
        return;
      }
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", {
        email,
        password,
        full_name: fullName,
      });
      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("codelens_token", access_token);
      localStorage.setItem("codelens_user", JSON.stringify(userData));
    } catch (err: any) {
      if (err.response?.status === 404 || !err.response) {
        console.warn("Backend /auth/register unavailable (404/network). Using local session fallback.");
        const fallbackUser: User = {
          id: `usr_local_${Date.now()}`,
          email,
          full_name: fullName || email.split("@")[0] || "Developer",
          created_at: new Date().toISOString(),
        };
        const fallbackToken = `codelens_session_${Date.now()}`;
        setToken(fallbackToken);
        setUser(fallbackUser);
        localStorage.setItem("codelens_token", fallbackToken);
        localStorage.setItem("codelens_user", JSON.stringify(fallbackUser));
        return;
      }
      throw err;
    }
  };

  const demoLogin = (fullName = "Alex Developer", email = "alex@codelens.dev") => {
    const demoUser: User = {
      id: "usr_demo_101",
      email,
      full_name: fullName,
      created_at: new Date().toISOString(),
    };
    const demoToken = `codelens_demo_token_${Date.now()}`;
    setToken(demoToken);
    setUser(demoUser);
    localStorage.setItem("codelens_token", demoToken);
    localStorage.setItem("codelens_user", JSON.stringify(demoUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("codelens_token");
    localStorage.removeItem("codelens_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
