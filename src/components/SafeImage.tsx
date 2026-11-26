import React, { useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="w-full h-full bg-gradient-to-br from-[#F3EDE2] via-[#E8DFD1] to-[#D9CCB8] flex flex-col items-center justify-center p-6 text-center select-none"
        role="img"
        aria-label={alt}
      >
        <svg
          width="36"
          height="44"
          viewBox="0 0 36 44"
          fill="none"
          className="text-[#2B211B]/50 mb-3"
          aria-hidden="true"
        >
          <rect x="13" y="2" width="10" height="6" stroke="currentColor" strokeWidth="1.2" />
          <path d="M11 8H25V12H11V8Z" stroke="currentColor" strokeWidth="1.2" />
          <rect x="6" y="12" width="24" height="29" stroke="currentColor" strokeWidth="1.2" />
          <rect x="11" y="19" width="14" height="12" stroke="currentColor" strokeWidth="0.9" />
        </svg>
        {fallbackTitle && (
          <span className="font-serif text-sm text-[#2B211B]/80 tracking-wide">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
