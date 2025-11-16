import clsx from "clsx";

export default function DropdownInput({ options, name, ...props }) {
    return (
        <select
            className={clsx(
                "bg-[#1C1C1E] rounded-xl flex p-4.5 w-fill h-fit text-[1rem]"
            )}
            id={name}
            name={name}
            {...props}
        >
            {Object.keys(options).map((key) => (
                <option value={key} key={key}>{options[key]}</option>
            ))}
        </select>
    );
}
