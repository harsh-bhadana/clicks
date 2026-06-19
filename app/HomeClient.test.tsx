import { describe, it, expect } from "vitest";
import { padImages, shiftDiag, shiftRow, shiftCol } from "@/app/lib/grid";
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
        it("should shift main diagonal elements (indices 0, 5, 10) up-left for cols = 4", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 0, "up-left", 4);
            // Indices 0, 5, 10 should move [0, 5, 10] -> [5, 10, 0]
            expect(shifted[0].id).toBe(5);
            expect(shifted[5].id).toBe(10);
            expect(shifted[10].id).toBe(0);
            // Non-diagonal items should remain unchanged
            expect(shifted[1].id).toBe(1);
            expect(shifted[4].id).toBe(4);
            expect(shifted[11].id).toBe(11);
        });

        it("should shift main diagonal elements (indices 0, 5, 10) down-right for cols = 4", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 0, "down-right", 4);
            // Indices 0, 5, 10 should move [0, 5, 10] -> [10, 0, 5]
            expect(shifted[0].id).toBe(10);
            expect(shifted[5].id).toBe(0);
            expect(shifted[10].id).toBe(5);
        });

        it("should shift anti-diagonal elements (indices 2, 5, 8) down-left for cols = 4", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 1, "down-left", 4);
            // Indices 2, 5, 8 should move [2, 5, 8] -> [8, 2, 5]
            expect(shifted[2].id).toBe(8);
            expect(shifted[5].id).toBe(2);
            expect(shifted[8].id).toBe(5);
        });

        it("should shift main diagonal elements (indices 0, 4, 8) up-left for cols = 3", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 0, "up-left", 3);
            // Indices 0, 4, 8 should move [0, 4, 8] -> [4, 8, 0]
            expect(shifted[0].id).toBe(4);
            expect(shifted[4].id).toBe(8);
            expect(shifted[8].id).toBe(0);
        });

        it("should shift anti-diagonal elements (indices 2, 4, 6) down-left for cols = 3", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            const shifted = shiftDiag(initialList, 1, "down-left", 3);
            // Indices 2, 4, 6 should move [2, 4, 6] -> [6, 2, 4]
            expect(shifted[2].id).toBe(6);
            expect(shifted[4].id).toBe(2);
            expect(shifted[6].id).toBe(4);
        });
    });

    describe("shiftRow", () => {
        it("should shift row elements left for cols = 3", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            // Shift row 1 (indices 3, 4, 5) left -> [4, 5, 3]
            const shifted = shiftRow(initialList, 1, "left", 3);
            expect(shifted[3].id).toBe(4);
            expect(shifted[4].id).toBe(5);
            expect(shifted[5].id).toBe(3);
            // Other elements remain same
            expect(shifted[0].id).toBe(0);
            expect(shifted[6].id).toBe(6);
        });
    });

    describe("shiftCol", () => {
        it("should shift col elements up for cols = 3, rows = 4", () => {
            const initialList = Array.from({ length: 12 }, (_, i) => mockImage(i));
            // Shift col 1 (indices 1, 4, 7, 10) up -> [4, 7, 10, 1]
            const shifted = shiftCol(initialList, 1, "up", 3, 4);
            expect(shifted[1].id).toBe(4);
            expect(shifted[4].id).toBe(7);
            expect(shifted[7].id).toBe(10);
            expect(shifted[10].id).toBe(1);
        });
    });
});
