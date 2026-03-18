import { Flame } from "lucide-react";

const RachaCard = ({ racha, estado }) => {
    return (
        <div className="px-6 mt-4">

            <div className="bg-gradient-to-br from-[#0066FF] via-[#745F8B] to-[#EC5813] rounded-[30px] p-8 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">


                <div className="flex justify-center mb-4">
                    <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm">
                        <Flame size={28} color="white" strokeWidth={2.5} />
                    </div>
                </div>


                <div className="text-center">
                    <p className="text-xs font-bold tracking-[0.2em] opacity-80 mb-1">RACHA ACTUAL</p>
                    <h1 className="text-6xl font-extrabold mb-3 mt-3 tracking-tight">{racha} DÍAS</h1>
                    <p className="text-sm opacity-90 mb-8 font-medium">
                        {racha === 0 ? "No tienes racha, ¡Empieza hoy!" : `Tu racha está ${estado}, ¡No la rompas!`}
                    </p>
                </div>




            </div>
        </div>
    );
};

export { RachaCard };