"use client";

import { useState } from "react";
import Image from "next/image";

const cards = [
    { id: 1, src: "/images/hero/hero_1.png", color: "#a855f7" },
    { id: 2, src: "/images/hero/hero_2.png", color: "#3b82f6" },
    { id: 3, src: "/images/hero/hero_3.png", color: "#10b981" },
    { id: 4, src: "/images/hero/hero_4.png", color: "#f59e0b" },
    { id: 5, src: "/images/hero/hero_5.png", color: "#ef4444" },
];

export default function ParallaxStack() {
    const [stack, setStack] = useState(cards);

    const moveToEnd = (id: number) => {
        setStack((prev) => {
            const index = prev.findIndex((item) => item.id === id);
            const newStack = [...prev];
            const [movedItem] = newStack.splice(index, 1);
            newStack.push(movedItem);
            return newStack;
        });
    };

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center pointer-events-none">
            <div className="relative w-[320px] h-[450px]">
                {stack.map((card, i) => {
                    // Cards at the end of array are "on top"
                    const reverseIndex = stack.length - 1 - i;
                    const offset = reverseIndex * 15;
                    const scale = 1 - reverseIndex * 0.05;
                    const opacity = 1 - reverseIndex * 0.2;

                    return (
                        <div
                            key={card.id}
                            onClick={() => moveToEnd(card.id)}
                            className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer group pointer-events-auto"
                            style={{
                                transform: `translateY(${-offset}px) scale(${scale})`,
                                zIndex: i,
                                opacity: opacity > 0 ? opacity : 0,
                            }}
                        >
                            <div
                                className="relative w-full h-full rounded-2xl overflow-hidden glass shadow-2xl border-2 transition-colors duration-500 group-hover:scale-[1.02]"
                                style={{ borderColor: reverseIndex === 0 ? card.color : 'rgba(255,255,255,0.1)' }}
                            >
                                <Image
                                    src={card.src}
                                    alt={`Card ${card.id}`}
                                    fill
                                    className="object-cover"
                                />
                                {/* Glow effect for active card */}
                                {reverseIndex === 0 && (
                                    <div
                                        className="absolute inset-0 opacity-20"
                                        style={{ background: `radial-gradient(circle at center, ${card.color}, transparent)` }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-10 text-zinc-500 text-sm animate-pulse">
                Click a card to shuffle the stack
            </div>
        </div>
    );
}
