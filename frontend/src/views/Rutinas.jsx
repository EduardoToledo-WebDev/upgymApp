import { useOutletContext } from "react-router-dom";
import { Plus, FolderOpen, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { NuevaRutina } from "./NuevaRutina";

export default function Entrenar() {
    const [rutinaView, setRutinaView] = useState(false);
    const styles = {
        title: "ml-5 font-bold text-3xl",
        topButtons: "mx-5 justify-center gap-2 flex mt-5 font-bold border-gray-400 border-1.5  h-12 border rounded-md items-center "
    }
    const { userData } = useOutletContext();
    console.log(userData);
    return (
        <div className="pantalla-contenido">
            <h1 className={styles.title}>Rutinas</h1>
            <div onClick={() => setRutinaView(true)} className={styles.topButtons}><Plus />Crear rutina nueva </div>
            <div className={styles.topButtons}><FolderOpen />Importar Rutina</div>
            <h2 className="ml-5 mt-5 font-bold text-md text-gray-500">Mis Rutinas (0)</h2>

            <NuevaRutina rutinaView={rutinaView} setRutinaView={setRutinaView} />


        </div>
    );
}