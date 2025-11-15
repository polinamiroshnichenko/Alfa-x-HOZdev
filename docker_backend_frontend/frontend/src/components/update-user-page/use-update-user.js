import { useEffect, useState } from 'react';
import { useAuth } from '../context/use-auth.js';
import { useNavigate } from 'react-router-dom';

export function useUpdateUser() {
    const [error, setError] = useState('');
    const { loading, isAuthenticated, updateUser, user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ...user,
        password: ""
    });

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
            await updateUser(formData);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
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