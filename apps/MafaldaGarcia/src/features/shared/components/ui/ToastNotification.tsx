import React, { useEffect, useState } from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastNotificationProps {
    messageKey: string;
    visible: boolean;
    type?: ToastType;
    duration?: number;
    onClose?: () => void;
}

/**
 * Displays a toast notification that slides in from the right and disappears after a delay.
 * Supports different types (success, error, warning, info) with appropriate styling.
 *
 * @param props The component props.
 * @param props.messageKey The translation key for the message to display.
 * @param props.visible Controls the visibility of the toast.
 * @param props.type The type of toast (success, error, warning, info).
 * @param props.duration How long to show the toast in milliseconds (default: 5000ms).
 * @param props.onClose Optional callback when toast is dismissed.
 * @returns A React element representing the toast notification.
 */
const ToastNotification: React.FC<ToastNotificationProps> = ({ 
    messageKey, 
    visible, 
    type = 'info', 
    duration = 5000,
    onClose 
}) => {
    const { t } = useFallbackTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [visible, duration, onClose]);

    const getToastStyles = () => {
        const baseStyles = 'fixed top-4 right-4 max-w-sm w-full p-4 rounded-md text-white text-lg shadow-lg transition-transform duration-500 ease-in-out';
        
        switch (type) {
            case 'success':
                return `${baseStyles} bg-green-600`;
            case 'error':
                return `${baseStyles} bg-red-600`;
            case 'warning':
                return `${baseStyles} bg-yellow-600`;
            case 'info':
            default:
                return `${baseStyles} bg-blue-600`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <div
            className={`${getToastStyles()} ${isVisible ? 'translate-x-0' : 'translate-x-[150%]'}`}
            style={{ zIndex: 1000, transform: isVisible ? 'translateX(0)' : 'translateX(150%)' }}
        >
            <div className="flex items-center">
                <div className="mr-2">
                    {getIcon()}
                </div>
                <p>{t(messageKey)}</p>
            </div>
        </div>
    );
};

export default ToastNotification;
