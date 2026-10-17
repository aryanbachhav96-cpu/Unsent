import React from 'react';

export default function Logo({ className = "w-6 h-6 text-white" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-label="Unsent Logo">
      <path
        d="M4.21 16.5A9 9 0 0 1 16.5 4.21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 4.21A9 9 0 0 1 19.79 16.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2.4 2.3"
      />
      <path
        d="M19.79 16.5A9 9 0 0 1 4.21 16.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="0.01 4.7"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  );
}
