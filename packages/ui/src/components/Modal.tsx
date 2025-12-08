import React, { useEffect } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
}

/**
 * A styled modal dialog component that matches the website's design system.
 * Displays a message with an OK button to close.
 *
 * @param props The component props.
 * @param props.isOpen If true, the modal is displayed. If false, it returns null.
 * @param props.onClose Callback function called when the modal should be closed.
 * @param props.title Optional title displayed at the top of the modal.
 * @param props.message The message content to display in the modal.
 * @param props.confirmText Optional text for the confirm button. Defaults to "OK".
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "OK",
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <Card
        variant="default"
        className="relative z-10 w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-2xl font-bold text-text-primary mb-4">{title}</h2>
        )}
        <p className="text-text-primary mb-6">{message}</p>
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose} size="md">
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Modal;
