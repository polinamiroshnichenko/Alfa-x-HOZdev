import { useEffect, useState } from 'react';
import { useAuth } from '../context/use-auth.js';
import { useNavigate } from 'react-router-dom';

export function useRegister() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const { register, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate])

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
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return {
        error,
        loading,
        formData,
        handleChange,
        handleSubmit
    }
}