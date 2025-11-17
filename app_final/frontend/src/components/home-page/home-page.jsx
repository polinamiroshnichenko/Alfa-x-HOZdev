import SettingsIcon from "../img/settings.jsx";
import { useHomePage } from "./use-home-page.js";
import { TenderCard } from "./tender-card.jsx";

import onboardBg from "../img/onboarding-popup-bg.png";

export function HomePage() {
    const { user, completeOnboarding, tenders, error, loading, navigate } =
        useHomePage();

    if (!user) {
        return (
            <p className="mt-30 text-2xl text-center font-semibold">
                Загрузка...
            </p>
        );
    }

    return (
        <div className="mt-[5vh] flex flex-col gap-6">
            <div className="flex justify-between gap-2 items-center">
                <h1 className="text-3xl font-bold">Тендеры для вас</h1>
                <button
                    className="bg-secondary-bg-color transition-all hover:bg-secondary-bg-hover-color p-3 rounded-2xl"
                    onClick={() => navigate("/update-user")}
                >
                    <SettingsIcon />
                </button>
            </div>
            {/* {user.watchedOnboarding === "true" || (
                <div className="relative group overflow-hidden w-full h-fit px-5 py-7 rounded-2xl">
                    <img
                        src={onboardBg}
                        className="absolute transition-all group-hover:blur-none blur-sm -z-5 top-0 left-0 w-full h-full"
                        alt=""
                        srcset=""
                    />
                    <p className="text-xl text-">Онбординг</p>
                </div>
            )} */}
            {error && (
                <p className="text-center w-full text-[#FF3E3E] mt-3">
                    {error}
                </p>
            )}
            {loading && (
                <p className="mt-30 text-2xl text-center font-medium">
                    Идет подбор тендеров под специфику вашего бизнеса. Процесс может занимать до 5 минут.
                    Пожалуйста, не покидайте сайт.
                </p>
            )}
            <div className="flex flex-col gap-1.5 mb-[5vh]">
                {tenders.map((tender) => (
                    <TenderCard key={tender.id} onClick={() => navigate(`/tenders/${tender.id}`)} {...tender} />
                ))}
            </div>
        </div>
    );
}
