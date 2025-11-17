import { useEffect, useState } from "react";
import { useBackend } from "../context/use-backend.js";
import { useNavigate } from "react-router-dom";

export function useChat(tenderId) {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");
    const { loading, isAuthenticated, sendMessage, tenders } = useBackend();
    const navigate = useNavigate();

    const tender = tenders.find(tender => tender.id === tenderId)

    const handleChange = (e) => {
        setMessageText(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const oldMessageText = messageText;
            setMessageText("");
            setMessages((oldMessages) => [...oldMessages, oldMessageText])
            const response = await sendMessage(tenderId, oldMessageText);
            setMessages((oldMessages) => [...oldMessages, response])
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    return {
        error,
        tender,
        loading,
        messages,
        messageText,
        navigate,
        handleChange,
        handleSubmit,
    };
}
