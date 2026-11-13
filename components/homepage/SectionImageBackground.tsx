import { Photo } from "@/components/ui/Photo";

type Props = {
  variant: "editorial" | "masonry" | "field" | "closing";
};

export function SectionImageBackground({ variant }: Props) {
  return (
    <div className={`section-image section-image--${variant}`} aria-hidden="true">
      <Photo k="homeHero" fill sizes="100vw" decorative compact className="section-image-media" imgClassName="section-image-photo" />
    </div>
  );
}
