import { IoExitOutline } from "react-icons/io5";
import { useState } from "react";
import { BotonEntreno } from "../ui/Inicio/BotonEntreno";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import { Geolocation } from '@capacitor/geolocation';
import { useEffect } from "react";
function Checkin() {
    const [mostrarCheckin, setMostrarCheckin] = useState(true);
    const [gimnasio, setGimnasio] = useState();
    const [qrData, setQrData] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;
    const [ubicacion, setUbicacion] = useState(null);
    const [validacionUbicacion, setValidacionUbicacion] = useState(null);
    const [segundos, setSegundos] = useState(0);
    const [checkinValido, setCheckinValido] = useState(false);
    const RADIO_MAXIMO = 50; // metros

    useEffect(() => {
        const interval = setInterval(() => {
            setSegundos(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

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

    const validarCheckin = () => {
        if (segundos < 2400) {
            setCheckinValido(false);
        };

        if (validacionUbicacion === false) {
            setCheckinValido(false);
        }
    }

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