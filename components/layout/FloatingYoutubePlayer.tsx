"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { floatingYoutubeUrl } from "@/content/homepage";

type YouTubePlayer = {
  destroy(): void;
  mute(): void;
  playVideo(): void;
};

type YouTubeApi = {
  Player: new (
    host: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onError: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  const pending = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        previousReady?.();
        if (!window.YT?.Player) {
          reject(new Error("The YouTube IFrame Player API did not initialize."));
          return;
        }
        resolve(window.YT);
      } catch (error) {
        reject(error);
      }
    };

    const script = document.querySelector<HTMLScriptElement>('script[data-youtube-iframe-api="true"]');
    if (script) {
      script.addEventListener("error", () => reject(new Error("The YouTube IFrame Player API failed to load.")), { once: true });
      return;
    }

    const element = document.createElement("script");
    element.src = "https://www.youtube.com/iframe_api";
    element.async = true;
    element.dataset.youtubeIframeApi = "true";
    element.onerror = () => reject(new Error("The YouTube IFrame Player API failed to load."));
    document.head.appendChild(element);
  });

  youtubeApiPromise = pending.catch((error: unknown) => {
    youtubeApiPromise = null;
    throw error;
  });
  return youtubeApiPromise;
}

function parseVideoId(value: string) {
  const input = value.trim();
  if (/^[\w-]{11}$/.test(input)) return input;

  let url: URL;
  try {
    url = new URL(input);
  } catch (error) {
    if (error instanceof TypeError) return null;
    throw error;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  const id =
    host === "youtu.be"
      ? parts[0]
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? url.pathname === "/watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live"].includes(parts[0] ?? "")
            ? parts[1]
            : null
        : null;

  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

function constrainPosition(x: number, y: number, width: number, height: number) {
  return {
    x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - width - 8)),
    y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - height - 8)),
  };
}

function nearestCorner(x: number, y: number, width: number, height: number) {
  const right = Math.max(8, window.innerWidth - width - 8);
  const bottom = Math.max(8, window.innerHeight - height - 8);
  const corners = [
    { x: 8, y: 8 },
    { x: right, y: 8 },
    { x: 8, y: bottom },
    { x: right, y: bottom },
  ];
  return corners.reduce((nearest, corner) => {
    const distance = (corner.x - x) ** 2 + (corner.y - y) ** 2;
    const nearestDistance = (nearest.x - x) ** 2 + (nearest.y - y) ** 2;
    return distance < nearestDistance ? corner : nearest;
  });
}

type DragOrigin = { pointerId: number; pointerX: number; pointerY: number; left: number; top: number };

export function FloatingYoutubePlayer() {
  const videoId = parseVideoId(floatingYoutubeUrl);
  const portrait = /youtube\.com\/shorts\//i.test(floatingYoutubeUrl);
  const panelRef = useRef<HTMLElement>(null);
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const dragRef = useRef<DragOrigin | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (floatingYoutubeUrl.trim() && !videoId) {
      console.error("Configure a valid YouTube URL or 11-character video ID in content/homepage.ts.");
    }
  }, [videoId]);

  useEffect(() => {
    if (!videoId || !open) return;
    let cancelled = false;
    let player: YouTubePlayer | null = null;
    setPlayerError(null);

    loadYouTubeApi()
      .then((api) => {
        const host = playerHostRef.current;
        if (cancelled || !host) return;

        player = new api.Player(host, {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            enablejsapi: 1,
            fs: 0,
            loop: 1,
            modestbranding: 1,
            mute: 1,
            origin: window.location.origin,
            playsinline: 1,
            playlist: videoId,
            rel: 0,
          },
          events: {
            onReady: ({ target }) => {
              target.mute();
              target.playVideo();
            },
            onError: ({ data }) => {
              setPlayerError("This YouTube video could not be played here.");
              console.error(`The configured YouTube video returned player error ${data}.`);
            },
          },
        });
        playerRef.current = player;
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPlayerError("YouTube could not be loaded. Check your connection and try again.");
        console.error("The floating YouTube player failed to initialize.", error);
      });

    return () => {
      cancelled = true;
      player?.destroy();
      if (playerRef.current === player) playerRef.current = null;
    };
  }, [videoId, open]);

  useEffect(() => {
    const resize = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const { width, height } = panel.getBoundingClientRect();
      setPosition((current) => (current ? constrainPosition(current.x, current.y, width, height) : current));
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!position) return;
    const panel = panelRef.current;
    if (!panel) return;
    const { width, height } = panel.getBoundingClientRect();
    const next = constrainPosition(position.x, position.y, width, height);
    if (next.x !== position.x || next.y !== position.y) setPosition(next);
  }, [position]);

  if (!floatingYoutubeUrl.trim() || !videoId || !open) return null;

  const panelStyle: CSSProperties | undefined = position
    ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
    : undefined;

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = { pointerId: event.pointerId, pointerX: event.clientX, pointerY: event.clientY, left: rect.left, top: rect.top };
    event.currentTarget.setPointerCapture(event.pointerId);
    setPosition(constrainPosition(rect.left, rect.top, rect.width, rect.height));
    setDragging(true);
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !panel) return;
    const rect = panel.getBoundingClientRect();
    setPosition(constrainPosition(drag.left + event.clientX - drag.pointerX, drag.top + event.clientY - drag.pointerY, rect.width, rect.height));
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (drag && drag.pointerId === event.pointerId && panel) {
      const { width, height } = panel.getBoundingClientRect();
      const position = constrainPosition(drag.left + event.clientX - drag.pointerX, drag.top + event.clientY - drag.pointerY, width, height);
      setPosition(nearestCorner(position.x, position.y, width, height));
    }
    dragRef.current = null;
    setDragging(false);
  };

  const stopDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const deltas: Record<string, [number, number]> = {
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
    };
    const delta = deltas[event.key];
    const rect = panelRef.current?.getBoundingClientRect();
    if (!delta || !rect) return;
    event.preventDefault();
    const step = event.shiftKey ? 48 : 16;
    setPosition(constrainPosition(rect.left + delta[0] * step, rect.top + delta[1] * step, rect.width, rect.height));
  };

  return (
    <aside ref={panelRef} className={`floating-video ${dragging ? "is-dragging" : ""}`} data-portrait={portrait || undefined} style={panelStyle} aria-label="Floating video player">
      <button
        type="button"
        className="floating-video-close"
        onClick={() => setOpen(false)}
        aria-label="Close floating video player"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 2l12 12M14 2L2 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div
        className="floating-video-media"
        role="group"
        tabIndex={0}
        aria-label="Autoplaying looping video. Drag to move, or use arrow keys to reposition."
        aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
        onKeyDown={moveWithKeyboard}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={stopDrag}
        onLostPointerCapture={stopDrag}
      >
        <div ref={playerHostRef} className="floating-video-host" />
        {playerError && <p className="floating-video-error" role="alert">{playerError}</p>}
      </div>
    </aside>
  );
}
