import clsx from "clsx";

export function PageLayout({ children }) {
    const isDesktop = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileDevices =
            /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        const isOnDesktop = (
            !mobileDevices.test(userAgent) 
        )
        console.log(isOnDesktop ? "w-full min-w-70" : "w-90")
        return isOnDesktop;
    };

    return (
        <div className="w-full h-full flex justify-center overflow-hidden ">
            <div
                className={clsx(
                    isDesktop() ? "w-90 inset-shadow-sm inset-shadow-secondary-color rounded-2xl" : "w-full min-w-70",
                    " h-full p-4 overflow-y-scroll overflow-x-hidden relative"
                )}
            >
                <div className="h-fit">{children}</div>
            </div>
        </div>
    );
}
