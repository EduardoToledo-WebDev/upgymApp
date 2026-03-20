import React, { useState } from 'react';
import './Login.css';
import { Preferences } from '@capacitor/preferences';
import { Register } from '../Register';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import logo from '../../assets/LogoUpgym.png';
const gradient = "background: linear-gradient(97deg,rgba(0, 102, 255, 0) 0%, rgba(49, 146, 166, 0.79) 55%);"

function Login({ onLoginSuccess }) {
    const API_URL = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [ventanaRegister, setVentanaRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

    return (
        <>
            <div className="w-full h-screen flex justify-center items-center font-sans bg-gray-100">
                <form
                    className="bg-white p-10 rounded-xl w-full max-w-md flex flex-col shadow-lg"
                    onSubmit={handleLogin}
                >
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-6">
                        <img src={logo} alt="Logo UPGYM" className="w-32 h-32 object-contain" />
                    </div>

                    {/* Título */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        <h2 className="text-[#0066FF] font-bold text-2xl tracking-widest">
                            BIENVENIDO
                        </h2>
                        <p className="text-[#64748B]">
                            Ingresa a tu cuenta de UPGYM
                        </p>
                    </div>

                    {/* Error */}
                    {errorMessage && (
                        <p className="text-red-500 text-sm mb-4 text-center">
                            {errorMessage}
                        </p>
                    )}

                    {/* Email */}
                    <label className="text-[#334155] font-bold mb-2">
                        Correo Electrónico
                    </label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="text"
                        className="p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ejemplo@correo.com"
                        required
                    />

                    {/* Password */}
                    <label className="text-[#334155] mt-5 font-bold mb-2">
                        Contraseña
                    </label>

                    <div className="relative">
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type={showPassword ? "text" : "password"}
                            className="w-full p-4 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingresa tu contraseña"
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                        >
                            {showPassword ? (
                                <FaRegEyeSlash className="size-6 text-[#334155]" />
                            ) : (
                                <FaRegEye className="size-6 text-[#334155]" />
                            )}
                        </button>
                    </div>

                    {/* Botón */}
                    <button
                        type="submit"
                        className="text-lg p-4 rounded-lg cursor-pointer mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:opacity-90 transition"
                    >
                        Iniciar Sesión
                    </button>

                    {/* Registro */}
                    <p className="text-center mt-4">
                        ¿No tienes cuenta?{" "}
                        <button
                            type="button"
                            className="text-[#0066FF] font-bold cursor-pointer"
                            onClick={() => setVentanaRegister(true)}
                        >
                            Regístrate
                        </button>
                    </p>
                </form>
            </div>

            <Register
                ventanaRegister={ventanaRegister}
                setVentanaRegister={setVentanaRegister}
            />
        </>
    );
}

export { Login };