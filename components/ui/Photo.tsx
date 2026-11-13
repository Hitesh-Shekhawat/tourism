import Image from "next/image";
import type { CSSProperties } from "react";
import { assets, type AssetKey, type Ratio } from "@/content/assets";
import { imagePositions, imageSources } from "@/content/imageSources";

const ratioCss: Record<Ratio, string> = { "4:5": "4 / 5", "3:2": "3 / 2", "21:9": "21 / 9", "16:9": "16 / 9" };

type Props = {
  k: AssetKey;
  sizes: string;
  /** Fill the positioned parent instead of sizing by the asset ratio. */
  fill?: boolean;
  /** Override the box ratio (the photo is cropped with object-fit: cover). */
  ratio?: Ratio;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** Hide the brief text on very small placements. */
  compact?: boolean;
  /** Decorative duplicate (e.g. the second copy of an image): empty alt. */
  decorative?: boolean;
};

/**
 * Self-hosted photo through next/image. Missing photos retain their layout space without displaying
 * placeholder copy or artwork.
 */
export function Photo({ k, sizes, fill, ratio, priority, className = "", imgClassName = "", style, decorative }: Props) {
  const a = assets[k];
  const source = imageSources[k] ?? (a.width && a.height ? a.src : undefined);
  const box: CSSProperties = fill ? { position: "absolute", inset: 0 } : { position: "relative", aspectRatio: ratioCss[ratio ?? a.ratio] };

  if (source) {
    return (
      <div className={`overflow-hidden bg-dune ${className}`} style={{ ...box, ...style }}>
        <Image
          src={source}
          alt={decorative ? "" : a.alt}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          className={`object-cover ${imgClassName}`}
          style={{ objectPosition: imagePositions[k] }}
        />
      </div>
    );
  }

  return <div className={`overflow-hidden bg-dune ${className}`} style={{ ...box, ...style }} aria-hidden="true" />;
}

/** True when a real photo is supplied for the key (otherwise <Photo> draws a placeholder). */
export const hasPhoto = (k: AssetKey) => !!(imageSources[k] ?? (assets[k].width && assets[k].height ? assets[k].src : undefined));

export const assetRatio = (k: AssetKey) => ratioCss[assets[k].ratio];
