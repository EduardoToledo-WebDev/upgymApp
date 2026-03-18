import { CircleUser, Settings } from "lucide-react";

const Header = ({ userData }) => {
    return (
        <div className="w-full px-6 py-4 flex items-center justify-between box-border mt-2 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">

                <div className="w-[50px] h-[50px] bg-gray-200 rounded-full border-2 border-sky-600 flex justify-center items-center overflow-hidden shadow-sm">
                    <CircleUser size={35} className="text-gray-500" />
                </div>
                <p className="font-bold text-lg text-gray-800">{userData?.nombre || "pausipop5"}</p>
            </div>

            <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-[40px] h-[40px] bg-orange-50 text-orange-500 rounded-full">
                    <Settings size={20} />
                </div>
            </div>
        </div>
    );
};

export { Header };