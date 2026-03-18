import React, { useState } from 'react';
import './Login.css';
import { Preferences } from '@capacitor/preferences';

// 1. Recibimos la prop 'onLoginSuccess'
function Login({ onLoginSuccess }) {
    const API_URL = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage('');

        const data = {
            email: email,
            password: password
        };

        fetch(`http://${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        })
            .then(async response => {
                const result = await response.json();

                if (response.ok) {
                    // 1. Guardamos el token en el teléfono
                    await Preferences.set({
                        key: 'token',
                        value: result.token,
                    });
                    // 2. Le avisamos a Main.jsx que ya puede entrar
                    onLoginSuccess();
                } else {
                    setErrorMessage(result.message || "Error al iniciar sesión");
                }
            })
            .catch(error => {
                console.error(error);
                setErrorMessage(`Error de conexión con el servidor ${error.message || error.toString()} ${API_URL}`);
            });
    }

    // 3. El return ahora es mucho más limpio, solo devuelve el formulario
    return (
        <div className="login-wrapper">
            <form className="login-form" onSubmit={handleLogin}>
                <h2>Login</h2>

                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                <label htmlFor="email">Email</label>
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="text"
                    id="email"
                    required
                />

                <label htmlFor="password">Contraseña</label>
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    id="password"
                    required
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export { Login };