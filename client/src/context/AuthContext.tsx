import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader } from "../components";
import { loginUser, logoutUser, registerUser } from "../api";
import { LocalStorage, requestHandler } from "../utils";
// Types
import { UserType } from "../@types/types";

// Create a context to manage authentication-related data and functions
const AuthContext = createContext<{
  user: UserType | null;
  token: string | null;
  login: (data: { username: string; password: string }) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Create a hook to access the AuthContext
const useAuth = () => useContext(AuthContext);

// Create a component that provides authentication-related data and functions
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const navigate = useNavigate();

  // Check for saved user and token in local storage during component initialization
  useEffect(() => {
    setIsLoading(true);
    const _token = LocalStorage.get("token");
    const _user = LocalStorage.get("user");
    if (_token && _user?._id) {
      setUser(_user);
      setToken(_token);
    }
    setIsLoading(false);
  }, []);

  // Function to handle user login
  const login = async (data: { username: string; password: string }) => {
    await requestHandler<{ user: UserType; accessToken: string }>(
      async () => await loginUser(data),
      setIsLoading,
      (res) => {
        const { data } = res;
        if (res.status && data) {
          setUser(data.user);
          setToken(data.accessToken);
          LocalStorage.set("user", data.user);
          LocalStorage.set("token", data.accessToken);
          toast.success(res.message); // Display success alerts on successful login
          navigate("/chat"); // Redirect to the chat page after successful login
        }
      },
      toast.error, // Display error alerts on request failure
    );
  };

  // Function to handle user registration
  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
  }) => {
    await requestHandler(
      async () => await registerUser(data),
      setIsLoading,
      (res) => {
        if (res.status) {
          toast.success(res.message);
        }
        navigate("/login"); // Redirect to the login page after successful registration
      },
      toast.error, // Display error alerts on request failure
    );
  };

  // Function to handle user logout
  const logout = async () => {
    await requestHandler(
      async () => await logoutUser(),
      setIsLoading,
      () => {
        setUser(null);
        setToken(null);
        LocalStorage.clear(); // Clear local storage on logout
        navigate("/login"); // Redirect to the login page after successful logout
      },
      toast.error, // Display error alerts on request failure
    );
  };

  // Provide authentication-related data and functions through the context
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {isLoading ? <Loader /> : children} {/* Display a loader while loading */}
    </AuthContext.Provider>
  );
};

// Export the context, provider component, and custom hook
export { AuthContext, AuthProvider, useAuth };
