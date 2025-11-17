import clsx from "clsx";

export function TenderCard({
    className,
    post_date,
    title,
    region,
    until_date,
    price = "Цена не указана",
    onClick,
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
    const formatDate = (dateString, dateLabel, datePrefix = "") => {
        if (!dateString) return "Дата " + dateLabel + " не указана";

        const date = new Date(dateString);
        if (isNaN(date)) return "Дата " + dateLabel + " не указана";

        return datePrefix + date.toLocaleDateString("ru-RU");
    };

    const formattedPrice = formatPrice(price);
    const formattedPostDate = formatDate(
        post_date,
        "публикации",
        "Опубликовано "
    );
    const formattedUntilDate = formatDate(until_date, "окончания", "до ");
    const formattedRegion = region ? region : "Регион не указан";

    return (
        <button
            onClick={onClick}
            className={clsx(
                className,
                "bg-secondary-bg-color hover:bg-secondary-bg-hover-color transition-all z-1 p-5 rounded-2xl flex flex-col gap-5 text-left"
            )}
        >
            <p className="text-secondary-color text-sm">{formattedPostDate}</p>
            <h2 className="font-medium text-xl">
                {title ? title : "Название не указано"}
            </h2>
            <div className="flex justify-between items-center w-full">
                <div className="flex gap-1 items-center">
                    <Encased>{formattedRegion}</Encased>
                    <Encased>{formattedUntilDate}</Encased>
                </div>
                <span className="text-lg w-fit text-right">
                    {formattedPrice}
                </span>
            </div>
        </button>
    );
}

function Encased({ children }) {
    return (
        <div className="bg-[#272727] rounded-lg text-secondary-color text-sm px-2 py-1">
            {children}
        </div>
    );
}
