"use client"

import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    type CSSProperties,
} from "react"

const useIsStaticRenderer = () => false

export interface Slide {
    id?: string
    image?: { src?: string; srcSet?: string; alt?: string }
    title?: string
    subtitle?: string
    badge?: string
    itemData?: any
}

type AutoplayDir = "leftToRight" | "rightToLeft"
type TitleCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight"

export interface Smooth3DSlideshowProps {
    slides?: Slide[]
    cardWidth?: number
    cardHeight?: number
    radius?: number
    tilt?: number
    sideTilt?: number
    gap?: number
    opacity?: number
    transition?: any
    autoplay?: boolean
    autoplayDirection?: AutoplayDir
    showTitle?: boolean
    titleFont?: CSSProperties
    titleColor?: string
    titlePosition?: {
        position?: TitleCorner
        paddingLeft?: number
        paddingRight?: number
        paddingTop?: number
        paddingBottom?: number
    }
    style?: CSSProperties
    onSlideChange?: (index: number, slide: Slide) => void
    onSlideSelect?: (slide: Slide) => void
}

const DEFAULT_SLIDES: Slide[] = [
    {
        image: {
            src: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=800&auto=format&fit=crop",
        },
        title: "LBSA00001\nHemiptera\nInsecta",
    },
    {
        image: {
            src: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop",
        },
        title: "LBSA00002\nDermaptera\nInsecta",
    },
    {
        image: {
            src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
        },
        title: "LBSA00005\nIsopoda\nMalacostraca",
    },
]

const COMPONENT_DEFAULTS = {
    cardWidth: 420,
    cardHeight: 400,
    radius: 6,
    tilt: 12,
    sideTilt: 8,
    gap: 8,
    opacity: 60,
    autoplay: false,
    autoplayDirection: "rightToLeft" as AutoplayDir,
    transition: {
        type: "tween",
        duration: 0.6,
        delay: 2.5,
        ease: [0.22, 1, 0.36, 1],
    },
    showTitle: true,
    titleFont: {
        fontFamily: "Inter, sans-serif",
        fontSize: "24px",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: "1.2em",
    } as CSSProperties,
    titleColor: "#ffffff",
    titlePosition: {
        position: "bottomLeft" as TitleCorner,
        paddingLeft: 22,
        paddingRight: 22,
        paddingTop: 24,
        paddingBottom: 24,
    },
}

const PERSPECTIVE = 1600
const SCALE_STEP = 0.16
const MAX_VISIBLE = 2
const DEPTH = 240

function cssTransition(t: any): { dur: number; ease: string } {
    const dur = t && typeof t.duration === "number" ? t.duration : 0.6
    let ease = "cubic-bezier(0.22, 1, 0.36, 1)"
    const e = t?.ease
    if (Array.isArray(e) && e.length === 4) {
        ease = `cubic-bezier(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]})`
    } else if (typeof e === "string") {
        const map: Record<string, string> = {
            linear: "linear",
            easeIn: "ease-in",
            easeOut: "ease-out",
            easeInOut: "ease-in-out",
        }
        ease = map[e] || "ease"
    }
    return { dur, ease }
}

