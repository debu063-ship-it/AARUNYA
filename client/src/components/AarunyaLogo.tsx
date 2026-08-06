import React, { useEffect, useState } from "react";

interface AarunyaLogoProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: "auto" | "svg" | "image";
}

/**
 * Precision Vector SVG Logo Mark of Aarunya
 */
export const AarunyaSvgLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = "h-8 w-auto",
  style,
}) => (
  <svg
    viewBox="0 0 240 360"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block select-none ${className}`}
    style={style}
    aria-label="Aarunya Logo Mark"
  >
    {/* Outer Left Wall and Curved Arch */}
    <path d="M 40,100 C 40,50 80,20 130,20 C 180,20 220,50 220,100 L 220,118 C 220,78 190,46 148,46 C 106,46 72,78 72,118 L 72,240 L 165,240 L 165,262 L 40,262 Z" />

    {/* Upper Inner Arc Semi-Circle */}
    <path d="M 72,100 C 72,70 98,48 130,48 C 162,48 188,70 188,100 L 166,100 C 166,82 150,68 130,68 C 110,68 94,82 94,100 Z" />

    {/* Center Vertical Bar */}
    <path d="M 120,20 L 140,20 L 140,175 L 120,175 Z" />

    {/* Main Intersecting Diagonal Stroke \ */}
    <path d="M 76,64 L 98,46 L 210,164 L 188,182 Z" />

    {/* Right Stem / N Accent Bar with 45-deg Angled Ends */}
    <path d="M 198,30 L 224,4 L 224,250 L 198,276 Z" />

    {/* Inner Lower-Left Diagonal Accent Bar */}
    <path d="M 60,170 L 102,212 L 84,230 L 42,188 Z" />
  </svg>
);

/**
 * Background-Removed Canvas Image Logo Mark
 * Dynamically strips white background from user's logo image and crops whitespace.
 */
export const AarunyaImageLogo: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = "h-8 w-auto",
  style,
}) => {
  const [cleanedDataUrl, setCleanedDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/images/aarunya-logo.jpg";

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
    return <AarunyaSvgLogo className={className} style={style} />;
  }

  return (
    <img
      src={cleanedDataUrl}
      alt="Aarunya Logo"
      className={`object-contain inline-block shrink-0 dark:invert transition-all ${className}`}
      style={style}
    />
  );
};

export const AarunyaLogo: React.FC<AarunyaLogoProps> = ({
  className = "h-8 w-auto",
  variant = "auto",
  style,
}) => {
  if (variant === "svg") {
    return <AarunyaSvgLogo className={className} style={style} />;
  }

  return <AarunyaImageLogo className={className} style={style} />;
};

export default AarunyaLogo;
