/** Returns a pair of glow colours that cycle each time the grid shifts. */
export function useGlowColors(shiftCount: number): {
    glowColor1: string;
    glowColor2: string;
} {
    const idx = shiftCount % 3;
    if (idx === 0)
        return {
            glowColor1: "rgba(168, 85, 247, 0.85)",
            glowColor2: "rgba(59, 130, 246, 0.85)",
        }; // Purple / Blue
    if (idx === 1)
        return {
            glowColor1: "rgba(16, 185, 129, 0.85)",
            glowColor2: "rgba(20, 184, 166, 0.85)",
        }; // Emerald / Teal
    return {
        glowColor1: "rgba(244, 63, 94, 0.85)",
        glowColor2: "rgba(245, 158, 11, 0.85)",
    }; // Rose / Amber
}
