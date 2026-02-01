"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import InfiniteMarquee from "./components/InfiniteMarquee";

const abstractImages = [
  "/images/abstract/abstract_1.png",
  "/images/abstract/abstract_2.png",
  "/images/abstract/abstract_3.png",
  "/images/abstract/abstract_4.png",
  "/images/abstract/abstract_5.png",
];

const heroImages = [
  "/images/hero/hero_1.png",
  "/images/hero/hero_2.png",
  "/images/hero/hero_3.png",
  "/images/hero/hero_4.png",
  "/images/hero/hero_5.png",
];

export default function Home() {
  const [setsCount, setSetsCount] = useState(1);
  const observerTarget = useRef(null);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((reveal) => observer.observe(reveal));
    return () => observer.disconnect();
  }, [setsCount]);

  const loadMore = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        setSetsCount((prev) => prev + 1);
      }
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(loadMore, {
      rootMargin: "200px",
      threshold: 0.1,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const renderMarqueeSet = (index: number) => {
    const isEvenSet = index % 2 === 0;
    return (
      <div key={`set-${index}`} className="space-y-12">
        <div className="reveal" style={{ transitionDelay: '100ms' }}>
          <InfiniteMarquee direction={isEvenSet ? "left" : "right"} speed={30 + index} images={index % 2 === 0 ? abstractImages : heroImages} />
        </div>
        <div className="reveal" style={{ transitionDelay: '300ms' }}>
          <InfiniteMarquee direction={isEvenSet ? "right" : "left"} speed={35 - index} images={index % 2 === 0 ? heroImages : abstractImages} />
        </div>
        <div className="reveal" style={{ transitionDelay: '500ms' }}>
          <InfiniteMarquee direction={isEvenSet ? "left" : "right"} speed={25 + index * 2} images={index % 2 === 0 ? abstractImages : heroImages} />
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Header Section */}
      <header className="fixed top-0 left-0 w-full z-50 py-12 px-8 flex justify-center items-center mix-blend-difference pointer-events-none">
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter uppercase reveal">
          clicks
        </h1>
      </header>

      {/* Marquee Streams Section */}
      <section className="pt-64 pb-32 space-y-12">
        {Array.from({ length: setsCount }).map((_, i) => renderMarqueeSet(i))}

        {/* Intersection Trigger */}
        <div ref={observerTarget} className="h-20 w-full flex justify-center items-center">
          <div className="w-1 h-1 bg-white/20 rounded-full animate-ping" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 text-center text-zinc-600 text-[10px] tracking-[0.3em] uppercase">
        &copy; {new Date().getFullYear()} Clicks Gallery &bull; Minimal Immersive Experience
      </footer>
    </main>
  );
}


