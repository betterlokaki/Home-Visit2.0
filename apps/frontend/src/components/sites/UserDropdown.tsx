import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@home-visit/common';

interface UserDropdownProps {
  users: User[];
  selectedUsernames: string[];
  onSelectionChange: (usernames: string[]) => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  users,
  selectedUsernames,
  onSelectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (username: string) => {
    const newSelection = selectedUsernames.includes(username)
      ? selectedUsernames.filter((u) => u !== username)
      : [...selectedUsernames, username];
    onSelectionChange(newSelection);
  };

  const displayText =
    selectedUsernames.length === 0
      ? 'משתמש'
      : selectedUsernames.length === 1
        ? (() => {
            const user = users.find((u) => u.username === selectedUsernames[0]);
            if (!user) {
              throw new Error(`User not found: ${selectedUsernames[0]}`);
            }
            return user.userDisplayName || user.username;
          })()
        : `${selectedUsernames.length} משתמשים`;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 rounded text-sm font-semibold transition-colors flex items-center gap-2 ${
          isOpen || selectedUsernames.length > 0
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
        }`}
      >
        <span>{displayText}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-[84px] max-h-60 overflow-y-auto">
          {users.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-gray-400 text-center">No users available</div>
          ) : (
            users.map((user) => {
              const isSelected = selectedUsernames.includes(user.username);
              return (
                <div
                  key={user.username}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-100 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => toggleUser(user.username)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleUser(user.username)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer flex-shrink-0"
                  />
                  <span className="flex-1 text-right text-gray-100">{user.userDisplayName || user.username}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

