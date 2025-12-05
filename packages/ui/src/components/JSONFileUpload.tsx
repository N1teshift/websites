import React, { useRef, useState } from 'react';

interface JSONFileUploadProps {
    onUpload: (data: unknown) => void;
    onError?: (error: string) => void;
    acceptMultiple?: boolean;
    buttonText: string;
    buttonClassName?: string;
    validator?: (data: unknown) => { valid: boolean; error?: string };
}

const JSONFileUpload: React.FC<JSONFileUploadProps> = ({
    onUpload,
    onError,
    acceptMultiple = false,
    buttonText,
    buttonClassName = '',
    validator
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsProcessing(true);

        try {
            const file = files[0];
            const text = await file.text();
            const data = JSON.parse(text);

            if (validator) {
                const validation = validator(data);
                if (!validation.valid) {
                    if (onError) {
                        onError(validation.error || 'Invalid data format');
                    }
                    setIsProcessing(false);
                    event.target.value = '';
                    return;
                }
            }

            onUpload(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to parse JSON file';
            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsProcessing(false);
            event.target.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const defaultClassName = "inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer transition-colors touch-manipulation min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isProcessing}
                className={buttonClassName || defaultClassName}
            >
                {isProcessing ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        <span className="mr-2">📤</span>
                        {buttonText}
                    </>
                )}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                multiple={acceptMultiple}
                onChange={handleFileChange}
                className="sr-only"
            />
        </>
    );
};

export default JSONFileUpload;

