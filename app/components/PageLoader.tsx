"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function PageLoader() {
    const [isVisible, setIsVisible] = useState(true);
    const words = "CLICKS".split("");

    useEffect(() => {
        document.body.classList.add("no-scroll");
        const timer = setTimeout(() => {
            setIsVisible(false);
            document.body.classList.remove("no-scroll");
        }, 3000);
        return () => {
            clearTimeout(timer);
            document.body.classList.remove("no-scroll");
        };
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 1.2, ease: "easeInOut" }
                    }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
                >
                    <motion.div
                        initial={{ y: 0 }}
                        exit={{
                            opacity: 0,
                            scale: 1.1,
                            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
                        }}
                        className="flex overflow-hidden"
                    >
                        {words.map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ y: "110%" }}
                                animate={{ y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: i * 0.1,
                                    ease: [0.33, 1, 0.68, 1]
                                }}
                                className="text-8xl md:text-9xl font-black tracking-tighter uppercase text-white inline-block leading-none"
                            >
                                {char}
                            </motion.span>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                        className="absolute bottom-10 left-10 right-10 h-[1px] bg-white/20 origin-left"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
