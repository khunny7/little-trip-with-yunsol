import React, { useState, useEffect } from 'react';
import { getCachedImage, setCachedImage, hasCachedImage } from '../utils/imageCache';
import defaultAvatar from '../assets/default-avatar.svg';
import styles from './Avatar.module.css';

const Avatar = ({ 
  src, 
  alt = 'Profile', 
  size = 'medium', 
  className = '',
  fallbackInitials = '?',
  showDefaultImage = true
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Check if image is already cached
    if (hasCachedImage(src)) {
      setImageSrc(getCachedImage(src));
      setHasError(false);
      setIsLoading(false);
      return;
    }

    // Preload image with error handling
    const img = new Image();
    img.onload = () => {
      setCachedImage(src, src);
      setImageSrc(src);
      setHasError(false);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.warn('Failed to load profile image - may be rate limited:', src);
      setHasError(true);
      setIsLoading(false);
    };
    
    // Add cache control to reduce repeated requests
    img.src = src;
  }, [src]);

  const sizeClass = styles[`avatar-${size}`] || styles['avatar-medium'];
  const containerClass = `${styles.avatar} ${sizeClass} ${className}`;

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className={styles.loading}>⟳</div>
      </div>
    );
  }

  if (hasError || !imageSrc) {
    if (showDefaultImage) {
      return (
        <div className={containerClass}>
          <img 
            src={defaultAvatar} 
            alt={alt}
            loading="lazy"
            decoding="async"
          />
        </div>
      );
    } else {
      return (
        <div className={containerClass}>
          <div className={styles.placeholder}>
            {fallbackInitials}
          </div>
        </div>
      );
    }
  }

  return (
    <div className={containerClass}>
      <img 
        src={imageSrc} 
        alt={alt}
        onError={() => setHasError(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default Avatar;
