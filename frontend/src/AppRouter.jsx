import { HashRouter, Routes, Route } from 'react-router-dom';

// AQUÍ usamos la estructura de carpetas para importar los archivos
import Layout from './layouts/Layout';
import Inicio from './views/Inicio';
import Rutinas from './views/Rutinas';
import Puntaje from './views/Puntaje';
import Recompensas from './views/Recompensas';

export default function AppRouter({ userData }) {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout userData={userData} />}>
                    <Route index element={<Inicio />} />
                    <Route path="rutinas" element={<Rutinas />} />
                    <Route path="puntaje" element={<Puntaje />} />
                    <Route path="Recompensas" element={<Recompensas />} />

                </Route>
            </Routes>
        </HashRouter>
    );
}