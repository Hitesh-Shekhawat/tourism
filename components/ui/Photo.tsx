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
  /** Where the placeholder brief sits (bottom by default, so arch crowns never clip it). */
  phPos?: "top" | "bottom" | "below-header";
};

/**
 * Self-hosted photo through next/image, or, until the owner supplies the file, a dune-coloured
 * placeholder at the final ratio showing the filename and brief (§8.5).
 */
export function Photo({ k, sizes, fill, ratio, priority, className = "", imgClassName = "", style, compact, decorative, phPos = "bottom" }: Props) {
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

  return (
    <div className={`overflow-hidden bg-dune ${className}`} style={{ ...box, ...style }} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : `Photo to come: ${a.alt}`} aria-hidden={decorative || undefined}>
      <div
        className={`photo-inner absolute inset-0 flex flex-col gap-1.5 p-4 text-ink sm:p-5 ${phPos === "bottom" ? "justify-end" : "justify-start"} ${imgClassName}`}
        style={{
          backgroundImage: "repeating-linear-gradient(135deg, transparent 0 14px, rgb(30 26 22 / .035) 14px 15px)",
          ...(phPos === "below-header" && { paddingTop: "calc(var(--header-h) + 20px)" }),
        }}
      >
        <span className="t-label text-[0.625rem]! tracking-[0.14em]!">Owner to supply · photo · {a.ratio}</span>
        <span className="font-mono text-[11px] leading-snug break-all opacity-90">{a.file}</span>
        {!compact && <span className="max-w-[40ch] text-[12px] leading-snug opacity-80">{a.subject}. {a.time}.</span>}
      </div>
    </div>
  );
}

/** True when a real photo is supplied for the key (otherwise <Photo> draws a placeholder). */
export const hasPhoto = (k: AssetKey) => !!(imageSources[k] ?? (assets[k].width && assets[k].height ? assets[k].src : undefined));

export const assetRatio = (k: AssetKey) => ratioCss[assets[k].ratio];
