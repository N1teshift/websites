import React from 'react';

export interface StatusIndicatorProps {
  /** Whether the test passed */
  isPassed?: boolean;
  /** Whether the test failed */
  isFailed?: boolean;
  /** Whether the test is currently running */
  isRunning?: boolean;
  /** Tooltip text */
  title?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isPassed = false,
  isFailed = false,
  isRunning = false,
  title
}) => {
  // Determine which status to display
  let color, text;
  
  if (isPassed) {
    color = 'bg-success-500';
    text = '✓';
  } else if (isFailed) {
    color = 'bg-danger-500';
    text = '✖';
  } else if (isRunning) {
    color = 'bg-warning-500';
    text = '⟳';
  } else {
    color = 'bg-surface-button';
    text = '-';
  }

  return (
    <div 
      className={`w-5 h-5 rounded-full flex items-center justify-center ${color} text-white text-xs`}
      title={title}
    >
      {text}
    </div>
  );
};

export default StatusIndicator; 



