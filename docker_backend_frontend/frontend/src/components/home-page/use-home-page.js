import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackend } from "../context/use-backend";

export function useHomePage() {
    const {
        isAuthenticated,
        completeOnboarding,
        user,
        tenders,
        fetchTenders,
        loading,
    } = useBackend();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect( () => {
        async function fetchData() {
            try {
                await fetchTenders();
            } catch (err) {
                console.error(err)
                setError(err.message);
            }
        }
        if (!isAuthenticated) {
            navigate("/login");
        } else if (tenders.length == 0) {
            fetchData();
        }
    }, [isAuthenticated, navigate]);

    return {
        user,
        completeOnboarding,
        tenders,
        error,
        loading,
        navigate,
    };
}
