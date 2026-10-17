import React from 'react';

export default function H3Heading({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-xl sm:text-2xl font-medium tracking-tight transition-colors duration-300 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}
