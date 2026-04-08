import { IoExitOutline } from "react-icons/io5";
import { useEffect, useContext, useRef, useState } from "react";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import { AppContext } from "../../context/AppContext";
import { Preferences } from '@capacitor/preferences';

function Checkin() {
    const {
        userData, setMostrarCheckin, mostrarCheckin, setGimnasio, gimnasio,
        setSesionActiva, setIdCheckinActual, setSegundos,
        setRutinaEmpezada, validacionUbicacion
    } = useContext(AppContext);

    const [timerInterno, setTimerInterno] = useState(0);
    const API_URL = import.meta.env.VITE_API_URL;
    const checkinRealizado = useRef(false);

    // 🔴 TIMER DE VALIDACIÓN (3 segundos)
    useEffect(() => {
        if (!gimnasio) return;
        const interval = setInterval(() => setTimerInterno(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [gimnasio]);

    // 🔴 DISPARADOR AUTOMÁTICO
    useEffect(() => {
        if (timerInterno >= 3 && validacionUbicacion === true && !checkinRealizado.current) {
            checkinRealizado.current = true;
            insertarCheckin();
        }
    }, [timerInterno, validacionUbicacion]);

    const insertarCheckin = async () => {
        const { value: token } = await Preferences.get({ key: 'token' });
        try {
            const resp = await fetch(`http://${API_URL}/checkin/iniciar`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ id_usuario: userData.id_usuario, id_gimnasio: gimnasio.id_gimnasio }),
            });

            if (resp.ok) {
                const data = await resp.json();
                const start = Date.now();
                await Preferences.set({
                    key: 'active_session',
                    value: JSON.stringify({ id_checkin: data.id_checkin, inicio: start, gimnasio: gimnasio })
                });
                setSesionActiva(true);
                setIdCheckinActual(data.id_checkin);
                setSegundos(0);
                setRutinaEmpezada(true);
            }
        } catch (e) {
            console.error(e);
            checkinRealizado.current = false;
        }
    };

    const QrScanner = async () => {
        try {
            const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
            if (!available) await BarcodeScanner.installGoogleBarcodeScannerModule();
            await BarcodeScanner.requestPermissions();
            const result = await BarcodeScanner.scan();
            if (result.barcodes.length > 0) {
                const data = JSON.parse(result.barcodes[0].rawValue);
                const resp = await fetch(`http://${API_URL}/gimnasio/${data.id_gimnasio}`);
                const gData = await resp.json();
                setGimnasio(gData.gimnasio);
                setMostrarCheckin(false);
                setTimerInterno(0);
            }
        } catch (e) { setMostrarCheckin(true); }
    };

    return (
        <div className="w-full flex flex-col items-center px-5">
            {mostrarCheckin ? (
                <div onClick={QrScanner} className="w-full max-w-sm bg-white rounded-3xl p-6 flex items-center gap-5 shadow-sm cursor-pointer border border-gray-100">
                    <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"><IoExitOutline size={32} color="white" /></div>
                    <div><p className="text-xl font-bold text-slate-800">Check-In</p><p className="text-sm text-slate-400">Escanea el QR para entrenar</p></div>
                </div>
            ) : (
                <div className="w-full max-w-sm bg-white rounded-3xl p-8 flex flex-col items-center shadow-sm border border-gray-50">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-bold text-slate-800">Validando ubicación...</p>
                    <p className="text-sm text-slate-400 mt-1">Espera un momento</p>
                    <div className="mt-4 px-4 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-sm">
                        {timerInterno}s / 3s
                    </div>
                </div>
            )}
        </div>
    );
}
export { Checkin };