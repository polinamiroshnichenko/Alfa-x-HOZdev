import clsx from "clsx";

export default function TextInput({
    name,
    className,
    ...props
}) {
    return (
        <input
            className={clsx(
                "bg-secondary-bg-color placeholder:text-secondary-color rounded-xl flex p-4.5 w-fill h-fit text-[1rem]",
                className
            )}
            id={name}
            name={name}
            {...props}
        />
    );
}
