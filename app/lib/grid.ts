import type { GalleryImage } from "@/app/types";
import { COLS, ROWS } from "@/app/lib/constants";

// Helper to pad/loop images array to exactly 12 elements
export const padImages = (imgs: GalleryImage[], targetCount = 12): GalleryImage[] => {
    if (imgs.length === 0) return [];
    const result = [...imgs];
    while (result.length < targetCount) {
        result.push(...imgs);
    }
    return result.slice(0, targetCount);
};

// Helper to shift diagonal elements in the array state
export const shiftDiag = (curr: GalleryImage[], index: number, dir: string): GalleryImage[] => {
    const next = [...curr];
    if (index === 0) {
        // Main diagonal: indices 0, 5, 10
        const elements = [next[0], next[5], next[10]];
        if (dir === "up-left") {
            const first = elements.shift()!;
            elements.push(first);
        } else {
            const last = elements.pop()!;
            elements.unshift(last);
        }
        next[0] = elements[0];
        next[5] = elements[1];
        next[10] = elements[2];
    } else {
        // Anti diagonal: indices 2, 5, 8
        const elements = [next[2], next[5], next[8]];
        if (dir === "down-left") {
            const last = elements.pop()!;
            elements.unshift(last);
        } else {
            const first = elements.shift()!;
            elements.push(first);
        }
        next[2] = elements[0];
        next[5] = elements[1];
        next[8] = elements[2];
    }
    return next;
};

/** Shift a single row left or right, returning a new array. */
export const shiftRow = (
    curr: GalleryImage[],
    index: number,
    direction: string
): GalleryImage[] => {
    const next = [...curr];
    const startIndex = index * COLS;
    const rowElements = [
        next[startIndex],
        next[startIndex + 1],
        next[startIndex + 2],
        next[startIndex + 3],
    ];

    if (direction === "left") {
        const first = rowElements.shift()!;
        rowElements.push(first);
    } else {
        const last = rowElements.pop()!;
        rowElements.unshift(last);
    }

    for (let i = 0; i < COLS; i++) {
        next[startIndex + i] = rowElements[i];
    }
    return next;
};

/** Shift a single column up or down, returning a new array. */
export const shiftCol = (
    curr: GalleryImage[],
    index: number,
    direction: string
): GalleryImage[] => {
    const next = [...curr];
    const colElements = [next[index], next[index + 4], next[index + 8]];

    if (direction === "up") {
        const first = colElements.shift()!;
        colElements.push(first);
    } else {
        const last = colElements.pop()!;
        colElements.unshift(last);
    }

    for (let i = 0; i < ROWS; i++) {
        next[i * COLS + index] = colElements[i];
    }
    return next;
};
