import { useEffect, useState } from "react";
import { useAuth } from "../context/use-auth.js";
import { useNavigate } from 'react-router-dom';

export function HomePage() {
    const { isAuthenticated, user, logout, completeOnboarding } = useAuth();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogout = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await logout();
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="">
            <div className="">
                Hello{isAuthenticated && " " + user.name}! {(user.watchedOnboarding === "true") || "you go watch onboarding"}
            </div>
            {error && (
                <div className="">
                    {error}
                </div>
            )}
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => navigate("/update-user")}>Fill info</button>
            <button onClick={() => completeOnboarding(user)}>Watch onboarding</button> 
        </div>
    )
}
