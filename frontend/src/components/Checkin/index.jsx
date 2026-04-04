import { IoExitOutline } from "react-icons/io5";
import { useState } from "react";
import { BotonEntreno } from "../ui/Inicio/BotonEntreno";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import { Geolocation } from '@capacitor/geolocation';
import { useEffect } from "react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
function Checkin() {
    const { userData, setUserData } = useContext(AppContext);
    const { rachaUsuario, setRachaUsuario } = useContext(AppContext);
    const { mostrarCheckin, setMostrarCheckin } = useContext(AppContext);
    const { validacionUbicacion, setValidacionUbicacion } = useContext(AppContext);
    const { qrData, setQrData } = useContext(AppContext);
    const { gimnasio, setGimnasio } = useContext(AppContext);
    const { segundos, setSegundos } = useContext(AppContext);
    const { checkinValido, setCheckinValido } = useContext(AppContext);
    const API_URL = import.meta.env.VITE_API_URL;
    const RADIO_MAXIMO = 50; // metros

    useEffect(() => {
        const interval = setInterval(() => {
            setSegundos(prev => prev + 1);
            //validar que el tiempo sea mayor a 40 minutos y que no se hayas salido del rango de ubicacion
            if (segundos > 2400 && validacionUbicacion === true) {
                setCheckinValido(true);
                insertarCheckin();
            } else {
                setCheckinValido(false);
            }
        }, 1000);


        return () => clearInterval(interval);
    }, []);

    const insertarCheckin = async () => {
        const { value: tokenGuardado } = await Preferences.get({ key: 'token' });

        const response = await fetch(`http://${API_URL}/checkin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenGuardado}`
            },
            body: JSON.stringify({
                id_usuario: userData.id_usuario,
                ult_activo: new Date().toLocaleDateString("es-MX"),
                racha_act: rachaUsuario.racha_act + 1,
                activo: 1,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
        }

    };

    const calcularDistancia = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metros

        const toRad = (deg) => deg * Math.PI / 180;

        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lon2 - lon1);

        const a =
            Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const obtenerGimnasio = async (id) => {
        const response = await fetch(`http://${API_URL}/gimnasio/` + id);

        if (response.ok) {
            const data = await response.json();
            setGimnasio(data.gimnasio);
        }
    };
    useEffect(() => {
        if (!gimnasio) return;

        const obtenerUbicacion = async () => {
            try {
                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true
                });

                console.log("Latitud:", position.coords.latitude);
                console.log("Longitud:", position.coords.longitude);
                console.log("Gym:", gimnasio);
                if (gimnasio.latitud && gimnasio.longitud) {
                    const distancia = calcularDistancia(
                        gimnasio.latitud,
                        gimnasio.longitud,
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    if (distancia <= RADIO_MAXIMO) {
                        console.log("Dentro del radio");
                        setValidacionUbicacion(true);
                    } else {
                        console.log("Fuera del radio");
                        setValidacionUbicacion(false);
                    }
                }

            } catch (error) {
                console.error("Error:", error);
            }
        };

        obtenerUbicacion();

        const interval = setInterval(obtenerUbicacion, 6000);

        return () => clearInterval(interval);

    }, [gimnasio]);


    const QrScanner = async () => {
        setMostrarCheckin(false);

        await BarcodeScanner.requestPermissions();


        const result = await BarcodeScanner.scan();


        if (result.barcodes.length > 0) {

            try {
                const data = JSON.parse(result.barcodes[0].rawValue);
                if (!data.id_gimnasio) {
                    throw new Error("QR inválido");
                }

                setQrData(data);
                obtenerGimnasio(data.id_gimnasio);

            } catch (error) {
                console.error("Error al escanear el QR", error);
            }
        }

    };


    return (
        <>
            {mostrarCheckin && (
                <div className="w-full flex items-center justify-center mt-10 mb-50 ">
                    <div onClick={QrScanner} className="w-[250px] h-[250px] bg-[#E6E6E6] rounded-xl flex flex-col items-center justify-center cursor-pointer">
                        <div className="mb-5 bg-blue-500 w-[80px] h-[80px] rounded-xl flex items-center justify-center"><IoExitOutline size={45} color="white" /></div>
                        <p className="text-lg font-bold">Check-In</p>
                        <p className="text-sm ">Escanear QR</p>
                    </div>
                    <button onClick={() => { setMostrarCheckin(false); setQrData({ id_gimnasio: 1 }); obtenerGimnasio(1) }} className="bg-blue-500 text-white px-4 py-2 rounded-xl cursor-pointer">Escaner de prueba</button>

                </div>

            )}
            {!mostrarCheckin && (
                <>

                    {gimnasio ? (
                        <>
                            <BotonEntreno validacionUbicacion={validacionUbicacion} setMostrarCheckin={setMostrarCheckin} setQrData={setQrData} setGimnasio={setGimnasio} setValidacionUbicacion={setValidacionUbicacion}></BotonEntreno>
                        </>
                    ) : (
                        <p className="text-center text-md mt-2">Error al escanear el QR</p>
                    )}
                </>
            )}


        </>
    );
}

export { Checkin };