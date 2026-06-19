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

// Helper to shuffle an array
function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Helper to filter out duplicate images by pathname
function getUniqueImages(images: GalleryImage[]): GalleryImage[] {
    const seen = new Set<string>();
    return images.filter((img) => {
        if (!img.pathname) return true;
        if (seen.has(img.pathname)) return false;
        seen.add(img.pathname);
        return true;
    });
}

// Helper to calculate displaced and wrapped grid indices for a shift
const getShiftIndices = (
    type: "row" | "col" | "diag",
    index: number,
    direction: string,
    cols: number,
    rows: number
) => {
    let displacedIndex = 0;
    let wrappedIndex = 0;

    if (type === "row") {
        const startIndex = index * cols;
        displacedIndex = direction === "left" ? startIndex : startIndex + cols - 1;
        wrappedIndex = direction === "left" ? startIndex + cols - 1 : startIndex;
    } else if (type === "col") {
        displacedIndex = direction === "up" ? index : (rows - 1) * cols + index;
        wrappedIndex = direction === "up" ? (rows - 1) * cols + index : index;
    } else {
        const minDim = Math.min(cols, rows);
        if (cols === 4) {
            if (index === 0) {
                displacedIndex = direction === "up-left" ? 0 : 10;
                wrappedIndex = direction === "up-left" ? 10 : 0;
            } else {
                displacedIndex = direction === "down-left" ? 2 : 8;
                wrappedIndex = direction === "down-left" ? 8 : 2;
            }
        } else {
            if (index === 0) {
                displacedIndex = direction === "up-left" ? 0 : 8;
                wrappedIndex = direction === "up-left" ? 8 : 0;
            } else {
                displacedIndex = direction === "down-left" ? 2 : 6;
                wrappedIndex = direction === "down-left" ? 6 : 2;
            }
        }
    }
    return { displacedIndex, wrappedIndex };
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGridEngine(
    initialImages: GalleryImage[],
    paused: boolean,
    cols: number = 4,
    rows: number = 3
) {
    const [state, setState] = useState<{
        gridImages: GalleryImage[];
        pool: GalleryImage[];
        shiftInfo: ShiftInfo | null;
        morphInfo: MorphInfo | null;
        incomingImage: GalleryImage | null;
        shiftCount: number;
    }>(() => {
        const unique = getUniqueImages(initialImages);
        if (unique.length === 0) {
            return {
                gridImages: [],
                pool: [],
                shiftInfo: null,
                morphInfo: null,
                incomingImage: null,
                shiftCount: 0,
            };
        }
        if (unique.length <= 12) {
            return {
                gridImages: unique,
                pool: [],
                shiftInfo: null,
                morphInfo: null,
                incomingImage: null,
                shiftCount: 0,
            };
        }
        const shuffled = shuffle(unique);
        return {
            gridImages: shuffled.slice(0, 12),
            pool: shuffled.slice(12),
            shiftInfo: null,
            morphInfo: null,
            incomingImage: null,
            shiftCount: 0,
        };
    });

    const { gridImages, pool, shiftInfo, morphInfo, incomingImage, shiftCount } = state;

    useEffect(() => {
        const unique = getUniqueImages(initialImages);
        if (unique.length <= 12) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState({
                gridImages: unique,
                pool: [],
                shiftInfo: null,
                morphInfo: null,
                incomingImage: null,
                shiftCount: 0,
            });
        } else {
            const shuffled = shuffle(unique);
             
            setState({
                gridImages: shuffled.slice(0, 12),
                pool: shuffled.slice(12),
                shiftInfo: null,
                morphInfo: null,
                incomingImage: null,
                shiftCount: 0,
            });
        }
    }, [initialImages]);

    const isAnimatingRef = useRef(false);

    // Carousel Shifting Effect: swaps a random row, column, or diagonal every 4 seconds
    useEffect(() => {
        if (paused || state.pool.length === 0) return;

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

            // Determine incoming and displaced images synchronously
            let selectedIncoming: GalleryImage | null = null;
            if (state.pool.length > 0) {
                const randIdx = Math.floor(Math.random() * state.pool.length);
                selectedIncoming = state.pool[randIdx];
            }

            const { displacedIndex, wrappedIndex } = getShiftIndices(
                shiftType,
                index,
                direction,
                cols,
                rows
            );
            const displacedImg = state.gridImages[displacedIndex];

            if (shiftType === "diag") {
                setState((prev) => ({
                    ...prev,
                    morphInfo: { type: "diag", index },
                    incomingImage: selectedIncoming,
                }));

                setTimeout(() => {
                    setState((prev) => ({
                        ...prev,
                        shiftInfo: { type: "diag", index, direction },
                    }));

                    setTimeout(() => {
                        setState((prev) => {
                            const nextGrid = shiftDiag(prev.gridImages, index, direction, cols);
                            let nextPool = [...prev.pool];

                            if (selectedIncoming && displacedImg) {
                                nextGrid[wrappedIndex] = selectedIncoming;
                                nextPool = nextPool.filter(
                                    (img) => img.pathname !== selectedIncoming!.pathname
                                );
                                nextPool.push(displacedImg);
                            }

                            return {
                                ...prev,
                                gridImages: nextGrid,
                                pool: nextPool,
                                shiftInfo: null,
                                incomingImage: null,
                            };
                        });

                        setTimeout(() => {
                            setState((prev) => ({
                                ...prev,
                                morphInfo: null,
                                shiftCount: prev.shiftCount + 1,
                            }));
                            isAnimatingRef.current = false;
                        }, 300);
                    }, 1200);
                }, 400);
            } else {
                setState((prev) => ({
                    ...prev,
                    morphInfo: { type: shiftType, index },
                    shiftInfo: { type: shiftType, index, direction },
                    incomingImage: selectedIncoming,
                }));

                setTimeout(() => {
                    setState((prev) => {
                        let nextGrid;
                        if (shiftType === "row") {
                            nextGrid = shiftRow(prev.gridImages, index, direction, cols);
                        } else {
                            nextGrid = shiftCol(prev.gridImages, index, direction, cols, rows);
                        }
                        let nextPool = [...prev.pool];

                        if (selectedIncoming && displacedImg) {
                            nextGrid[wrappedIndex] = selectedIncoming;
                            nextPool = nextPool.filter(
                                (img) => img.pathname !== selectedIncoming!.pathname
                            );
                            nextPool.push(displacedImg);
                        }

                        return {
                            ...prev,
                            gridImages: nextGrid,
                            pool: nextPool,
                            shiftInfo: null,
                            morphInfo: null,
                            incomingImage: null,
                            shiftCount: prev.shiftCount + 1,
                        };
                    });

                    isAnimatingRef.current = false;
                }, 1200);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [paused, cols, rows, state, initialImages]);

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
            const image = incomingImage || gridImages[imgIndex];
            const left = isLeft ? "100%" : `-${100 / cols}%`;
            const top = `${shiftInfo.index * (100 / rows)}%`;
            return { image, left, top };
        } else if (shiftInfo.type === "col") {
            const isUp = shiftInfo.direction === "up";
            const imgIndex = isUp ? shiftInfo.index : shiftInfo.index + (rows - 1) * cols;
            const image = incomingImage || gridImages[imgIndex];
            const left = `${shiftInfo.index * (100 / cols)}%`;
            const top = isUp ? "100%" : `-${100 / rows}%`;
            return { image, left, top };
        } else {
            const minDim = Math.min(cols, rows);
            if (shiftInfo.index === 0) {
                const isUpLeft = shiftInfo.direction === "up-left";
                const imgIndex = isUpLeft ? 0 : (minDim - 1) * cols + (minDim - 1);
                const image = incomingImage || gridImages[imgIndex];
                const left = isUpLeft ? `${minDim * (100 / cols)}%` : `-${100 / cols}%`;
                const top = isUpLeft ? `${minDim * (100 / rows)}%` : `-${100 / rows}%`;
                return { image, left, top };
            } else {
                const isDownLeft = shiftInfo.direction === "down-left";
                const imgIndex = isDownLeft ? (minDim - 1) * cols : minDim - 1;
                const image = incomingImage || gridImages[imgIndex];
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
