import axiosInstance from "@/api/axiosInstance";
import { createContext, useContext, useState, useEffect } from "react";

type User = { 
  id: string; 
  email: string; 
  role: string; 
  name: string;
  leadMentorId?: string;
  permissions?: string[];
  profilePicture?: string | null;
  isSystemAdmin?: boolean;
} | null;

interface AuthContextType {
  user: User;
  login: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // If user is stored but missing isSystemAdmin, fetch it from backend
      if (stored) {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        
        // If isSystemAdmin is missing, fetch current user from backend
        if (parsedUser && parsedUser.isSystemAdmin === undefined) {
          axiosInstance.get("/auth/me")
            .then((response) => {
              const updatedUser = response.data.user;
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            })
            .catch((error) => {
              console.error("Error fetching user info:", error);
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (user: User, token: string) => {
    console.log("AuthContext login called with:", { user, token });
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("User and token stored in localStorage");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
