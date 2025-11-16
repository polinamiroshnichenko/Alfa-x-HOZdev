import clsx from "clsx";

export default function MainButton({ children, className, ...props }) {
    return (
        <button
            className={clsx(
                "rounded-xl bg-highlight hover:bg-highlight-hover disabled:bg-highlight-disabled p-4.5 h-fit w-full text-lg",
                className
            )}
            {...props}
        >
            <span className="w-full text-center wrap-anywhere">{children}</span>
        </button>
    );
}