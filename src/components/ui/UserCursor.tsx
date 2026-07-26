"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    animate,
    type SpringOptions,
} from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export interface UserCursorProps {
    name?: string;
    color?: string;
    textColor?: string;
    size?: number;
    labelTiltStrength?: number;
    showLabel?: boolean;
    offsetX?: number;
    offsetY?: number;
    labelOffsetX?: number;
    labelOffsetY?: number;
    pressScale?: number;
    fullScreen?: boolean;
}

export default function UserCursor(props: UserCursorProps) {
    const { user } = useAuth();
    const userName = props.name || user?.name || "Pesquisador LBSA";

    const {
        color = "#0d9488",
        textColor = "#ffffff",
        size = 28,
        labelTiltStrength = 22,
        showLabel = true,
        offsetX = 0,
        offsetY = 0,
        labelOffsetX = 22,
        labelOffsetY = 10,
        pressScale = 0.9,
        fullScreen = true,
    } = props;

    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [isPointerState, setIsPointerState] = useState(false);

    // Touch device detection
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mql = window.matchMedia("(pointer: coarse)");
        const sync = () => setIsTouchDevice(!!mql.matches);
        sync();
        if (mql.addEventListener) {
            mql.addEventListener("change", sync);
            return () => mql.removeEventListener("change", sync);
        }
    }, []);

    // Hide native cursor globally when fullScreen is active
    useEffect(() => {
        if (isTouchDevice || typeof document === "undefined") return;
        document.body.classList.add("custom-cursor-active");
        return () => {
            document.body.classList.remove("custom-cursor-active");
        };
    }, [isTouchDevice]);

    // Motion values & springs
    const mouseX = useMotionValue(-9999);
    const mouseY = useMotionValue(-9999);

    const arrowSpringCfg: SpringOptions = useMemo(
        () => ({ stiffness: 420, damping: 32, mass: 0.5 }),
        []
    );
    const labelSpringCfg: SpringOptions = useMemo(
        () => ({ stiffness: 240, damping: 26, mass: 0.6 }),
        []
    );

    const arrowX = useSpring(mouseX, arrowSpringCfg);
    const arrowY = useSpring(mouseY, arrowSpringCfg);
    const labelX = useSpring(mouseX, labelSpringCfg);
    const labelY = useSpring(mouseY, labelSpringCfg);

    const scaleMV = useMotionValue(1);
    useEffect(() => {
        const controls = animate(scaleMV, pressed ? pressScale : isPointerState ? 1.15 : 1, {
            type: "spring",
            stiffness: 500,
            damping: 28,
            mass: 0.5,
        });
        return () => controls.stop();
    }, [pressed, isPointerState, pressScale, scaleMV]);

    const labelTiltTarget = useMotionValue(0);
    const labelRotation = useSpring(labelTiltTarget, {
        stiffness: 200,
        damping: 24,
        mass: 0.6,
    });

    const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(null);

    // Mouse tracking & hand pointer ("mãozinha") detection
    useEffect(() => {
        if (isTouchDevice || typeof window === "undefined") return;

        const onMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;

            const now = performance.now();
            const last = lastSampleRef.current;
            let vx = 0;
            let vy = 0;
            if (last) {
                const dt = Math.max(1, now - last.t);
                vx = ((x - last.x) / dt) * 1000;
                vy = ((y - last.y) / dt) * 1000;
            }
            lastSampleRef.current = { x, y, t: now };

            mouseX.set(x + offsetX);
            mouseY.set(y + offsetY);

            const speed = Math.hypot(vx, vy);
            const norm = Math.min(1, speed / 1500);
            const sign = vx === 0 ? 0 : vx > 0 ? 1 : -1;
            labelTiltTarget.set(sign * norm * labelTiltStrength);

            setHovering(true);

            // Detect if element under cursor is clickable / hand pointer ("mãozinha")
            const target = e.target as HTMLElement | null;
            if (target) {
                const isClickable =
                    target.closest(
                        "a, button, input, select, textarea, [role='button'], [tabindex], label, .cursor-pointer"
                    ) !== null ||
                    window.getComputedStyle(target).cursor === "pointer";
                setIsPointerState(isClickable);
            }
        };

        const onDown = () => setPressed(true);
        const onUp = () => setPressed(false);

        const onLeave = () => {
            setHovering(false);
            lastSampleRef.current = null;
            labelTiltTarget.set(0);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);
        document.body.addEventListener("mouseleave", onLeave);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
            document.body.removeEventListener("mouseleave", onLeave);
            setPressed(false);
        };
    }, [isTouchDevice, offsetX, offsetY, mouseX, mouseY, labelTiltTarget, labelTiltStrength]);

    const labelTranslateX = useTransform(labelX, (v) => v + labelOffsetX);
    const labelTranslateY = useTransform(labelY, (v) => v + labelOffsetY);

    if (isTouchDevice) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 9999,
                overflow: "hidden",
            }}
        >
            {/* Label pill showing user name */}
            {showLabel && (
                <motion.div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        x: labelTranslateX,
                        y: labelTranslateY,
                        rotate: labelRotation,
                        scale: scaleMV,
                        background: isPointerState ? "#14b8a6" : color,
                        borderRadius: 999,
                        padding: `${size * 0.18}px ${size * 0.38}px`,
                        boxShadow: isPointerState
                            ? "0 4px 20px rgba(20, 184, 166, 0.6), 0 2px 6px rgba(0, 0, 0, 0.2)"
                            : "0 4px 12px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15)",
                        opacity: hovering ? 1 : 0,
                        transformOrigin: "0% 50%",
                        transition: "opacity 140ms ease, background 200ms ease",
                        willChange: "transform, opacity",
                        userSelect: "none",
                        pointerEvents: "none",
                    }}
                >
                    <div
                        style={{
                            color: textColor,
                            fontSize: Math.max(10, size * 0.44),
                            lineHeight: 1.1,
                            fontWeight: 700,
                            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                            whiteSpace: "nowrap",
                            letterSpacing: 0.2,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                        }}
                    >
                        <span>{userName}</span>
                    </div>
                </motion.div>
            )}

            {/* Cursor arrow / Hand pointer icon ("mãozinha") */}
            <motion.div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    x: arrowX,
                    y: arrowY,
                    scale: scaleMV,
                    width: size,
                    height: size,
                    opacity: hovering ? 1 : 0,
                    transformOrigin: "0% 0%",
                    transition: "opacity 140ms ease",
                    willChange: "transform, opacity",
                    pointerEvents: "none",
                }}
            >
                {isPointerState ? (
                    /* Mãozinha (Hand Pointer) icon when hovering interactive elements */
                    <svg
                        width={size * 1.1}
                        height={size * 1.1}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: "block", overflow: "visible" }}
                    >
                        <path
                            d="M10 11V4.5C10 3.67 9.33 3 8.5 3C7.67 3 7 3.67 7 4.5V12.5M10 11V6.5C10 5.67 10.67 5 11.5 5C12.33 5 13 5.67 13 6.5V11M13 11V8.5C13 7.67 13.67 7 14.5 7C15.33 7 16 7.67 16 8.5V12M16 12V10.5C16 9.67 16.67 9 17.5 9C18.33 9 19 9.67 19 10.5V16C19 19.31 16.31 22 13 22H11C8.35 22 6.07 20.28 5.34 17.73L3.65 11.83C3.41 10.98 4.05 10.15 4.93 10.15C5.54 10.15 6.08 10.54 6.27 11.12L7 13.3"
                            fill="#14b8a6"
                            stroke="#ffffff"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : (
                    /* Standard Arrow cursor pointing up-left */
                    <svg
                        width={size}
                        height={size}
                        viewBox="0 0 28 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: "block", overflow: "visible" }}
                    >
                        <path
                            d="M5 3 L23 14 L14 16 L11 24 Z"
                            fill={color}
                            stroke="#ffffff"
                            strokeWidth={1.2}
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </motion.div>
        </div>
    );
}
