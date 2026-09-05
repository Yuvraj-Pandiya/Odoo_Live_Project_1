import { useEffect, useRef } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4';

const SENSITIVITY = 0.8;

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const seekToTarget = () => {
      if (!video.duration) return;
      const clamped = Math.max(0, Math.min(targetTimeRef.current, video.duration));
      video.currentTime = clamped;
    };

    const onSeeked = () => {
      seekingRef.current = false;
      const current = video.currentTime;
      const target = Math.max(0, Math.min(targetTimeRef.current, video.duration));
      // If target has moved since last seek, queue another
      if (Math.abs(current - target) > 0.01) {
        seekingRef.current = true;
        video.currentTime = target;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      if (!video.duration) return;

      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(
        0,
        Math.min(targetTimeRef.current + offset, video.duration)
      );

      if (!seekingRef.current) {
        seekingRef.current = true;
        seekToTarget();
      }
    };

    video.addEventListener('seeked', onSeeked);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={VIDEO_URL}
      muted
      playsInline
      preload="auto"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: '70% center',
      }}
    />
  );
}
