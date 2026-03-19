import './puntaje.css';
import top1 from "../assets/1.png";
import { FaAward } from "react-icons/fa";
import { FaFireFlameCurved } from "react-icons/fa6";

const avatar = "https://i.pinimg.com/736x/d0/fe/2a/d0fe2a4e653aa45e7f3646205ad92491.jpg";

function Puntaje() {

    const usuarios = [
        { nombre: "Jane Cooper", email: "jane.cooper@example.com", racha: 24 },
        { nombre: "John Doe", email: "john@example.com", racha: 10 },
        { nombre: "Alice Smith", email: "alice@example.com", racha: 7 },
        { nombre: "Bob Brown", email: "bob@example.com", racha: 5 },
    ];

    return (
        <>
            <div className="puntaje-container">
                <h1 className="puntaje-titulo">Clasificación</h1>
                <p>Top Mejores Rachas</p>

                <div className="imagenes-container">

                    <div className="img-container img2">
                        <img src={top1} alt="Top 2" className='img-top2' />
                        <p>2</p>
                        <div className='puntaje-dias'>
                            <FaFireFlameCurved /> 10
                        </div>
                    </div>

                    <div className="img-container img1">
                        <img src={avatar} alt="Top 1" className='img-top1' />
                        <p>1</p>
                        <div className='puntaje-dias top1'>
                            <FaAward /> 24 Días
                        </div>
                    </div>

                    <div className="img-container img3">
                        <img src={top1} alt="Top 3" className='img-top3' />
                        <p>3</p>
                        <div className='puntaje-dias'>
                            <FaFireFlameCurved /> 7
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
                    {usuarios.map((user, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src={avatar}
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

                            <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2 text-red-500">
                                {user.racha}
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