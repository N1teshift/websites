import React from "react";

interface StatusMessageProps {
  message: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="text-sm font-medium text-text-primary mb-4 p-3 bg-surface-card rounded-md border border-border-default">
      {message}
    </div>
  );
};

export default StatusMessage;
