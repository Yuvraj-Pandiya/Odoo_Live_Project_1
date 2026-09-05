'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface NavbarButtonProps {
  href: string;
  label: string;
  active?: boolean;
  variant?: 'desktop' | 'mobile';
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  icon?: string;
  children?: React.ReactNode;
}

export default function NavbarButton({
  href,
  label,
  active = false,
  variant = 'desktop',
  onClick,
  className = '',
  style,
  icon,
  children,
}: NavbarButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (variant === 'mobile') {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`px-4 py-2.5 rounded-lg text-label-md transition-all flex items-center justify-between ${className}`}
        style={{
          background: active
            ? 'rgba(255, 255, 255, 0.08)'
            : isHovered
            ? 'rgba(255, 255, 255, 0.05)'
            : 'transparent',
          color: active || isHovered ? '#f0f0f0' : '#888888',
          fontWeight: active ? 600 : 400,
          ...style,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className="flex items-center gap-2">
          {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
          <span>{children || label}</span>
        </span>
      </Link>
    );
  }

  // Desktop navigation button
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-3 py-2 rounded-lg transition-all text-label-md flex items-center gap-2 ${className}`}
      style={{
        background: active
          ? 'rgba(255, 255, 255, 0.10)'
          : isHovered
          ? 'rgba(255, 255, 255, 0.06)'
          : 'transparent',
        color: active || isHovered ? '#f0f0f0' : '#888888',
        fontWeight: active ? 600 : 500,
        border: active
          ? '1px solid rgba(255, 255, 255, 0.20)'
          : '1px solid transparent',
        ...style,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="flex items-center gap-2">
        {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
        <span>{children || label}</span>
      </span>
    </Link>
  );
}

export { NavbarButton as NavButton };
