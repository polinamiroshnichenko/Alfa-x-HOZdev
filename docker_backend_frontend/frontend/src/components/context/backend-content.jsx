import { createContext, useState, useEffect } from "react";

const BackendContext = createContext();

export function BackendProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tenders, setTenders] = useState([]);

    const businessSphereOptions = {
        none: "Тип вашего бизнеса",
        food: "Поставщик продуктов питания",
        hoz: "Служба по уборке помещений и территорий (от мусора, снега), уходу за коврами и мебелью",
        canz: "Поставщик канцелярских товаров, одноразовой посуды, бумаги",
        dev: "IT-услуги и сопровождение программного обеспечения",
        med: "Медицинский центр, услуги медицинского осмотра сотрудников",
        comp: "Поставщик компьютерной техники и расходных материалов",
        lab: "Поставщик лабораторных реактивов, медицинских расходных материалов",
        rem: "Компания по техническому обслуживанию (ТО) и ремонту",
    };
    const regionOptions = {
        none: "Регион",
        moscow: "Москва",
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            const userData = localStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
            const tendersData = localStorage.getItem("tenders");
            if (tendersData) {
                setTenders(JSON.parse(tendersData));
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
                body: JSON.stringify({ ...userData, id: user.id }),
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
                body: JSON.stringify({ id: userData.id }),
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
        localStorage.removeItem("user");
        setUser(null);
        setTenders([]);
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
                console.log(data);
            }
            console.log("Server check complete");
        } catch (err) {
            console.error("Server check error:", err);
        }
    };

    const fetchTenders = async () => {
        try {
            setLoading(true);
            const request = {
                user_id: user.id,
                business_field: businessSphereOptions[user.business_sphere],
                business_description: user.desc,
                city: regionOptions[user.region]

            }
            const response = await fetch("/llm/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });
            const data = await response.json();
            if (!response.ok) throw new Error('Failed to fetch');
            
            console.log(data)

            const newTenders = data.map((tender) => {return {
                id: tender.registry_number,
                post_date: tender.application_start_date,
                until_date: tender.application_end_date,
                title: tender.short_name,
                region: tender.region,
                price: tender.starting_price
            }})
            setTenders(data);
            
            localStorage.setItem("tenders", JSON.stringify(newTenders));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (tenderId, messageText) => {
        try {
            setLoading(true);
            const request = {
                user_id: user.id,
                registry_number: tenderId,
                user_query: messageText
            }
            const response = await fetch("/llm/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            console.log(data)
            setTenders(data);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return {
                model_text: tenderId + messageText,
            };
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        tenders,
        businessSphereOptions,
        regionOptions,
        register,
        login,
        logout,
        check,
        updateUser,
        fetchTenders,
        sendMessage,
        completeOnboarding,
        isAuthenticated: !!user,
    };

    return (
        <BackendContext.Provider value={value}>
            {children}
        </BackendContext.Provider>
    );
}

export { BackendContext };
