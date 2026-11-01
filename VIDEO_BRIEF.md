# Video brief: hero aerial (opening shot)

The home page needs **one drone clip**. It is the first thing a visitor sees: the clip plays inside a carved stone window (a jharokha arch) and moves forward as they scroll, as if they were stepping through the window into Jaipur at dawn.

The site has placeholder footage in this slot for now, and **the site cannot go live until it is replaced.**

## The shot

| | |
|---|---|
| **Location** | Jaipur's walled city or Amer Fort |
| **Time** | First light, 05:45–06:30 |
| **Light** | Warm, low sun coming from the left of the frame |
| **Camera move** | One slow, level push forward. No turning (yaw), no orbiting, no sudden speed changes. |
| **Path** | Start low over the rooftops, then rise gently to reveal the fort or the city against the dawn sky |
| **Length** | 10–14 seconds of usable footage |
| **Resolution** | 4K (3840×2160), landscape |
| **Frame rate** | 25 or 30 fps |
| **File** | Original camera file (MP4 or MOV). Don't grade it, add text or compress it. |

## Framing: keep the subject in the centre

The same clip is cropped two ways:

- **Desktop:** the full 16:9 frame.
- **Phones:** a tall 9:16 slice cut from the **middle third** of the frame. Anything near the left or right edges won't appear on a phone.

So keep the fort or the main landmark close to the centre for the whole clip. The edges of the image also sit behind the stone arch, so the centre is where the eye goes.

**The first frame matters.** Visitors who have reduced motion turned on see only the opening frame as a still photo, so it should work as a picture by itself: no blur and no half-finished take-off.

## Don't include

- Identifiable faces
- Text, signs or logos that can be read, and watermarks
- Visible warping from the stabiliser, or rolling-shutter wobble
- Propellers or the drone's shadow in shot
- Colour grading or filters (the site applies its own warm grade when the clip is converted)

## Rights and permits

- The business must own the footage, or have a written licence to use it on its website.
- Drone flights in India need DGCA / Digital Sky permission, and many heritage sites (including Amer Fort) are restricted zones. The operator is responsible for the permits; keep a copy on file.
- Stock footage is not suitable here, because the site would be presenting it as the company's own trips.

## Delivery

Send the original file with a short note giving the location, the date, and who shot it (for the credits).

---

## For the developer: installing the clip

Requires `ffmpeg` and `ffprobe` on PATH (or the `FFMPEG` / `FFPROBE` env vars).

```bash
scripts/video-to-frames.sh <clip.mp4> hero-aerial 150
```

This writes 150 graded WebP frames to:

- `public/frames/hero-aerial/desktop/0001.webp` … (1920×1080, cover crop)
- `public/frames/hero-aerial/mobile/0001.webp` … (900×1600, centre crop)

Then in `content/day.json`, under `frameSequences["hero-aerial"]`:

1. Set `"status"` to `"ready"`. Until then, the placeholder check fails the production build.
2. Replace `"credit"` with the real credit line (location, date, who shot it).

Frame 1 is the poster (`"poster": 1`). If the clip's opening is weak, trim it before converting, or point `poster` at a better frame.
