import { FaPlay } from "react-icons/fa";


function BotonEntreno() {
    return (
        <>
            <div className="w-full flex items-center justify-center mt-10 mb-50 hover:scale-102 transition-all duration-300 ">
                <div className="w-[500px] h-[250px] bg-gradient-to-br from-[#0066FF] via-[#745F8B] to-[#EC5813] rounded-xl flex flex-row items-center justify-center cursor-pointer gap-20">
                    <div className="flex flex-col items-center text-white gap-2">
                        <p className="text-3xl font-bold">Pierna Completa</p>
                        <p className="text-lg ">12 Ejercicios</p>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2  w-[150px] h-[150px] rounded-xl ">
                        <FaPlay color="#ffffff" size={80} />
                    </div>

                </div>
            </div>
        </>
    );
}

export { BotonEntreno };