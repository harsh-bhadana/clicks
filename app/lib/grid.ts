import type { GalleryImage } from "@/app/types";

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
export const shiftDiag = (
    curr: GalleryImage[],
    index: number,
    dir: string,
    cols: number = 4
): GalleryImage[] => {
    const next = [...curr];
    if (cols === 4) {
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
    } else {
        // cols === 3
        if (index === 0) {
            // Main diagonal: indices 0, 4, 8
            const elements = [next[0], next[4], next[8]];
            if (dir === "up-left") {
                const first = elements.shift()!;
                elements.push(first);
            } else {
                const last = elements.pop()!;
                elements.unshift(last);
            }
            next[0] = elements[0];
            next[4] = elements[1];
            next[8] = elements[2];
        } else {
            // Anti diagonal: indices 2, 4, 6
            const elements = [next[2], next[4], next[6]];
            if (dir === "down-left") {
                const last = elements.pop()!;
                elements.unshift(last);
            } else {
                const first = elements.shift()!;
                elements.push(first);
            }
            next[2] = elements[0];
            next[4] = elements[1];
            next[6] = elements[2];
        }
    }
    return next;
};

/** Shift a single row left or right, returning a new array. */
export const shiftRow = (
    curr: GalleryImage[],
    index: number,
    direction: string,
    cols: number = 4
): GalleryImage[] => {
    const next = [...curr];
    const startIndex = index * cols;
    const rowElements = [];
    for (let i = 0; i < cols; i++) {
        rowElements.push(next[startIndex + i]);
    }

    if (direction === "left") {
        const first = rowElements.shift()!;
        rowElements.push(first);
    } else {
        const last = rowElements.pop()!;
        rowElements.unshift(last);
    }

    for (let i = 0; i < cols; i++) {
        next[startIndex + i] = rowElements[i];
    }
    return next;
};

/** Shift a single column up or down, returning a new array. */
export const shiftCol = (
    curr: GalleryImage[],
    index: number,
    direction: string,
    cols: number = 4,
    rows: number = 3
): GalleryImage[] => {
    const next = [...curr];
    const colElements = [];
    for (let i = 0; i < rows; i++) {
        colElements.push(next[i * cols + index]);
    }

    if (direction === "up") {
        const first = colElements.shift()!;
        colElements.push(first);
    } else {
        const last = colElements.pop()!;
        colElements.unshift(last);
    }

    for (let i = 0; i < rows; i++) {
        next[i * cols + index] = colElements[i];
    }
    return next;
};
