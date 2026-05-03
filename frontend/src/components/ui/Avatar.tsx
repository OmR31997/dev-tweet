import React, { useMemo, useState } from 'react';

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  alt?: string;
  className?: string;
  initialsClassName?: string;
};

export default function Avatar({
  name,
  src,
  alt = '',
  className = 'h-10 w-10 rounded-full border border-black/12 object-cover',
  initialsClassName = 'flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-xs font-bold text-primary',
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = useMemo(() => {
    const raw = (name || 'User').trim();
    const chars = raw
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
    return chars || 'U';
  }, [name]);

  if (!src || imageFailed) {
    return <div className={`${className} ${initialsClassName}`}>{initials}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setImageFailed(true)}
    />
  );
}
