import { useEffect, useState } from "react";
import { useBackend } from "../context/use-backend.js";
import { useNavigate } from "react-router-dom";

export function useUpdateUser() {
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSecondPhase, setIsSecondPhase] = useState(false);
    const {
        updateUser,
        loading,
        user,
        businessSphereOptions,
        regionOptions,
        isAuthenticated,
        logout,
    } = useBackend();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        check_password: "",
        business_sphere: "none",
        region: "none",
        desc: "",
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
        setFormData({
            ...formData,
            name: user?.name,
            email: user?.email,
            business_sphere: user?.business_sphere,
            region: user?.region,
            desc: user?.desc,
        });
    }, [isAuthenticated, navigate, user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password != formData.check_password) {
            return setError("Пароли не совпадают");
        }
        setError("");
        setMessage("");
        try {
            const response = await updateUser(formData);
            setMessage(response.message);
        } catch (err) {
            setError(err.message);
        }
    };

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

    // const setPhaseNicely = (isSecond) => {
    //     if (isSecond) {
    //         const { password, check_password, email } = formData;
    //         if (!password || !check_password || !email) {
    //             return setError("Не все данные заполнены");
    //         }
    //         if (password !== check_password) {
    //             return setError("Пароли не совпадают");
    //         }
    //         if (password.length < 8) {
    //             return setError(
    //                 "Пароль должен иметь длину не менее 8 символов"
    //             );
    //         }
    //         if (!email.includes("@")) {
    //             return setError("Неверный формат почтового адреса");
    //         }
    //     }
    //     setError("");
    //     setIsSecondPhase(isSecond);
    // };

    return {
        error,
        message,
        loading,
        formData,
        isSecondPhase,
        businessSphereOptions,
        regionOptions,
        handleChange,
        handleSubmit,
        handleLogout,
        navigate
    };

    // const [error, setError] = useState('');
    // const { loading, isAuthenticated, updateUser, user } = useBackend();
    // const navigate = useNavigate();
    // const [formData, setFormData] = useState({
    //     ...user,
    //     password: ""
    // });

    // const handleChange = (e) => {
    //     setFormData({
    //         ...formData,
    //         [e.target.name]: e.target.value
    //     });
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setError('');

    //     try {
    //         await updateUser(formData);
    //     } catch (err) {
    //         setError(err.message);
    //     }
    // };

    // const handleLogout = async (e) => {
    //     e.preventDefault();
    //     setError('');

    //     try {
    //         await logout();
    //         navigate('/login');
    //     } catch (err) {
    //         setError(err.message);
    //     }
    // };

    // useEffect(() => {
    //     if (!isAuthenticated) {
    //         navigate('/login');
    //     }
    // }, [isAuthenticated, navigate])

    // return {
    //     error,
    //     loading,
    //     formData,
    //     handleChange,
    //     handleSubmit,
    //     handleLogout
    // }
}
