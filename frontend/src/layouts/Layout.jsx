import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Trophy } from 'lucide-react';
import './layout.css';

export default function Layout({ userData }) {
    const location = useLocation();

    return (
        <div className="app-container">
            <div className="main-content">
                <Outlet context={{ userData }} />
            </div>

            <nav className="bottom-nav">
                {/* Ojo: 'to' es la URL en el navegador, no la ruta de tu archivo */}
                <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                    <Home size={24} />
                    <span>INICIO</span>
                </Link>

                <Link to="/rutinas" className={`nav-item ${location.pathname === '/rutinas' ? 'active' : ''}`}>
                    <Dumbbell size={24} />
                    <span>RUTINAS</span>
                </Link>

                <Link to="/puntaje" className={`nav-item ${location.pathname === '/puntaje' ? 'active' : ''}`}>
                    <Trophy size={24} />
                    <span>PUNTAJE</span>
                </Link>
            </nav>
        </div>
    );
}