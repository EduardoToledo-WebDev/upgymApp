import { useOutletContext } from "react-router-dom";

export default function Entrenar() {
    const { userData } = useOutletContext();
    console.log(userData);
    return (
        <div className="pantalla-contenido">
            <h1>Entrenar </h1>
            {/* Aquí irá la lista de Retos Semanales y Mensuales */}
        </div>
    );
}