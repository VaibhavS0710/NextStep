import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

export type UserRole = "student" | "company" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "student" | "company"
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem("ns_user");
    const storedToken = localStorage.getItem("ns_accessToken");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
    setLoading(false);
  }, []);

  const saveAuth = (user: AuthUser, token: string) => {
    setUser(user);
    setAccessToken(token);
    localStorage.setItem("ns_user", JSON.stringify(user));
    localStorage.setItem("ns_accessToken", token);
  };

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, accessToken } = res.data;
    saveAuth(user, accessToken);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "student" | "company"
  ) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    const { user, accessToken } = res.data;
    saveAuth(user, accessToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("ns_user");
    localStorage.removeItem("ns_accessToken");
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