export default function Smooth3DSlideshow(userProps: Smooth3DSlideshowProps) {
    const props = {
        ...COMPONENT_DEFAULTS,
        ...userProps,
        titlePosition: {
            ...COMPONENT_DEFAULTS.titlePosition,
            ...userProps.titlePosition,
        },
    }

    const {
        slides = DEFAULT_SLIDES,
        cardWidth = 420,
        cardHeight = 400,
        radius = 6,
        tilt = 12,
        sideTilt = 8,
        gap = 8,
        opacity = 60,
        transition,
        autoplay = false,
        autoplayDirection = "rightToLeft",
        showTitle = true,
        titleFont,
        titleColor = "#ffffff",
        titlePosition,
        style,
        onSlideChange,
        onSlideSelect,
    } = props

    const tp = titlePosition || {}
    const corner: TitleCorner = tp.position || "bottomLeft"
    const isTop = corner === "topLeft" || corner === "topRight"
    const isRight = corner === "topRight" || corner === "bottomRight"
    const padLeft = tp.paddingLeft ?? 22
    const padRight = tp.paddingRight ?? 22
    const padTop = tp.paddingTop ?? 24
    const padBottom = tp.paddingBottom ?? 24

    const isStatic = useIsStaticRenderer()
    const list = slides && slides.length ? slides : DEFAULT_SLIDES
    const n = list.length

    const loop = true
    const [active, setActive] = useState(0)
    const [winWidth, setWinWidth] = useState(1200);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const updateWidth = () => setWinWidth(window.innerWidth);
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const effectiveCardWidth = useMemo(() => {
        if (winWidth <= 380) return Math.min(cardWidth, Math.max(180, winWidth - 110));
        if (winWidth <= 480) return Math.min(cardWidth, Math.max(210, winWidth - 120));
        if (winWidth <= 768) return Math.min(cardWidth, Math.max(250, winWidth - 140));
        return cardWidth;
    }, [winWidth, cardWidth]);

    const effectiveCardHeight = useMemo(() => {
        if (winWidth <= 480) return Math.min(cardHeight, Math.round(effectiveCardWidth * 0.85));
        if (winWidth <= 768) return Math.min(cardHeight, Math.round(effectiveCardWidth * 0.9));
        return cardHeight;
    }, [winWidth, cardHeight, effectiveCardWidth]);

    const effectiveGap = useMemo(() => {
        if (winWidth <= 480) return 3.5;
        if (winWidth <= 768) return 5.5;
        return gap;
    }, [winWidth, gap]);

    // Mobile touch swipe gestures
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 35) {
            if (diff > 0) {
                step(1); // Swipe left -> next
            } else {
                step(-1); // Swipe right -> prev
            }
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    useEffect(() => {
        setActive((a) => Math.max(0, Math.min(n - 1, a)))
    }, [n])

    const moveDur =
        transition && typeof transition.duration === "number"
            ? transition.duration
            : 0.6
    const lockRef = useRef(false)
    const lock = useCallback(() => {
        lockRef.current = true
        window.setTimeout(
            () => {
                lockRef.current = false
            },
            Math.max(50, moveDur * 1000)
        )
    }, [moveDur])

    const changeActiveIndex = useCallback(
        (nextIdx: number) => {
            const validIdx = (((nextIdx % n) + n) % n)
            setActive(validIdx)
            if (onSlideChange && list[validIdx]) {
                onSlideChange(validIdx, list[validIdx])
            }
        },
        [n, list, onSlideChange]
    )

    const step = useCallback(
        (dir: number) => {
            if (lockRef.current) return
            lock()
            changeActiveIndex(active + dir)
        },
        [active, lock, changeActiveIndex]
    )

    const handleCardClick = useCallback(
        (i: number) => {
            if (isStatic || lockRef.current) return
            lock()
            if (i === active) {
                if (onSlideSelect) onSlideSelect(list[i])
            } else {
                changeActiveIndex(i)
            }
        },
        [isStatic, active, list, lock, changeActiveIndex, onSlideSelect]
    )

    const delay =
        transition && typeof transition.delay === "number"
            ? transition.delay
            : 2.5

    useEffect(() => {
        if (isStatic || !autoplay || n < 2) return
        const ms = Math.max(0.3, delay) * 1000
        const dir = autoplayDirection === "leftToRight" ? -1 : 1
        const id = window.setInterval(() => step(dir), ms)
        return () => window.clearInterval(id)
    }, [isStatic, autoplay, autoplayDirection, delay, n, step])

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                e.preventDefault()
                step(1)
            } else if (e.key === "ArrowLeft") {
                e.preventDefault()
                step(-1)
            }
        },
        [step]
    )

    const { dur, ease } = cssTransition(transition)
    const transitionCss = `transform ${dur}s ${ease}, opacity ${dur}s ${ease}`

    const effectiveRadius =
        (Math.max(0, Math.min(20, radius)) / 20) *
        (Math.min(effectiveCardWidth, effectiveCardHeight) / 2)
    const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100

    const rootStyle: CSSProperties = {
        ...(style || {}),
        position: "relative",
        width: "100%",
        height: effectiveCardHeight + (winWidth <= 480 ? 35 : 60),
        minWidth: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: `${PERSPECTIVE}px`,
        overflow: "hidden",
        outline: "none",
        userSelect: "none",
    }

    return (
        <div
            style={rootStyle}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            onKeyDown={isStatic ? undefined : onKeyDown}
            onTouchStart={isStatic ? undefined : handleTouchStart}
            onTouchMove={isStatic ? undefined : handleTouchMove}
            onTouchEnd={isStatic ? undefined : handleTouchEnd}
            className="group relative focus:outline-none touch-pan-y"
        >
            <div
                style={{
                    position: "relative",
                    width: effectiveCardWidth,
                    height: effectiveCardHeight,
                    transformStyle: "preserve-3d",
                }}
            >
                {list.map((slide, i) => {
                    let rel = i - active
                    if (loop) {
                        if (rel > n / 2) rel -= n
                        if (rel < -n / 2) rel += n
                    }
                    const ax = Math.abs(rel)
                    const visible = ax <= MAX_VISIBLE
                    const isActive = rel === 0
                    const scaleStepMultiplier = winWidth <= 480 ? 0.18 : SCALE_STEP
                    const sc = Math.max(0.4, 1 - ax * scaleStepMultiplier)
                    const tx = rel * (effectiveGap * (winWidth <= 480 ? 15 : 18))
                    const tz = -ax * (winWidth <= 480 ? 180 : DEPTH)
                    const ry = -rel * tilt
                    const rz = rel * sideTilt
                    const src = slide.image?.src || ""

                    const cardStyle: CSSProperties = {
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: effectiveCardWidth,
                        height: effectiveCardHeight,
                        borderRadius: effectiveRadius,
                        overflow: "hidden",
                        transformStyle: "preserve-3d",
                        transformOrigin: "center center",
                        transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
                        transition: transitionCss,
                        opacity: visible ? 1 : 0,
                        cursor: isActive ? "default" : "pointer",
                        pointerEvents: visible && !isStatic ? "auto" : "none",
                        boxShadow: isActive
                            ? "0 15px 35px -10px rgba(0, 0, 0, 0.3), 0 0 15px rgba(20, 184, 166, 0.25)"
                            : "0 8px 20px -8px rgba(0, 0, 0, 0.15)",
                    }

                    return (
                        <div
                            key={slide.id || i}
                            style={cardStyle}
                            onClick={
                                isStatic ? undefined : () => handleCardClick(i)
                            }
                            aria-label={slide.title}
                            aria-hidden={!visible}
                            className="transition-shadow duration-300 hover:shadow-2xl bg-surface-100 dark:bg-surface-900 border border-surface-200 dark:border-surface-800"
                        >
                            {src ? (
                                <img
                                    src={src}
                                    alt={slide.image?.alt || slide.title || ""}
                                    draggable={false}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                        userSelect: "none",
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-surface-100 to-surface-200 dark:from-teal-900/40 dark:via-surface-900 dark:to-surface-950 flex items-center justify-center p-6 text-center text-teal-800 dark:text-teal-100">
                                    <span className="text-xl font-bold">{slide.title}</span>
                                </div>
                            )}

                            {showTitle && (
                                <>
                                    {/* Gradient overlay for text readability */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: isTop
                                                ? "linear-gradient(0deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)"
                                                : "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)",
                                            pointerEvents: "none",
                                        }}
                                    />

                                    {/* Title at chosen corner */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: winWidth <= 480 ? 12 : padLeft,
                                            right: winWidth <= 480 ? 12 : padRight,
                                            [isTop ? "top" : "bottom"]: isTop
                                                ? (winWidth <= 480 ? 12 : padTop)
                                                : (winWidth <= 480 ? 12 : padBottom),
                                            textAlign: isRight
                                                ? "right"
                                                : "left",
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {slide.badge && (
                                            <span className="inline-block px-2 py-0.5 mb-1 text-[10px] xs:text-xs font-extrabold tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/80 backdrop-blur-md rounded-full border border-teal-500/30 shadow-sm">
                                                {slide.badge}
                                            </span>
                                        )}
                                        <span
                                            style={{
                                                color: titleColor,
                                                fontSize: winWidth <= 480 ? 13 : 20,
                                                fontWeight: 700,
                                                lineHeight: "1.2em",
                                                letterSpacing: "-0.02em",
                                                whiteSpace: "pre-line",
                                                textShadow:
                                                    "0 2px 10px rgba(0,0,0,0.8)",
                                                display: "block",
                                                ...(titleFont || {}),
                                            }}
                                        >
                                            {slide.title}
                                        </span>
                                        {slide.subtitle && (
                                            <span className="mt-1 text-xs font-medium text-surface-200 dark:text-surface-300 block drop-shadow">
                                                {slide.subtitle}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Dim overlay for inactive cards */}
                            <div
                                className="absolute inset-0 bg-white/40 dark:bg-black/60 pointer-events-none transition-opacity duration-300"
                                style={{
                                    opacity: isActive ? 0 : dim,
                                    transition: `opacity ${dur}s ${ease}`,
                                }}
                            />
                        </div>
                    )
                })}
            </div>

            {/* Navigation Buttons (Left/Right) */}
            <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Anterior"
                className="absolute left-1 xs:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-white/85 dark:bg-surface-900/80 hover:bg-teal-600 dark:hover:bg-teal-600 text-surface-800 dark:text-white backdrop-blur-md flex items-center justify-center border border-surface-200 dark:border-white/10 transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
            >
                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                type="button"
                onClick={() => step(1)}
                aria-label="Próximo"
                className="absolute right-1 xs:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-white/85 dark:bg-surface-900/80 hover:bg-teal-600 dark:hover:bg-teal-600 text-surface-800 dark:text-white backdrop-blur-md flex items-center justify-center border border-surface-200 dark:border-white/10 transition-all duration-200 shadow-md hover:scale-105 active:scale-95"
            >
                <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Indicators / Counter */}
            <div className="absolute bottom-1.5 xs:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 xs:gap-1.5 px-2.5 py-1 xs:px-3 xs:py-1.5 rounded-full bg-white/85 dark:bg-surface-950/80 backdrop-blur-md border border-surface-200 dark:border-white/10 shadow-sm max-w-[85%] overflow-x-auto no-scrollbar">
                {list.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            if (!lockRef.current) {
                                lock()
                                changeActiveIndex(idx)
                            }
                        }}
                        className={`h-1.5 xs:h-2 rounded-full transition-all duration-300 shrink-0 ${
                            idx === active
                                ? "w-4 xs:w-6 bg-teal-600 dark:bg-teal-400"
                                : "w-1.5 xs:w-2 bg-surface-300 dark:bg-surface-600 hover:bg-surface-400"
                        }`}
                        aria-label={`Ir para o item ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
