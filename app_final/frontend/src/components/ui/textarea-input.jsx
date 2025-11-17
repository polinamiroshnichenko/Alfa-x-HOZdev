import clsx from "clsx";

export default function TextareaInput({
    name,
    className,
    ...props
}) {
    return (
        <textarea
            className={clsx(
                "bg-secondary-bg-color placeholder:text-secondary-color resize-none rounded-xl flex p-4.5 w-fill h-fit text-[1rem]",
                className
            )}
            id={name}
            name={name}
            {...props}
        />
    );
}
