"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    useEffect,
    useRef,
    useState,
    useCallback,
    type CSSProperties,
    ReactNode,
} from "react";

export type ImageValue = string | { src?: string; srcSet?: string; alt?: string };

export interface CarouselItem {
    buttonImage?: ImageValue;
    image?: ImageValue;
    label?: string;
    sublabel?: string;
    role?: string;
    badge?: string;
    badgeColor?: string;
    badgeBg?: string;
    id?: string;
    data?: any;
    customContent?: ReactNode;
}

export interface FontValue {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSize?: number | string;
    fontStyle?: string;
    letterSpacing?: number | string;
    lineHeight?: number | string;
}

export const srcOf = (v?: ImageValue): string =>
    typeof v === "string" ? v : v?.src || "";

export interface KlarnaCarouselProps {
    items?: CarouselItem[];
    cardRadius?: number;
    imageWidth?: number;
    imageHeight?: number;
    buttonCount?: number;
    buttonSize?: number;
    buttonRadius?: number;
    curve?: number;
    gap?: number;
    labelShow?: boolean;
    labelX?: number;
    labelY?: number;
    labelColor?: string;
    labelFont?: FontValue;
    backgroundColor?: string;
    style?: CSSProperties;
    onSelectActive?: (index: number, item: CarouselItem) => void;
}

const mkItem = ([src, label]: [string, string]): CarouselItem => ({
    image: { src },
    buttonImage: { src },
    label,
});

const DEFAULT_ITEMS: CarouselItem[] = (
    [
        [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
            "Sophia Benett",
        ],
        [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            "Isabella Foster",
        ],
        [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
            "Grace Turner",
        ],
        [
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
            "Olivia Parker",
        ],
        [
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
            "Lucas Turner",
        ],
        [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
            "Emma Collins",
        ],
        [
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
            "Mia Carter",
        ],
        [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
            "Ella Morgan",
        ],
    ] as [string, string][]
).map(mkItem);

function modIdx(i: number, n: number) {
    return ((i % n) + n) % n;
}

