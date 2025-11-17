import clsx from "clsx";

export function PageLayout({ children }) {
    const isDesktop = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileDevices =
            /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        const isOnDesktop = !mobileDevices.test(userAgent);
        return isOnDesktop;
    };

    return (
        <div className="w-full h-full flex justify-center p-4 overflow-hidden ">
            <div
                className={clsx(
                    isDesktop()
                        ? "w-90 sh!!adow-[0px_0px_5px_0px_#8e8e8f] rounded-2xl"
                        : "w-full min-w-70",
                    " h-full overflow-y-scroll overflow-x-hidden relative"
                )}
            >
                <div
                    className={clsx(
                        "fixed inset-0 pointer-events-none z-10 flex justify-center py-4",
                        isDesktop() ? "max-w-90 mx-auto" : "max-w-full"
                    )}
                >
                    <div
                        className={clsx(
                            isDesktop()
                                ? "w-90 rounded-2xl"
                                : "w-full min-w-70",
                            "h-full shadow-[inset_0px_0px_5px_0px_#8e8e8f]"
                        )}
                    ></div>
                </div>
                <div className="min-h-full max-h-[calc(100vh-2rem)] p-4 relative z-0 rounded-2xl overflow-hidden flex flex-col">{children}</div>
            </div>
        </div>
    );
}
