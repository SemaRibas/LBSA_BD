"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";

export interface ImageItem {
  image?: { src?: string; alt?: string } | string;
  focusY?: number;
}

export interface TiltOptions {
  effect: "attract" | "repel";
  tiltLimit: number;
  scale: number;
}

export interface ImageFlipProps {
  images?: ImageItem[];
  fit?: "cover" | "contain";
  rounded?: number;
  tilt?: boolean;
  tiltOptions?: TiltOptions;
  style?: CSSProperties;
  className?: string;
  onFlip?: (index: number) => void;
}

const DEFAULTS = {
  fit: "cover" as const,
  focusY: 50,
  rounded: 13,
  tilt: true,
  tiltOptions: {
    effect: "repel" as const,
    tiltLimit: 15,
    scale: 119,
  },
};

const HALF_TURN = 180;
const PERSPECTIVE = 900;

const srcOf = (image: any): string =>
  typeof image === "string" ? image : (image?.src ?? "");

const focusOf = (item: ImageItem | undefined) =>
  Math.min(
    100,
    Math.max(
      0,
      typeof item?.focusY === "number" ? item.focusY : DEFAULTS.focusY
    )
  );

export function ImageFlip(props: ImageFlipProps) {
  const {
    images,
    fit = DEFAULTS.fit,
    rounded = DEFAULTS.rounded,
    tilt = DEFAULTS.tilt,
    tiltOptions = DEFAULTS.tiltOptions,
    style,
    className,
    onFlip,
  } = props;

  const items = useMemo(() => {
    const list = (images ?? []).filter((item) => srcOf(item?.image));
    return list;
  }, [images]);

  const urls = useMemo(() => items.map((item) => srcOf(item.image)), [items]);

  const tiltRef = useRef<HTMLDivElement | null>(null);

  const effect = tiltOptions?.effect ?? DEFAULTS.tiltOptions.effect;
  const tiltLimit = tiltOptions?.tiltLimit ?? DEFAULTS.tiltOptions.tiltLimit;
  const scale = (tiltOptions?.scale ?? DEFAULTS.tiltOptions.scale) / 100;

  const [angle, setAngle] = useState(0);
  const [index, setIndex] = useState(0);
  const [faces, setFaces] = useState({ a: 0, b: 0 });

  const facing = (deg: number) =>
    Math.abs(Math.round(deg / HALF_TURN)) % 2 === 0 ? "a" : "b";

  const flip = (dir: 1 | -1) => {
    const n = urls.length;
    if (n < 2) return;

    const next = (index + dir + n) % n;
    const nextAngle = angle + dir * HALF_TURN;
    const incoming = facing(nextAngle);
    setFaces((f) => ({ ...f, [incoming]: next }));
    setIndex(next);
    setAngle(nextAngle);
    if (onFlip) onFlip(next);
  };

  const focusKey = JSON.stringify(items.map(focusOf));
  const lastFocusRef = useRef<number[] | null>(null);

  useEffect(() => {
    const next: number[] = JSON.parse(focusKey);
    const last = lastFocusRef.current;
    lastFocusRef.current = next;
    if (!last) return;
    const moved = next.findIndex((f, i) => i < last.length && last[i] !== f);
    if (moved < 0) return;
    setFaces((f) => ({ ...f, [facing(angle)]: moved }));
    setIndex(moved);
  }, [focusKey, angle]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (urls.length > 1) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const isLeft = e.clientX - rect.left < rect.width / 2;
      flip(isLeft ? -1 : 1);
    }
  };

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!tilt || !el) return;
    const { width, height, top, left } = el.getBoundingClientRect();
    const mult = effect === "repel" ? -1 : 1;
    const tiltX =
      ((e.clientY - top) / height - 0.5) * (tiltLimit * 2) * mult;
    const tiltY =
      ((e.clientX - left) / width - 0.5) * -(tiltLimit * 2) * mult;
    el.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  const faceStyle = (slot: number): CSSProperties => ({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: fit,
    objectPosition:
      fit === "cover"
        ? `center ${focusOf(items[slot % items.length])}%`
        : "center",
    borderRadius: `${rounded}px`,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    userSelect: "none",
    pointerEvents: "none",
  });

  return (
    <div
      className={className}
      style={{
        ...style,
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: `${PERSPECTIVE}px`,
        cursor: urls.length > 1 ? "pointer" : "default",
      }}
    >
      <div
        ref={tiltRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={handleClick}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
          willChange: "transform",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg)`,
            transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {urls.length > 0 && (
            <>
              <img
                src={urls[faces.a % urls.length]}
                alt=""
                draggable={false}
                style={faceStyle(faces.a)}
              />
              {urls.length > 1 && (
                <img
                  src={urls[faces.b % urls.length]}
                  alt=""
                  draggable={false}
                  style={{
                    ...faceStyle(faces.b),
                    transform: "rotateY(180deg)",
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageFlip;
