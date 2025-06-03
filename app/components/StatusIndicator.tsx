import React from "react";


type StatusType = 'online' | 'offline' | 'warning' | 'unknown';

interface StatusIndicatorProps {
  status: StatusType;
  pulse?: boolean;
  className?: string;
}

const statusClasses: Record<StatusType, string> = {
  online: 'bg-green-500',
  offline: 'bg-red-500',
  warning: 'bg-yellow-500',
  unknown: 'bg-gray-500'
};

export function StatusIndicator({ 
  status, 
  pulse = true, 
  className = ""
}: StatusIndicatorProps) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <span className={`w-3 h-3 rounded-full ${statusClasses[status]}`} />
      {pulse && (
        <span
          className={`absolute inline-flex w-full h-full rounded-full opacity-75 ${statusClasses[status]} animate-ping animation-duration-2000`}
        />
      )}
    </span>
  );
}
