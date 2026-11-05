"use client";

import Image from "next/image";
import { useState } from "react";

const placeholder = "/assets/images/image-placeholder.svg";

type SalonImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function SalonImage({ src, alt, className }: SalonImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = src && failedSrc !== src ? src : placeholder;

  return (
    <Image
      className={className}
      src={imageSrc}
      alt={imageSrc === placeholder ? `Photo coming soon for ${alt}` : alt}
      width={960}
      height={640}
      unoptimized
      onError={() => {
        if (imageSrc !== placeholder) setFailedSrc(imageSrc);
      }}
    />
  );
}
