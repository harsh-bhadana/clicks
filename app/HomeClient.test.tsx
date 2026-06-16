import { describe, it, expect } from "vitest";
import { padImages, shiftDiag } from "./HomeClient";
import type { GalleryImage } from "./types";

const mockImage = (id: number): GalleryImage => ({
    id,
    src: `/img-${id}.jpg`,
    pathname: `gallery/img-${id}.jpg`,
    metadata: {
        title: `Image ${id}`,
        location: "Location",
        date: "Date",
        category: "Street",
        colorPalette: [],
    },
});

describe("HomeClient helper functions", () => {
    describe("padImages", () => {
        it("should return an empty array if inputs are empty", () => {
            expect(padImages([])).toEqual([]);
        });

        it("should pad images to exactly 12 items by looping them", () => {
            const inputs = [mockImage(1), mockImage(2), mockImage(3)];
            const padded = padImages(inputs);
            expect(padded.length).toBe(12);
            expect(padded[0].id).toBe(1);
            expect(padded[1].id).toBe(2);
            expect(padded[2].id).toBe(3);
            expect(padded[3].id).toBe(1);
            expect(padded[4].id).toBe(2);
            expect(padded[11].id).toBe(3);
        });

        it("should support a custom target count", () => {
            const inputs = [mockImage(1), mockImage(2)];
            const padded = padImages(inputs, 5);
            expect(padded.length).toBe(5);
            expect(padded[4].id).toBe(1);
        });
    });

    describe("shiftDiag", () => {
        it("should shift main diagonal elements (indices 0, 5, 10) up-left", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 0, "up-left");
            // Indices 0, 5, 10 should move [0, 5, 10] -> [5, 10, 0]
            expect(shifted[0].id).toBe(5);
            expect(shifted[5].id).toBe(10);
            expect(shifted[10].id).toBe(0);
            // Non-diagonal items should remain unchanged
            expect(shifted[1].id).toBe(1);
            expect(shifted[4].id).toBe(4);
            expect(shifted[11].id).toBe(11);
        });

        it("should shift main diagonal elements (indices 0, 5, 10) down-right", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 0, "down-right");
            // Indices 0, 5, 10 should move [0, 5, 10] -> [10, 0, 5]
            expect(shifted[0].id).toBe(10);
            expect(shifted[5].id).toBe(0);
            expect(shifted[10].id).toBe(5);
        });

        it("should shift anti-diagonal elements (indices 2, 5, 8) down-left", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 1, "down-left");
            // Indices 2, 5, 8 should move [2, 5, 8] -> [8, 2, 5]
            expect(shifted[2].id).toBe(8);
            expect(shifted[5].id).toBe(2);
            expect(shifted[8].id).toBe(5);
        });
    });
});
