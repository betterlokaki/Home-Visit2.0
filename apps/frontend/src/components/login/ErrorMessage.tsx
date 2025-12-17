import React from 'react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-error-bg border border-error-border rounded-lg p-4 text-error-text">
      <p className="font-semibold">שגיאה</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
};

