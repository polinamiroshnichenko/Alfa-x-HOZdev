import { useContext } from 'react';
import { BackendContext } from './backend-content';

export function useBackend() {
    const context = useContext(BackendContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}