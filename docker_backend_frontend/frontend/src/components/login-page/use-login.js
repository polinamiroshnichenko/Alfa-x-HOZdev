import { useEffect, useState } from 'react';
import { useAuth } from '../context/use-auth.js';
import { useNavigate } from 'react-router-dom';
 
export function useLogin() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { login, loading, check, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCheck = async () => {
        try {
            await check();
        } catch (err) {
            console.error(err)
        }
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
        handleCheck,
        handleSubmit
    }
}