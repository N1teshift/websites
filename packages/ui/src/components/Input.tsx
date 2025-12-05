export const NumberInput = ({
    label,
    value,
    onChange,
}: {
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <div className="mb-2.5 flex items-center gap-2.5">
        <label className="text-black">{label}:</label>
        <input
            type="number"
            value={value}
            onChange={onChange}
            className="border border-black px-2 py-1 rounded w-12 text-center inline-block bg-white text-black"
        />
    </div>
);

export const SelectInput = ({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
    <div className="mb-2.5">
        <label className="text-black mr-2.5">{label}:</label>
        <select
            value={value}
            onChange={onChange}
            className="border border-black px-2 py-1 rounded bg-white text-black"
        >
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);

