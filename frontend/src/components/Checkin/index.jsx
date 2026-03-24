import { IoExitOutline } from "react-icons/io5";
import { useState } from "react";
import { BotonEntreno } from "../ui/Inicio/BotonEntreno";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
function Checkin() {
    const [mostrarCheckin, setMostrarCheckin] = useState(true);
    const [gimnasio, setGimnasio] = useState("");
    const [qrData, setQrData] = useState("");
    const API_URL = import.meta.env.VITE_API_URL;


    const obtenerGimnasio = async (id) => {
        const response = await fetch(`http://${API_URL}/checkin/` + id);

        if (response.ok) {
            const data = await response.json();
            setGimnasio(data.gimnasio);
        }
    };

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
                            <BotonEntreno></BotonEntreno>
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