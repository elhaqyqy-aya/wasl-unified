import { useEffect, useRef, useState } from "react";

let SHOWN_THIS_SESSION = false;

export function SplashScreen() {
  const [show, setShow] = useState(() => !SHOWN_THIS_SESSION);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!show) return;
    SHOWN_THIS_SESSION = true;
    // Safety fallback in case onEnded never fires
    const t = setTimeout(() => finish(), 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFading(true);
    setTimeout(() => setShow(false), 450);
  };

  const srcUrl = "/dreamina.mp4";

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#efefef",
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transition: "opacity 450ms ease",
      }}
    >
      <video
        ref={videoRef}
        src={srcUrl}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={() => {
          const el = videoRef.current;
          if (el && !el.src.endsWith('/dreamina.mp4')) el.src = '/dreamina.mp4';
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
