"use client";

import { useState, useEffect } from "react";
import type { TargetAndTransition } from "framer-motion";
import type { GalleryImage } from "@/app/types";
import { COLS, ROWS } from "@/app/lib/constants";
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

export function useGridEngine(initialImages: GalleryImage[], paused: boolean) {
    const [gridImages, setGridImages] = useState<GalleryImage[]>(() =>
        padImages(initialImages, 12)
    );
    const [shiftInfo, setShiftInfo] = useState<ShiftInfo | null>(null);
    const [morphInfo, setMorphInfo] = useState<MorphInfo | null>(null);
    const [shiftCount, setShiftCount] = useState(0);

    // Carousel Shifting Effect: swaps a random row, column, or diagonal every 4 seconds
    useEffect(() => {
        if (gridImages.length < 12 || paused) return;

        const interval = setInterval(() => {
            if (shiftInfo || morphInfo) return;

            // Pick shift type: 40% Row, 40% Col, 20% Diagonal
            const r = Math.random();
            const shiftType = r < 0.4 ? "row" : r < 0.8 ? "col" : "diag";

            const index =
                shiftType === "row"
                    ? Math.floor(Math.random() * ROWS)
                    : shiftType === "col"
                      ? Math.floor(Math.random() * COLS)
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
                        setGridImages((curr) => shiftDiag(curr, index, direction));
                        setShiftInfo(null);

                        setTimeout(() => {
                            setMorphInfo(null);
                            setShiftCount((prev) => prev + 1);
                        }, 300);
                    }, 1200);
                }, 400);
            } else {
                setMorphInfo({ type: shiftType, index });
                setShiftInfo({ type: shiftType, index, direction });

                setTimeout(() => {
                    setGridImages((curr) =>
                        shiftType === "row"
                            ? shiftRow(curr, index, direction)
                            : shiftCol(curr, index, direction)
                    );
                    setShiftInfo(null);
                    setMorphInfo(null);
                    setShiftCount((prev) => prev + 1);
                }, 1200);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [gridImages, shiftInfo, morphInfo, paused]);

    // ── Helper closures exposed to the renderer ─────────────────────────────

    const isCellParticipating = (col: number, row: number) => {
        if (!morphInfo) return false;
        if (morphInfo.type === "row" && row === morphInfo.index) return true;
        if (morphInfo.type === "col" && col === morphInfo.index) return true;
        if (morphInfo.type === "diag") {
            if (morphInfo.index === 0 && col === row && col < 3 && row < 3) return true;
            if (morphInfo.index === 1 && col + row === 2 && col < 3 && row < 3) return true;
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
            if (shiftInfo.index === 0 && col === row) {
                const isUpLeft = shiftInfo.direction === "up-left";
                const offset = isUpLeft ? "-100%" : "100%";
                return { ...base, x: offset, y: offset };
            }
            if (shiftInfo.index === 1 && col + row === 2) {
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
            const imgIndex = isLeft ? shiftInfo.index * COLS : shiftInfo.index * COLS + (COLS - 1);
            const image = gridImages[imgIndex];
            const left = isLeft ? "100%" : "-25%";
            const top = `${shiftInfo.index * 33.3333}%`;
            return { image, left, top };
        } else if (shiftInfo.type === "col") {
            const isUp = shiftInfo.direction === "up";
            const imgIndex = isUp ? shiftInfo.index : shiftInfo.index + (ROWS - 1) * COLS;
            const image = gridImages[imgIndex];
            const left = `${shiftInfo.index * 25}%`;
            const top = isUp ? "100%" : "-33.3333%";
            return { image, left, top };
        } else {
            if (shiftInfo.index === 0) {
                const isUpLeft = shiftInfo.direction === "up-left";
                const imgIndex = isUpLeft ? 0 : 10;
                const image = gridImages[imgIndex];
                const left = isUpLeft ? "75%" : "-25%";
                const top = isUpLeft ? "100%" : "-33.3333%";
                return { image, left, top };
            } else {
                const isDownLeft = shiftInfo.direction === "down-left";
                const imgIndex = isDownLeft ? 8 : 2;
                const image = gridImages[imgIndex];
                const left = isDownLeft ? "75%" : "-25%";
                const top = isDownLeft ? "-33.3333%" : "100%";
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
