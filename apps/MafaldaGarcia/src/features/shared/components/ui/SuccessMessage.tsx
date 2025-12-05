import React, { useEffect, useState } from 'react';
import { useFallbackTranslation } from '@/features/i18n';

interface SuccessMessageProps {
    messageKey: string;
    visible: boolean;
}

/**
 * Displays a success message notification that slides in from the right and disappears after a delay.
 *
 * @param props The component props.
 * @param props.messageKey The translation key for the message to display.
 * @param props.visible Controls the visibility of the message. When set to true, the message appears and stays for 10 seconds. When set to false, it hides immediately.
 * @returns A React element representing the success message notification.
 */
const SuccessMessage: React.FC<SuccessMessageProps> = ({ messageKey, visible }) => {
    const { t } = useFallbackTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 10000); // Keep the message for 10 seconds

            return () => clearTimeout(timer); // Clean up the timer when the component unmounts
        } else {
            // If visible prop becomes false, hide the message immediately
            setIsVisible(false);
        }
    }, [visible]);

    return (
        <div
            className={`fixed top-4 right-4 max-w-sm w-full p-4 rounded-md bg-green-600 text-white text-lg shadow-lg transition-transform duration-500 ease-in-out ${isVisible ? 'translate-x-0' : 'translate-x-[150%]'
                }`}
            style={{ zIndex: 1000, transform: isVisible ? 'translateX(0)' : 'translateX(150%)' }}
        >
            <div className="flex items-center">
                <div className="mr-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <p>{t(messageKey)}</p>
            </div>
        </div>
    );
};

export default SuccessMessage;