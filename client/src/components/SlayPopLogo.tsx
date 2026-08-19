import React, { useEffect, useState } from "react";

interface SlayPopLogoProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "auto" | "svg" | "image";
}

/**
 * Precision Vector SVG Logo Mark of SlayPOP
 */
export const SlayPopSvgLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = "h-8 w-auto",
  style,
}) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={style}
    aria-label="SlayPOP Logo Mark"
  >
    {/* Outer circle */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
    {/* Inner circle */}
    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="4" />
    {/* S letter - top left */}
    <path d="M 22,28 L 42,28 L 42,34 L 28,34 L 28,46 L 42,46 L 42,58 L 22,58 L 22,52 L 36,52 L 36,40 L 22,40 Z" />
    {/* P letter - top right */}
    <path d="M 48,24 L 68,24 L 74,30 L 74,44 L 68,50 L 54,50 L 54,62 L 48,62 Z M 54,30 L 54,44 L 68,44 L 68,30 Z" />
    {/* O letter - bottom center */}
    <circle cx="50" cy="68" r="12" fill="none" stroke="currentColor" strokeWidth="5" />
  </svg>
);

/**
 * Background-Removed Canvas Image Logo Mark
 * Dynamically strips white background from user's logo image and crops whitespace.
 */
export const SlayPopImageLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = "h-8 w-auto",
  style,
}) => {
  const [cleanedDataUrl, setCleanedDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/slaypop-logo.jpg";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;
        let foundLogoPixel = false;

        // Strip white background (r > 200, g > 200, b > 200)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0; // Completely transparent
          } else {
            foundLogoPixel = true;
            const pixelIdx = i / 4;
            const x = pixelIdx % canvas.width;
            const y = Math.floor(pixelIdx / canvas.width);

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Crop tightly around the logo mark to remove outer whitespace margin
        if (foundLogoPixel && maxX > minX && maxY > minY) {
          const cropWidth = maxX - minX + 1;
          const cropHeight = maxY - minY + 1;

          const croppedCanvas = document.createElement("canvas");
          croppedCanvas.width = cropWidth;
          croppedCanvas.height = cropHeight;

          const croppedCtx = croppedCanvas.getContext("2d");
          if (croppedCtx) {
            croppedCtx.drawImage(
              canvas,
              minX,
              minY,
              cropWidth,
              cropHeight,
              0,
              0,
              cropWidth,
              cropHeight
            );
            setCleanedDataUrl(croppedCanvas.toDataURL("image/png"));
            return;
          }
        }

        setCleanedDataUrl(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Failed to process logo background", err);
      }
    };
  }, []);

  if (!cleanedDataUrl) {
    return <SlayPopSvgLogo className={className} style={style} />;
  }

  return (
    <img
      src={cleanedDataUrl}
      alt="SlayPOP Logo"
      className={`object-contain inline-block shrink-0 dark:invert transition-all ${className}`}
      style={style}
    />
  );
};

export const SlayPopLogo: React.FC<SlayPopLogoProps> = ({
  className = "h-8 w-auto",
  variant = "auto",
  style,
}) => {
  if (variant === "svg") {
    return <SlayPopSvgLogo className={className} style={style} />;
  }

  return <SlayPopImageLogo className={className} style={style} />;
};

export default SlayPopLogo;
