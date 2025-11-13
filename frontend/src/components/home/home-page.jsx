import { useEffect, useState } from "react";
import { useAuth } from "../context/use-auth.js";
import { useNavigate } from 'react-router-dom';

export function Home() {
    const { isAuthenticated, user, logout } = useAuth();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

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

    return (
        <div className="">
            <div className="">
                Hello{isAuthenticated && " " + user.name}!
            </div>
            {error && (
                <div className="">
                    {error}
                </div>
            )}
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}
