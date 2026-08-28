import React, { useState } from "react";

export interface SlayPopLogoProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "auto" | "svg" | "image";
}

/**
 * Precision Vector / Image Logo of SlayPOP
 * Uses the custom uploaded brand logo mark with clean transparent alpha channels.
 */
export const SlayPopLogo: React.FC<SlayPopLogoProps> = ({
  className = "h-8 w-auto",
  variant = "auto",
  style,
}) => {
  const [imgError, setImgError] = useState(false);

  // If image fails to load or SVG is forced, fallback to clean inline representation
  if (variant === "svg" || imgError) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block select-none shrink-0 ${className}`}
        style={style}
        aria-label="SlayPOP Logo Mark"
      >
        <path
          d="M32 25 C20 35 15 50 25 65 C32 75 48 78 50 68 C52 58 40 52 38 42 C36 32 45 28 55 28 C65 28 72 32 78 40 C85 50 82 65 72 72 C62 80 50 85 45 92 C42 96 46 100 50 100 C58 100 68 88 78 78 C88 68 90 50 80 35 C70 20 50 18 32 25 Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <img
      src="/images/slaypop-logo.png"
      alt="SlayPOP Logo"
      className={`object-contain inline-block shrink-0 dark:invert transition-all select-none ${className}`}
      style={style}
      onError={() => setImgError(true)}
      loading="eager"
    />
  );
};

export const SlayPopImageLogo = SlayPopLogo;
export const SlayPopSvgLogo = SlayPopLogo;

export default SlayPopLogo;
