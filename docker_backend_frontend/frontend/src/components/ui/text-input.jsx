import clsx from "clsx";

export default function TextInput({
    name,
    className,
    ...props
}) {
    return (
        <input
            className={clsx(
                "bg-[#1C1C1E] placeholder:text-secondary-color rounded-xl flex p-4.5 w-fill h-fit text-[1rem]",
                className
            )}
            id={name}
            name={name}
            {...props}
        />
    );
}
