import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "../types";
import api from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("parkingspot_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("parkingspot_token");
  });
  const [loading, setLoading] = useState<boolean>(true);

  const role = user?.role || null;

  const refreshUser = async () => {
    const currentToken = localStorage.getItem("parkingspot_token");
    if (!currentToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/auth/me");
      if (res.data.success && res.data.data?.user) {
        setUser(res.data.data.user);
        localStorage.setItem("parkingspot_user", JSON.stringify(res.data.data.user));
      }
    } catch (err) {
      console.warn("Failed to refresh user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post("/auth/login", { email, password });
    if (res.data.success && res.data.data) {
      const { token: newTok, user: newUser } = res.data.data;
      setToken(newTok);
      setUser(newUser);
      localStorage.setItem("parkingspot_token", newTok);
      localStorage.setItem("parkingspot_user", JSON.stringify(newUser));
      return newUser;
    } else {
      throw new Error(res.data.message || "Login failed");
    }
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.post("/auth/register", data);
    if (res.data.success && res.data.data) {
      const { token: newTok, user: newUser } = res.data.data;
      setToken(newTok);
      setUser(newUser);
      localStorage.setItem("parkingspot_token", newTok);
      localStorage.setItem("parkingspot_user", JSON.stringify(newUser));
      return newUser;
    } else {
      throw new Error(res.data.message || "Registration failed");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("parkingspot_token");
    localStorage.removeItem("parkingspot_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
