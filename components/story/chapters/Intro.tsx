import { Arch } from "@/components/ui/Arch";
import { Photo } from "@/components/ui/Photo";
import { Copy, TrailDivider } from "@/components/ui/bits";
import { intro } from "@/content/home";
import { chapterHeadingId } from "@/lib/day";
import { Chapter, ChapterHead } from "../Chapter";
import { HeadingFx } from "./HeadingFx";

/** Ch01 · 06:15 · आमेर (§6.2): an editorial spread. Restrained: a mask reveal and a text rise, no pin. */
export function Intro() {
  return (
    <Chapter id="intro" className="grain section-y overflow-hidden">
      <HeadingFx id="intro" order={10} />
      <div className="wrap grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 lg:col-start-1">
          <Arch className="mx-auto max-w-[460px] lg:mx-0">
            <Photo k="introArch" sizes="(min-width: 1024px) 34vw, 90vw" />
          </Arch>
          <p className="t-label mt-6 text-fg-muted">
            Amer, morning <span lang="hi" aria-hidden="true" className="ml-2 text-[0.9375rem]">आमेर</span>
          </p>
        </div>

        <div className="relative lg:col-span-6 lg:col-start-7">
          <ChapterHead id="intro" label="Introduction" />
          <h2 id={chapterHeadingId("intro")} className="t-h1 mt-8 max-w-[16ch]" data-rise>
            {intro.title}
          </h2>
          <div className="mt-10 space-y-5 text-fg-muted" data-reveal style={{ ["--d" as string]: "120ms" }}>
            <p className="dropcap measure text-fg">
              <Copy text={intro.paragraphs[0]} />
            </p>
            <p className="measure">
              <Copy text={intro.paragraphs[1]} />
            </p>
          </div>
          <TrailDivider className="mt-10" />

          {/* Offset secondary plate breaking the hairline grid */}
          <div className="relative mt-16 ml-auto w-[48%] max-w-[260px] lg:-mr-[8%] lg:-mb-24">
            <div aria-hidden="true" className="absolute -top-6 -left-6 h-px w-[140%] bg-brass/50" />
            <div aria-hidden="true" className="absolute -top-12 -left-6 h-[140%] w-px bg-brass/50" />
            <div className="relative overflow-hidden" data-reveal-mask style={{ ["--d" as string]: "250ms" }}>
              <div data-parallax="6">
                <Photo k="introDetail" sizes="260px" compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
