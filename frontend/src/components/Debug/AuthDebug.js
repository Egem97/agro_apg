import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebug = () => {
    const { user } = useAuth();
    const [authStatus, setAuthStatus] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const savedUser = localStorage.getItem('user');

        setAuthStatus({
            token: token ? 'Presente' : 'Ausente',
            refreshToken: refreshToken ? 'Presente' : 'Ausente',
            savedUser: savedUser ? 'Presente' : 'Ausente',
            tokenPreview: token ? token.substring(0, 50) + '...' : 'N/A',
            userFromContext: user ? 'Presente' : 'Ausente'
        });
    }, [user]);

    const testAPI = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/quality-data/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                alert(`API exitosa: ${data.count} registros`);
            } else {
                alert(`Error API: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            alert(`Error de conexión: ${error.message}`);
        }
    };

    return (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Debug de Autenticación</h3>
            <div className="text-sm">
                <p><strong>Token:</strong> {authStatus.token}</p>
                <p><strong>Refresh Token:</strong> {authStatus.refreshToken}</p>
                <p><strong>Usuario guardado:</strong> {authStatus.savedUser}</p>
                <p><strong>Usuario en contexto:</strong> {authStatus.userFromContext}</p>
                <p><strong>Token preview:</strong> {authStatus.tokenPreview}</p>
                {user && (
                    <p><strong>Usuario actual:</strong> {user.full_name} ({user.email})</p>
                )}
            </div>
            <button 
                onClick={testAPI}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
                Probar API
            </button>
        </div>
    );
};

export default AuthDebug;
