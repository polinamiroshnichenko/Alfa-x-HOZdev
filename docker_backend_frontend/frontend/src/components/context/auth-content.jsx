import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            const userData = localStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        }
    }, []);

    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            localStorage.setItem("authToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            return data;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (userData) => {
        setLoading(true);
        try {
            const response = await fetch("/api/user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "User update failed");
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);

            return data;
        } finally {
            setLoading(false);
        }
    };

    const completeOnboarding = async (userData) => {
        setLoading(true);
        try {
            const response = await fetch("/api/user/completeOnboarding", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id: userData.id}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "User update failed");
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            
            return data;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("authToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            
            return data;
        } catch (error) {
            console.log(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    const check = async () => {
        console.log("Server check");
        try {
            const response = await fetch("/api/check", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Check failed");
            } else {
                console.log(data)
            }
            console.log("Server check complete");
        } catch (err) {
            console.error("Server check error:", err);
        }
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        check,
        updateUser,
        completeOnboarding,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export { AuthContext };
