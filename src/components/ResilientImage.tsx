import React, { useEffect, useState } from 'react';
import { Flower2 } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
  objectFit?: 'cover' | 'contain';
  titleFallback?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  aspectClassName = 'aspect-[4/3]',
  objectFit = 'cover',
  titleFallback,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`${aspectClassName} flex flex-col items-center justify-center bg-[#EFE4D3] border border-[#B69A64]/30 px-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Flower2 className="w-7 h-7 text-[#B69A64] mb-2" strokeWidth={1.3} />
        <span className="font-display text-lg text-[#183923] leading-snug">
          {titleFallback || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`${aspectClassName} overflow-hidden bg-[#EFE4D3] ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      />
    </div>
  );
};
