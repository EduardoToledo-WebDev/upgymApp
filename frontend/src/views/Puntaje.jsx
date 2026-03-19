import './puntaje.css';
import top1 from "../assets/1.png";
import { FaAward } from "react-icons/fa";
import { FaFireFlameCurved } from "react-icons/fa6";
import { useEffect } from 'react';
import { useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { imagenes } from '../components/Imagenes/index.jsx'

const avatar = "https://i.pinimg.com/736x/d0/fe/2a/d0fe2a4e653aa45e7f3646205ad92491.jpg";

function Puntaje() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const imagenesUsuarios = imagenes(userData.length);

    const ObtenerTop = async () => {
        const { value: tokenGuardado } = await Preferences.get({ key: 'token' });

        fetch(`http://${API_URL}/clasificacion`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenGuardado}`
            }
        })
            .then(async response => {
                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserData(data.user); // Guardamos el { email: '...' } que viene del backend
                    console.log(data.user);
                } else {
                    setIsAuthenticated(false);
                    setUserData(null);
                }
            })
            .catch(error => {
                console.error("Error validando sesión:", error);
                setIsAuthenticated(false);
            })
            .finally(() => {
                setIsLoading(false);
            });

    };

    useEffect(() => {
        ObtenerTop();
    }, []);


    return (
        <>
            <div className="puntaje-container">
                <h1 className="puntaje-titulo">Clasificación</h1>
                <p>Top Mejores Rachas</p>

                <div className="imagenes-container">

                    <div className="img-container img2">
                        <img src={imagenesUsuarios[1]} alt="Top 2" className='img-top2' />
                        <p>2</p>
                        <div className='puntaje-dias'>
                            <FaFireFlameCurved /> {userData[1]?.racha_act}
                        </div>
                    </div>

                    <div className="img-container img1">
                        <img src={imagenesUsuarios[0]} alt="Top 1" className='img-top1' />
                        <p>1</p>
                        <div className='puntaje-dias top1'>
                            <FaAward /> {userData[0]?.racha_act}
                        </div>
                    </div>

                    <div className="img-container img3">
                        <img src={imagenesUsuarios[2]} alt="Top 3" className='img-top3' />
                        <p>3</p>
                        <div className='puntaje-dias'>
                            <FaFireFlameCurved /> {userData[2]?.racha_act}
                        </div>
                    </div>

                </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Racha</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {userData.map((user, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={imagenesUsuarios[index]}
                                        alt="avatar"
                                    />
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.nombre}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td className={`px-6 py-4 text-sm text-gray-500 flex items-center gap-2 text-red-500
                            ${user.activo === 1 ? 'activo' : 'inactivo'}`}>
                                {user.racha_act}
                                <FaFireFlameCurved />
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default Puntaje;