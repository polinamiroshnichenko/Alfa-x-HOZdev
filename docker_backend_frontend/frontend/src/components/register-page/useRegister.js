import { useEffect, useState } from "react";
import { useAuth } from "../context/use-auth.js";
import { useNavigate } from "react-router-dom";

export function useRegister() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        check_password: "",
        business_sphere: "none",
        region: "none",
        desc: "",
    });
    const [error, setError] = useState("");
    const [isSecondPhase, setIsSecondPhase] = useState(false);
    const { register, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const { business_sphere, region, desc } = formData;
        try {
            await register(formData);
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    };

    const setPhaseNicely = (isSecond) => {
        if (isSecond) {
            const { password, check_password, email } = formData;
            if (!password || !check_password || !email) {
                return setError("Не все данные заполнены");
            }
            if (password !== check_password) {
                return setError("Пароли не совпадают");
            }
            if (password.length < 8) {
                return setError(
                    "Пароль должен иметь длину не менее 8 символов"
                );
            }
            if (!email.includes("@")) {
                return setError("Неверный формат почтового адреса");
            }
        }
        setError("");
        setIsSecondPhase(isSecond);
    };

    return {
        error,
        loading,
        formData,
        isSecondPhase,
        setIsSecondPhase: setPhaseNicely,
        handleChange,
        handleSubmit,
    };
}
