import React, { useState } from "react";
import { Button } from "@websites/ui";
import PromptModal from "./PromptModal";
import { useFallbackTranslation } from "@websites/infrastructure/i18n";
import { PromptData } from "@ai/types";

interface PromptButtonProps {
    label?: string; // Optional label key for the button, used for translation. Defaults to 'ai_prompt'.
    initialPrompt?: string; // Optional initial text to prefill the prompt input in the modal.
    onResult?: (data: PromptData) => void; // Callback function invoked when the modal submits a result.
}

const PromptButton: React.FC<PromptButtonProps> = ({ label, initialPrompt = "", onResult }) => {
    const { t } = useFallbackTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const buttonLabel = label ? t(label) : t("ai_prompt");

    return (
        <>
            <Button onClick={handleOpen} variant="primary">{buttonLabel}</Button>
            {isOpen && <PromptModal onClose={handleClose} initialPrompt={initialPrompt} onResult={onResult} />}
        </>
    );
};

export default PromptButton;



