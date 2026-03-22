import React from "react";
import { useState } from "react";
import logo from '../../assets/LogoUpgym.png';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useDbRegister } from "./dbRegister.jsx";

function Register({ ventanaRegister, setVentanaRegister, onLoginSuccess }) {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // CORRECCIÓN 1: Inicializamos el hook limpio, sin pasarle variables
    const { register, errorMessage } = useDbRegister();

    return (
        <>
            <div className={ventanaRegister ? "w-full h-screen flex justify-center items-center font-sans bg-gray-100" : "hidden"}>
                <form
                    className="bg-white p-10 rounded-xl w-full max-w-md flex flex-col shadow-lg"
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
                            Registrate en UPGYM
                        </p>
                    </div>

                    {/* Error */}
                    {errorMessage && (
                        <p className="text-red-500 text-sm mb-4 text-center">
                            {errorMessage}
                        </p>
                    )}

                    {/* Nombre */}
                    <label className="text-[#334155] font-bold mb-2">
                        Nombre Completo
                    </label>
                    <input
                        onChange={(e) => setNombre(e.target.value)}
                        value={nombre}
                        type="text"
                        className="mb-4 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre"
                        required
                    />
                    {/* Email */}
                    <label className="text-[#334155] font-bold mb-2">
                        Correo Electrónico
                    </label>
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type="email"
                        className="mb-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="mb-4 w-full p-4 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                        <input
                            onChange={(e) => setPassword2(e.target.value)}
                            value={password2}
                            type={showPassword ? "text" : "password"}
                            className="w-full p-4 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirma tu contraseña"
                            required
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-8 transform -translate-y-1/2 cursor-pointer"
                        >
                            {showPassword ? (
                                <FaRegEyeSlash className="size-6 text-[#334155]" />
                            ) : (
                                <FaRegEye className="size-6 text-[#334155]" />
                            )}
                        </button>
                    </div>

                    {/* Botón */}
                    {password === password2 && password !== '' ? (
                        <button
                            type="button"
                            className="text-lg p-4 rounded-lg cursor-pointer mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:opacity-90 transition"
                            onClick={async (e) => {
                                e.preventDefault();
                                // CORRECCIÓN 2: async/await implementado correctamente
                                const success = await register(nombre, email, password);
                                if (success) {
                                    setVentanaRegister(false);
                                    onLoginSuccess();
                                }
                            }}
                        >
                            Registrarse
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="text-lg p-4 rounded-lg cursor-pointer mt-6 bg-gradient-to-r from-gray-400 to-gray-400 text-white font-bold hover:opacity-90 transition"
                            disabled
                        >
                            Registrarse
                        </button>
                    )}

                    {/* Registro */}
                    <p className="text-center mt-4">
                        ¿Ya tienes cuenta?{" "}
                        <button
                            type="button"
                            className="text-[#0066FF] font-bold cursor-pointer"
                            onClick={() => setVentanaRegister(false)}
                        >
                            Iniciar Sesión
                        </button>
                    </p>
                </form>
            </div>
        </>
    )
}

export { Register };