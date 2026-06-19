"use client";

import { useState, useEffect, useRef } from "react";
import type { TargetAndTransition } from "framer-motion";
import type { GalleryImage } from "@/app/types";
import { padImages, shiftDiag, shiftRow, shiftCol } from "@/app/lib/grid";
import type { WrappingCellData } from "@/app/components/WrappingCell";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface ShiftInfo {
    type: "row" | "col" | "diag";
    index: number;
    direction:
        | "left"
        | "right"
        | "up"
        | "down"
        | "up-left"
        | "down-right"
        | "up-right"
        | "down-left";
}

export interface MorphInfo {
    type: "row" | "col" | "diag";
    index: number;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGridEngine(
    initialImages: GalleryImage[],
    paused: boolean,
    cols: number = 4,
    rows: number = 3
) {
    const [gridImages, setGridImages] = useState<GalleryImage[]>(() =>
        padImages(initialImages, 12)
    );
    const [shiftInfo, setShiftInfo] = useState<ShiftInfo | null>(null);
    const [morphInfo, setMorphInfo] = useState<MorphInfo | null>(null);
    const [shiftCount, setShiftCount] = useState(0);

    const isAnimatingRef = useRef(false);

    // Carousel Shifting Effect: swaps a random row, column, or diagonal every 4 seconds
    useEffect(() => {
        if (paused) return;

        const interval = setInterval(() => {
            if (isAnimatingRef.current) return;
            isAnimatingRef.current = true;

            // Pick shift type: 40% Row, 40% Col, 20% Diagonal
            const r = Math.random();
            const shiftType = r < 0.4 ? "row" : r < 0.8 ? "col" : "diag";

            const index =
                shiftType === "row"
                    ? Math.floor(Math.random() * rows)
                    : shiftType === "col"
                      ? Math.floor(Math.random() * cols)
                      : Math.floor(Math.random() * 2);

            const direction =
                shiftType === "row"
                    ? Math.random() > 0.5
                        ? "left"
                        : "right"
                    : shiftType === "col"
                      ? Math.random() > 0.5
                          ? "up"
                          : "down"
                      : index === 0
                        ? Math.random() > 0.5
                            ? "up-left"
                            : "down-right"
                        : Math.random() > 0.5
                          ? "up-right"
                          : "down-left";

            if (shiftType === "diag") {
                setMorphInfo({ type: "diag", index });

                setTimeout(() => {
                    setShiftInfo({ type: "diag", index, direction });

                    setTimeout(() => {
                        setGridImages((curr) => shiftDiag(curr, index, direction, cols));
                        setShiftInfo(null);

                        setTimeout(() => {
                            setMorphInfo(null);
                            setShiftCount((prev) => prev + 1);
                            isAnimatingRef.current = false;
                        }, 300);
                    }, 1200);
                }, 400);
            } else {
                setMorphInfo({ type: shiftType, index });
                setShiftInfo({ type: shiftType, index, direction });

                setTimeout(() => {
                    setGridImages((curr) =>
                        shiftType === "row"
                            ? shiftRow(curr, index, direction, cols)
                            : shiftCol(curr, index, direction, cols, rows)
                    );
                    setShiftInfo(null);
                    setMorphInfo(null);
                    setShiftCount((prev) => prev + 1);
                    isAnimatingRef.current = false;
                }, 1200);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [paused, cols, rows]);

    // ── Helper closures exposed to the renderer ─────────────────────────────

    const isCellParticipating = (col: number, row: number) => {
        if (!morphInfo) return false;
        if (morphInfo.type === "row" && row === morphInfo.index) return true;
        if (morphInfo.type === "col" && col === morphInfo.index) return true;
        if (morphInfo.type === "diag") {
            const minDim = Math.min(cols, rows);
            if (morphInfo.index === 0 && col === row && col < minDim && row < minDim) return true;
            if (morphInfo.index === 1 && col + row === minDim - 1 && col < minDim && row < minDim)
                return true;
        }
        return false;
    };

    const getCellBorderRadius = () => {
        if (!morphInfo) return "20px";
        if (morphInfo.type === "diag") return "50%";
        return "20px";
    };

    const getCellAnimation = (col: number, row: number) => {
        const base = {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            scale: morphInfo && morphInfo.type === "diag" ? 0.707 : 1,
            rotate: 0,
            rotateX: 0,
            rotateY: 0,
            z: 0,
            opacity: 1,
            filter: "none",
        };

        if (!morphInfo) return base;

        const participating = isCellParticipating(col, row);

        if (!participating) {
            return {
                ...base,
                opacity: 0.45,
                scale: morphInfo.type === "diag" ? 0.707 : 0.94,
                filter: "blur(1.5px)",
            };
        }

        if (!shiftInfo) return base;

        if (shiftInfo.type === "row" && row === shiftInfo.index) {
            const isLeft = shiftInfo.direction === "left";
            return { ...base, x: isLeft ? "-100%" : "100%" };
        }

        if (shiftInfo.type === "col" && col === shiftInfo.index) {
            const isUp = shiftInfo.direction === "up";
            return { ...base, y: isUp ? "-100%" : "100%" };
        }

        if (shiftInfo.type === "diag") {
            const minDim = Math.min(cols, rows);
            if (shiftInfo.index === 0 && col === row) {
                const isUpLeft = shiftInfo.direction === "up-left";
                const offset = isUpLeft ? "-100%" : "100%";
                return { ...base, x: offset, y: offset };
            }
            if (shiftInfo.index === 1 && col + row === minDim - 1) {
                const isUpRight = shiftInfo.direction === "up-right";
                const offsetX = isUpRight ? "100%" : "-100%";
                const offsetY = isUpRight ? "-100%" : "100%";
                return { ...base, x: offsetX, y: offsetY };
            }
        }

        return base;
    };

    const getWrappingCellAnimation = (): TargetAndTransition => {
        if (!shiftInfo) return {};

        if (shiftInfo.type === "row") {
            const isLeft = shiftInfo.direction === "left";
            return { x: isLeft ? "-100%" : "100%", y: 0 };
        }

        if (shiftInfo.type === "col") {
            const isUp = shiftInfo.direction === "up";
            return { x: 0, y: isUp ? "-100%" : "100%" };
        }

        if (shiftInfo.index === 0) {
            const isUpLeft = shiftInfo.direction === "up-left";
            const offset = isUpLeft ? "-100%" : "100%";
            return { x: offset, y: offset, scale: 0.707 };
        } else {
            const isUpRight = shiftInfo.direction === "up-right";
            const offsetX = isUpRight ? "100%" : "-100%";
            const offsetY = isUpRight ? "-100%" : "100%";
            return { x: offsetX, y: offsetY, scale: 0.707 };
        }
    };

    const getWrappingCell = (): WrappingCellData | null => {
        if (!shiftInfo) return null;

        if (shiftInfo.type === "row") {
            const isLeft = shiftInfo.direction === "left";
            const imgIndex = isLeft ? shiftInfo.index * cols : shiftInfo.index * cols + (cols - 1);
            const image = gridImages[imgIndex];
            const left = isLeft ? "100%" : `-${100 / cols}%`;
            const top = `${shiftInfo.index * (100 / rows)}%`;
            return { image, left, top };
        } else if (shiftInfo.type === "col") {
            const isUp = shiftInfo.direction === "up";
            const imgIndex = isUp ? shiftInfo.index : shiftInfo.index + (rows - 1) * cols;
            const image = gridImages[imgIndex];
            const left = `${shiftInfo.index * (100 / cols)}%`;
            const top = isUp ? "100%" : `-${100 / rows}%`;
            return { image, left, top };
        } else {
            const minDim = Math.min(cols, rows);
            if (shiftInfo.index === 0) {
                const isUpLeft = shiftInfo.direction === "up-left";
                const imgIndex = isUpLeft ? 0 : (minDim - 1) * cols + (minDim - 1);
                const image = gridImages[imgIndex];
                const left = isUpLeft ? `${minDim * (100 / cols)}%` : `-${100 / cols}%`;
                const top = isUpLeft ? `${minDim * (100 / rows)}%` : `-${100 / rows}%`;
                return { image, left, top };
            } else {
                const isDownLeft = shiftInfo.direction === "down-left";
                const imgIndex = isDownLeft ? (minDim - 1) * cols : minDim - 1;
                const image = gridImages[imgIndex];
                const left = isDownLeft ? `${minDim * (100 / cols)}%` : `-${100 / cols}%`;
                const top = isDownLeft ? `-${100 / rows}%` : `${minDim * (100 / rows)}%`;
                return { image, left, top };
            }
        }
    };

    return {
        gridImages,
        shiftInfo,
        morphInfo,
        shiftCount,
        getCellAnimation,
        getCellBorderRadius,
        getWrappingCellAnimation,
        getWrappingCell,
    };
}
