import clsx from "clsx";
// import MainButton from "../ui/main-button";

export function TenderMiniCard({
    className,
    post_date,
    title,
    region,
    until_date,
    price = "Цена не указана",
}) {
    const formatPrice = (price) => {
        const intPrice = parseInt(price);
        if (isNaN(intPrice)) {
            return "Цена не указана";
        }
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
        }).format(intPrice);
    };
    const formatDate = (dateString) => {
        if (!dateString) return "???";

        const date = new Date(dateString);
        if (isNaN(date)) return "???";

        return date.toLocaleDateString("ru-RU");
    };

    const formattedPrice = formatPrice(price);
    const formattedPostDate = formatDate(post_date);
    const formattedUntilDate = formatDate(until_date);
    const formattedRegion = region ? region : "Регион не указан";

    return (
        <div className={clsx(className, "flex flex-col gap-2")}>
            <h2 className="font-medium text-xl">
                {title ? title : "Название не указано"}
            </h2>
                <div className="flex gap-1 items-center">
                    <Encased>{formattedRegion}</Encased>
                    <Encased>
                        с {formattedPostDate} до {formattedUntilDate}
                    </Encased>
                </div>
                {/* <p className="text-lg mt-2 text-right">
                    {formattedPrice}
                </p> 
                <MainButton isPrimary={false} className={}></MainButton>       */}
        </div>
    );
}

function Encased({ children }) {
    return (
        <div className="bg-[#272727] rounded-lg text-secondary-color text-sm px-2 py-1">
            {children}
        </div>
    );
}
