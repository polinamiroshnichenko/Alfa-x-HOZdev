import clsx from "clsx";

export default function MainButton({ children, className, isPrimary=true, ...props }) {
    return (
        <button
            className={clsx(
                "rounded-xl p-4.5 h-fit w-full text-lg",
                className,
                isPrimary ? "bg-highlight hover:bg-highlight-hover disabled:bg-highlight-disabled" : "bg-secondary-bg-color hover:bg-secondary-bg-hover-color disabled:bg-secondary-bg-hover-color"
            )}
            {...props}
        >
            <span className="w-full text-center wrap-anywhere">{children}</span>
        </button>
    );
}