function easeCubicInOut(p: number) {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

export default function KlarnaCarousel(props: KlarnaCarouselProps) {
    const {
        items = DEFAULT_ITEMS,
        cardRadius = 20,
        imageWidth = 300,
        imageHeight = 300,
        buttonCount = 7,
        buttonSize = 44,
        buttonRadius = 20,
        curve = 5,
        gap = 24,
        labelShow = true,
        labelX = 0,
        labelY = 0,
        labelColor = "#ffffff",
        labelFont = {
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 22,
            lineHeight: "1.3em",
            letterSpacing: "0em",
        },
        backgroundColor = "transparent",
        onSelectActive,
    } = props;

    const list = items?.length ? items : DEFAULT_ITEMS;
    const M = list.length;

    const posRef = useRef(0);
    const [posDisplay, setPosDisplay] = useState(0);
    const rafRef = useRef<number | null>(null);
    const animRef = useRef({ startPos: 0, targetPos: 0, startTime: 0 });
    const [dir, setDir] = useState(1);

    const active = modIdx(Math.round(posDisplay), M);

    const half = Math.floor(Math.min(Math.max(1, buttonCount), M) / 2);
    const buffer = half + 1;

    const cardRadiusPx =
        (Math.max(0, Math.min(20, cardRadius)) / 20) *
        (Math.min(imageWidth, imageHeight) / 2);
    const buttonRadiusPx =
        (Math.max(0, Math.min(20, buttonRadius)) / 20) * (buttonSize / 2);
    const t = Math.max(0.0001, Math.min(10, curve) / 10);
    const step = buttonSize + gap;
    const dPsi = ((Math.PI * 2) / M) * t;
    const R = step / (2 * Math.sin(dPsi / 2));
    const baseTop = buttonSize * 0.9;
    const fadeInner = Math.max(0, half - 0.4);
    const fadeEnd = half + 0.6;
    const maxPsi = Math.min(Math.PI, fadeEnd * dPsi);
    const stripHeight =
        baseTop + R * (1 - Math.cos(maxPsi)) + buttonSize / 2 + 16;

    const select = useCallback(
        (itemIdx: number) => {
            const currentActive = modIdx(Math.round(posRef.current), M);
            if (itemIdx === currentActive) return;

            let delta = itemIdx - Math.round(posRef.current);
            delta = ((delta % M) + M) % M;
            if (delta > M / 2) delta -= M;
            setDir(Math.sign(delta));

            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            animRef.current = {
                startPos: posRef.current,
                targetPos: posRef.current + delta,
                startTime: performance.now(),
            };

            const DURATION = 320;
            function tick(now: number) {
                const { startPos, targetPos, startTime } = animRef.current;
                const progress = Math.min(1, (now - startTime) / DURATION);
                posRef.current =
                    startPos + (targetPos - startPos) * easeCubicInOut(progress);
                setPosDisplay(posRef.current);
                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(tick);
                } else {
                    posRef.current = targetPos;
                    setPosDisplay(targetPos);
                    rafRef.current = null;
                }
            }
            rafRef.current = requestAnimationFrame(tick);

            if (onSelectActive) {
                const targetIdx = modIdx(itemIdx, M);
                onSelectActive(targetIdx, list[targetIdx]);
            }
        },
        [M, list, onSelectActive]
    );

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const center = Math.round(posDisplay);
    const renderItems: number[] = [];
    const seen = new Set<number>();
    for (let s = -buffer; s <= buffer; s++) {
        const idx = modIdx(center + s, M);
        if (!seen.has(idx)) {
            seen.add(idx);
            renderItems.push(idx);
        }
    }

    function getVisualSlot(itemIdx: number): number {
        let slot = itemIdx - posDisplay;
        slot = slot % M;
        if (slot > M / 2) slot -= M;
        if (slot < -M / 2) slot += M;
        return slot;
    }

    function slotStyle(slot: number) {
        const angle = slot * dPsi;
        const x = R * Math.sin(angle);
        const y = R * (1 - Math.cos(angle));
        const deg = (angle * 180) / Math.PI;
        const absSlot = Math.abs(slot);
        const depth = Math.max(0, 1 - (0.55 * absSlot) / Math.max(1, half));
        const scale = 0.55 + 0.45 * depth;
        const opacity =
            absSlot <= fadeInner
                ? 1
                : absSlot >= fadeEnd
                  ? 0
                  : 1 - (absSlot - fadeInner) / (fadeEnd - fadeInner);
        const zIndex = Math.round(depth * 100) + (absSlot < 0.5 ? 100 : 0);
        return { x, y, deg, scale, opacity, zIndex };
    }

    const imgSweep = 260,
        imgDip = 150;
    const imageVariants = {
        enter: (d: number) => ({
            x: d * imgSweep,
            y: imgDip,
            opacity: 0,
            scale: 0.82,
            rotate: d * 8,
        }),
        center: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
        exit: (d: number) => ({
            x: -d * imgSweep,
            y: imgDip,
            opacity: 0,
            scale: 0.82,
            rotate: -d * 8,
        }),
    };

    const currentItem = list[active];

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                overflow: "hidden",
                boxSizing: "border-box",
                background: backgroundColor,
                ...props.style,
            }}
        >
            {/* Main Card Viewport */}
            <div
                style={{
                    position: "relative",
                    width: imageWidth,
                    height: imageHeight,
                    maxWidth: "92vw",
                    flex: "0 0 auto",
                    borderRadius: cardRadiusPx,
                    overflow: "hidden",
                    background: backgroundColor,
                    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
                }}
            >
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                    <motion.div
                        key={active}
                        custom={dir}
                        variants={imageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: backgroundColor,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {currentItem?.customContent ? (
                            currentItem.customContent
                        ) : srcOf(currentItem?.image) ? (
                            <img
                                src={srcOf(currentItem?.image)}
                                alt={currentItem?.label || ""}
                                draggable={false}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-surface-900 text-white p-6 text-center">
                                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black mb-3 border border-white/20">
                                    {currentItem?.label ? currentItem.label.slice(0, 2).toUpperCase() : "LBSA"}
                                </div>
                                <div className="font-bold text-lg">{currentItem?.label}</div>
                                {currentItem?.sublabel && (
                                    <div className="text-xs text-teal-200 mt-1">{currentItem.sublabel}</div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Label and Badge Overlay */}
            {labelShow && (
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={`label-${active}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            flex: "0 0 auto",
                            maxWidth: "100%",
                            textAlign: "center",
                            color: labelColor,
                            transform: `translate(${labelX}px, ${labelY}px)`,
                            fontFamily: labelFont?.fontFamily,
                            fontWeight: labelFont?.fontWeight as any,
                            fontSize: labelFont?.fontSize,
                            fontStyle: labelFont?.fontStyle,
                            letterSpacing: labelFont?.letterSpacing,
                            lineHeight: labelFont?.lineHeight,
                        }}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="drop-shadow-md">{currentItem?.label ?? ""}</span>
                            {currentItem?.badge && (
                                <span
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm border border-white/20"
                                    style={{
                                        backgroundColor: currentItem.badgeBg || "rgba(20, 184, 166, 0.2)",
                                        color: currentItem.badgeColor || "#2dd4bf",
                                    }}
                                >
                                    {currentItem.badge}
                                </span>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Arc Button Strip */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: stripHeight,
                    overflow: "hidden",
                    flex: "0 0 auto",
                }}
            >
                {renderItems.map((itemIdx) => {
                    const slot = getVisualSlot(itemIdx);
                    const { x, y, deg, scale, opacity, zIndex } =
                        slotStyle(slot);
                    const isActive = itemIdx === active;
                    const item = list[itemIdx];

                    return (
                        <div
                            key={itemIdx}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: baseTop,
                                marginLeft: -buttonSize / 2,
                                marginTop: -buttonSize / 2,
                                width: buttonSize,
                                height: buttonSize,
                                transform: `translate(${x}px, ${y}px) rotate(${deg}deg) scale(${scale})`,
                                transformOrigin: "center",
                                opacity,
                                zIndex,
                                willChange: "transform, opacity",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: buttonRadiusPx,
                                    overflow: "hidden",
                                    position: "relative",
                                    transform: `rotate(${-deg}deg)`,
                                    transformOrigin: "center",
                                    background: isActive
                                        ? "#ffffff"
                                        : "rgba(255,255,255,0.25)",
                                    boxShadow: isActive
                                        ? "0 0 16px rgba(45, 212, 191, 0.8), 0 0 0 2px #2dd4bf"
                                        : "0 4px 10px rgba(0, 0, 0, 0.3)",
                                    backdropFilter: isActive
                                        ? undefined
                                        : "blur(6px)",
                                    WebkitBackdropFilter: isActive
                                        ? undefined
                                        : "blur(6px)",
                                    cursor: "pointer",
                                    WebkitTapHighlightColor: "transparent",
                                    transition: "box-shadow 0.2s ease, background 0.2s ease",
                                }}
                                onClick={() => select(itemIdx)}
                            >
                                {srcOf(item?.buttonImage) ? (
                                    <img
                                        src={srcOf(item?.buttonImage)}
                                        alt={item?.label || ""}
                                        draggable={false}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-xs text-surface-900 bg-gradient-to-br from-teal-400 to-emerald-600 text-white">
                                        {item?.label ? item.label.slice(0, 2).toUpperCase() : "U"}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
