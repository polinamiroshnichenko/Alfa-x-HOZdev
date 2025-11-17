import { useEffect, useState } from 'react';
import { useBackend } from '../context/use-backend.js';
import { useNavigate } from 'react-router-dom';
 
export function useLogin() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login, loading, isAuthenticated } = useBackend();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(formData);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate])

    return {
        error,
        loading,
        formData,
        handleChange,
        handleSubmit
    }
}