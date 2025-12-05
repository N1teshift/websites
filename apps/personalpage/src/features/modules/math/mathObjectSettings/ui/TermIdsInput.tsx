import React, { useEffect } from "react";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";


export interface TermIdsInputProps {
    termIds: string[]; // current array of term IDs (exponent strings)
    setTermIds: (value: string[]) => void; // updates the termIds array
    collectionCount: number; // expected number of term IDs, typically derived from the associated coefficient collection count
}


const TermIdsInput: React.FC<TermIdsInputProps> = ({ termIds, setTermIds, collectionCount }) => {
    const { t } = useFallbackTranslation();

    useEffect(() => {
        // Ensure termIds has the correct length and empty values are replaced with "0"
        const updatedTermIds = Array.from({ length: collectionCount }, (_, i) => termIds[i] || "0");
        if (JSON.stringify(updatedTermIds) !== JSON.stringify(termIds)) {
            setTermIds(updatedTermIds);
        }
    }, [collectionCount, termIds, setTermIds]);

    const handleTermIdChange = (index: number, newValue: string) => {
        const updatedTermIds = [...termIds];
        updatedTermIds[index] = newValue.trim() === "" ? "0" : newValue;
        setTermIds(updatedTermIds);
    };

    return (
        <div className="flex flex-col">
            <label className="font-semibold text-text-primary">{t("term_orders")}</label>
            <div className="flex gap-2">
                {termIds.map((value, index) => (
                    <input
                        key={index}
                        type="text"
                        value={value}
                        onChange={(e) => handleTermIdChange(index, e.target.value)}
                        className="border border-border-default rounded-md bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-brand w-10 text-center"
                        placeholder={`a_${index + 1}`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                    />
                ))}
            </div>
        </div>
    );
};

export default TermIdsInput;



