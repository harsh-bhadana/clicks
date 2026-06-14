"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import type { GalleryImage } from "../types";

// Dynamic metadata generators to give the gallery a premium agency feel
const BRANDS = [
    "AETHER", "SPECTRE", "NOVA", "ONYX", "QUANTUM", "APEX", "VORTEX", 
    "NEBULA", "HELIX", "SOLAS", "CHRONOS", "ECLIPSE", "IGNIS", "ZEPHYR"
];
const TITLES = [
    "DIGITAL REBIRTH", "CYBERNETIC GRID", "HYPER LUCID", "METAMORPHOSIS", 
    "ETHEREAL FLOW", "SPATIAL SHIFT", "SUBLIME LIGHT", "GRAVITY WAVE", 
    "PHANTOM VOID", "LUMINOUS PORTAL", "FUTURE CORE", "INFINITE SCROLL",
    "VERTEX LABS", "KINETIC THEORY"
];
const TAGS_POOL = [
    ["3D", "WEBGL"],
    ["EXPERIENCE", "MOTION"],
    ["BRANDING", "UI/UX"],
    ["CREATIVE", "DEV"],
    ["INTERACTIVE"],
    ["PRODUCT", "WebGL"]
];
const YEARS = ["2024", "2025", "2026"];

interface ThreeGalleryProps {
    images: GalleryImage[];
    selectedImage: GalleryImage | null;
    onCardClick: (img: GalleryImage, metadata: any) => void;
}

export default function ThreeGallery({
    images,
    selectedImage,
    onCardClick,
}: ThreeGalleryProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Track active interactions
    const [hoveredCardData, setHoveredCardData] = useState<any | null>(null);

    // Refs for animation & loop control
    const stateRef = useRef<{
        scene: THREE.Scene | null;
        camera: THREE.PerspectiveCamera | null;
        renderer: THREE.WebGLRenderer | null;
        cardGroup: THREE.Group | null;
        cardMeshes: THREE.Mesh[];
        raycaster: THREE.Raycaster | null;
        pointer: THREE.Vector2;
        hoveredMesh: THREE.Mesh | null;
        clickedMesh: THREE.Mesh | null;
        animationFrameId: number;

        // Interaction values
        targetRotation: { x: number; y: number };
        currentRotation: { x: number; y: number };
        isDragging: boolean;
        pointerStart: { x: number; y: number };
        rotationStart: { x: number; y: number };
        velocity: { x: number; y: number };
        prevPointer: { x: number; y: number };
        lastMoveTime: number;
    }>({
        scene: null,
        camera: null,
        renderer: null,
        cardGroup: null,
        cardMeshes: [],
        raycaster: null,
        pointer: new THREE.Vector2(-9999, -9999),
        hoveredMesh: null,
        clickedMesh: null,
        animationFrameId: 0,

        targetRotation: { x: 0, y: 0 },
        currentRotation: { x: 0, y: 0 },
        isDragging: false,
        pointerStart: { x: 0, y: 0 },
        rotationStart: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        prevPointer: { x: 0, y: 0 },
        lastMoveTime: 0,
    });

    // Helper: draw rounded rectangle paths in 2D canvas
    const drawRoundedRectPath = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
    ) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    // Helper: dynamic card canvas texture creator
    const createCardTexture = (
        imgSrc: string,
        brand: string,
        title: string,
        tags: string[],
        year: string
    ) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext("2d");
        if (!ctx) return new THREE.Texture();

        // 1. Draw card background
        ctx.fillStyle = "#0c0c0c";
        ctx.fillRect(0, 0, 512, 512);

        // 2. Draw card outline borders
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 4;
        drawRoundedRectPath(ctx, 4, 4, 504, 504, 24);
        ctx.stroke();

        // 3. Draw header typography (all-caps monospaced)
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.font = "bold 13px monospace, Courier";
        ctx.textAlign = "left";
        ctx.fillText(brand, 28, 44);

        ctx.textAlign = "right";
        ctx.fillText(title, 484, 44);

        // 4. Draw footer metadata (Year)
        ctx.textAlign = "right";
        ctx.fillText(year, 484, 468);

        // 5. Draw tag pills in footer
        let currentX = 28;
        tags.forEach((tag) => {
            ctx.font = "bold 11px monospace, Courier";
            const textWidth = ctx.measureText(tag).width;
            
            // Pill background
            ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            drawRoundedRectPath(ctx, currentX, 452, textWidth + 14, 22, 11);
            ctx.fill();
            ctx.stroke();

            // Pill text
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.textAlign = "left";
            ctx.fillText(tag, currentX + 7, 463);

            currentX += textWidth + 20; // Increment space
        });

        // 6. Draw placeholder background for image
        ctx.fillStyle = "#121212";
        drawRoundedRectPath(ctx, 28, 76, 456, 350, 16);
        ctx.fill();

        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        // 7. Load image asynchronously
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = imgSrc;
        img.onload = () => {
            ctx.save();
            drawRoundedRectPath(ctx, 28, 76, 456, 350, 16);
            ctx.clip();

            // Cover/center rendering algorithm
            const imgAspect = img.width / img.height;
            const targetAspect = 456 / 350;
            let renderW = 456;
            let renderH = 350;
            let renderX = 28;
            let renderY = 76;

            if (imgAspect > targetAspect) {
                renderW = 350 * imgAspect;
                renderX = 28 - (renderW - 456) / 2;
            } else {
                renderH = 456 / imgAspect;
                renderY = 76 - (renderH - 350) / 2;
            }

            ctx.drawImage(img, renderX, renderY, renderW, renderH);
            ctx.restore();

            texture.needsUpdate = true;
        };

        return texture;
    };

    // Three.js Setup & Lifecycle
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current || images.length === 0) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // ── 1. Create Scene & Camera ──────────────────────────────────────────
        const scene = new THREE.Scene();
        stateRef.current.scene = scene;

        const camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 100);
        camera.position.set(0, 0, 0); // Camera inside center
        stateRef.current.camera = camera;

        // ── 2. Create Renderer ────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        stateRef.current.renderer = renderer;

        // ── 3. Populate Card Group ────────────────────────────────────────────
        const cardGroup = new THREE.Group();
        scene.add(cardGroup);
        stateRef.current.cardGroup = cardGroup;

        // Parameters for sphere mapping
        const radius = 9.0;
        const cols = 16;
        const rows = 4;
        const totalCards = cols * rows;

        const cardGeometry = new THREE.PlaneGeometry(2.5, 2.5, 12, 12);
        const meshes: THREE.Mesh[] = [];

        // Duplicate and repeat images to populate the sphere if array is small
        for (let i = 0; i < totalCards; i++) {
            const imgIndex = i % images.length;
            const imgData = images[imgIndex];

            // Deterministic metadata tags matching current index
            const brand = BRANDS[i % BRANDS.length];
            const title = TITLES[i % TITLES.length];
            const tags = TAGS_POOL[i % TAGS_POOL.length];
            const year = YEARS[i % YEARS.length];

            const texture = createCardTexture(imgData.src, brand, title, tags, year);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1.0,
            });

            const mesh = new THREE.Mesh(cardGeometry, material);

            // Compute coordinates
            const c = i % cols;
            const r = Math.floor(i / cols);

            // Angles
            const theta = (c / cols) * Math.PI * 2; // longitude (yaw)
            // latitude (pitch) spanning from -25 to +25 degrees
            const phi = -Math.PI / 7.2 + (r / (rows - 1)) * (Math.PI / 3.6);

            // Positions on surface of sphere
            const x = radius * Math.cos(phi) * Math.sin(theta);
            const y = radius * Math.sin(phi);
            const z = radius * Math.cos(phi) * Math.cos(theta);

            mesh.position.set(x, y, z);
            mesh.lookAt(0, 0, 0); // Look at camera

            // Save original attributes
            mesh.userData = {
                image: imgData,
                brand,
                projectTitle: title,
                tags,
                year,
                originalPosition: mesh.position.clone(),
                originalRotation: mesh.rotation.clone(),
                originalQuaternion: mesh.quaternion.clone(),
                index: i,
            };

            cardGroup.add(mesh);
            meshes.push(mesh);
        }
        stateRef.current.cardMeshes = meshes;

        // ── 4. Set Up Raycaster ───────────────────────────────────────────────
        const raycaster = new THREE.Raycaster();
        stateRef.current.raycaster = raycaster;

        // ── 5. Resize Event ───────────────────────────────────────────────────
        const handleResize = () => {
            if (!containerRef.current || !stateRef.current.camera || !stateRef.current.renderer) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;

            stateRef.current.camera.aspect = w / h;
            stateRef.current.camera.updateProjectionMatrix();
            stateRef.current.renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        // ── 6. Animation Frame Loop ───────────────────────────────────────────
        const animate = () => {
            stateRef.current.animationFrameId = requestAnimationFrame(animate);

            const s = stateRef.current;
            if (!s.cardGroup || !s.camera || !s.renderer || !s.scene) return;

            // Apply inertia if not dragging and not zoomed in
            if (!s.isDragging && !selectedImage) {
                s.targetRotation.y += s.velocity.y;
                s.targetRotation.x += s.velocity.x;

                // Decay velocity (friction)
                s.velocity.y *= 0.94;
                s.velocity.x *= 0.94;

                // Slow auto-drift yaw rotation if user is idle
                if (Math.abs(s.velocity.y) < 0.0001) {
                    s.targetRotation.y += 0.0006;
                }
            }

            // Lerp current rotation towards target
            const lerpCoeff = 0.075;
            s.currentRotation.y += (s.targetRotation.y - s.currentRotation.y) * lerpCoeff;
            s.currentRotation.x += (s.targetRotation.x - s.currentRotation.x) * lerpCoeff;

            // Apply rotations
            if (!selectedImage) {
                s.cardGroup.rotation.y = s.currentRotation.y;
                s.cardGroup.rotation.x = s.currentRotation.x;
            }

            // Raycasting hover state updates (only if not selected)
            if (s.raycaster && !selectedImage) {
                s.raycaster.setFromCamera(s.pointer, s.camera);
                const intersects = s.raycaster.intersectObjects(s.cardMeshes);

                if (intersects.length > 0) {
                    const intersectedMesh = intersects[0].object as THREE.Mesh;

                    if (s.hoveredMesh !== intersectedMesh) {
                        // Restore previous hovered mesh
                        if (s.hoveredMesh) {
                            const prev = s.hoveredMesh;
                            gsap.to(prev.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
                            gsap.to(prev.position, {
                                x: prev.userData.originalPosition.x,
                                y: prev.userData.originalPosition.y,
                                z: prev.userData.originalPosition.z,
                                duration: 0.4,
                                ease: "power2.out",
                            });
                        }

                        // Hover on new mesh
                        s.hoveredMesh = intersectedMesh;
                        setHoveredCardData({
                            brand: intersectedMesh.userData.brand,
                            title: intersectedMesh.userData.projectTitle,
                        });

                        // Set CustomCursor context tags on container
                        if (canvasRef.current) {
                            canvasRef.current.setAttribute("data-cursor", "view");
                            canvasRef.current.classList.add("cursor-pointer");
                        }

                        // Animate hovered scale and move slightly inwards towards origin (camera)
                        gsap.to(intersectedMesh.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.4, ease: "power2.out" });
                        
                        const dir = new THREE.Vector3().copy(intersectedMesh.userData.originalPosition).normalize();
                        const hoveredPos = intersectedMesh.userData.originalPosition.clone().sub(dir.multiplyScalar(0.4));
                        gsap.to(intersectedMesh.position, {
                            x: hoveredPos.x,
                            y: hoveredPos.y,
                            z: hoveredPos.z,
                            duration: 0.4,
                            ease: "power2.out",
                        });
                    }
                } else {
                    // No intersections
                    if (s.hoveredMesh) {
                        const prev = s.hoveredMesh;
                        gsap.to(prev.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out" });
                        gsap.to(prev.position, {
                            x: prev.userData.originalPosition.x,
                            y: prev.userData.originalPosition.y,
                            z: prev.userData.originalPosition.z,
                            duration: 0.4,
                            ease: "power2.out",
                        });
                        s.hoveredMesh = null;
                        setHoveredCardData(null);

                        if (canvasRef.current) {
                            canvasRef.current.removeAttribute("data-cursor");
                            canvasRef.current.classList.remove("cursor-pointer");
                        }
                    }
                }
            }

            s.renderer.render(s.scene, s.camera);
        };
        animate();

        // ── 7. Cleanup ────────────────────────────────────────────────────────
        return () => {
            cancelAnimationFrame(stateRef.current.animationFrameId);
            window.removeEventListener("resize", handleResize);

            // Dispose ThreeJS resources
            cardGeometry.dispose();
            meshes.forEach((mesh) => {
                if (mesh.material instanceof THREE.Material) mesh.material.dispose();
                // Dispose texture inside canvas mapping
                const mat = mesh.material as THREE.MeshBasicMaterial;
                if (mat.map) mat.map.dispose();
            });

            if (renderer) renderer.dispose();
        };
    }, [images]);

    // Handle incoming project selection zooms
    useEffect(() => {
        const s = stateRef.current;
        if (!s.cardGroup || !s.camera || s.cardMeshes.length === 0) return;

        if (selectedImage) {
            // Locate the selected mesh
            const mesh = s.cardMeshes.find(m => m.userData.image.id === selectedImage.id);
            if (mesh) {
                s.clickedMesh = mesh;
                
                // Clear hovers
                s.hoveredMesh = null;
                setHoveredCardData(null);
                if (canvasRef.current) {
                    canvasRef.current.removeAttribute("data-cursor");
                    canvasRef.current.classList.remove("cursor-pointer");
                }

                // 1. Fade out other card meshes
                s.cardMeshes.forEach((otherMesh) => {
                    if (otherMesh !== mesh) {
                        gsap.to(otherMesh.material, { opacity: 0, duration: 0.6, ease: "power2.out" });
                    }
                });

                // 2. Animate clicked card to position flatly in front of the camera
                // Target: 3.2 units directly in front of camera
                const targetWorldPos = new THREE.Vector3(0, 0, -3.2).applyMatrix4(s.camera.matrixWorld);
                
                gsap.to(mesh.position, {
                    x: targetWorldPos.x,
                    y: targetWorldPos.y,
                    z: targetWorldPos.z,
                    duration: 0.8,
                    ease: "power3.inOut",
                });

                // Align card quaternion with camera orientation
                const targetQuaternion = s.camera.quaternion.clone();
                gsap.to(mesh.quaternion, {
                    x: targetQuaternion.x,
                    y: targetQuaternion.y,
                    z: targetQuaternion.z,
                    w: targetQuaternion.w,
                    duration: 0.8,
                    ease: "power3.inOut",
                });
            }
        } else {
            // Restore from zoomed detail view
            if (s.clickedMesh) {
                const mesh = s.clickedMesh;
                s.clickedMesh = null;

                // Animate position back
                gsap.to(mesh.position, {
                    x: mesh.userData.originalPosition.x,
                    y: mesh.userData.originalPosition.y,
                    z: mesh.userData.originalPosition.z,
                    duration: 0.8,
                    ease: "power3.out",
                });

                // Animate quaternion rotation back
                gsap.to(mesh.quaternion, {
                    x: mesh.userData.originalQuaternion.x,
                    y: mesh.userData.originalQuaternion.y,
                    z: mesh.userData.originalQuaternion.z,
                    w: mesh.userData.originalQuaternion.w,
                    duration: 0.8,
                    ease: "power3.out",
                });

                // Fade back in all other meshes
                s.cardMeshes.forEach((otherMesh) => {
                    gsap.to(otherMesh.material, { opacity: 1.0, duration: 0.8, ease: "power2.out" });
                });
            }
        }
    }, [selectedImage]);

    // Mouse & Pointer Event Listeners
    const handlePointerDown = (e: React.PointerEvent) => {
        // Disallow actions if zoomed in
        if (selectedImage) return;

        const s = stateRef.current;
        s.isDragging = true;
        s.pointerStart.x = e.clientX;
        s.pointerStart.y = e.clientY;
        s.rotationStart.x = s.targetRotation.x;
        s.rotationStart.y = s.targetRotation.y;
        s.prevPointer.x = e.clientX;
        s.prevPointer.y = e.clientY;
        s.velocity.x = 0;
        s.velocity.y = 0;
        s.lastMoveTime = performance.now();

        if (canvasRef.current) {
            canvasRef.current.setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const s = stateRef.current;
        
        // Update Raycasting coordinate pointer coords relative to canvas
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            s.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            s.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }

        if (s.isDragging && !selectedImage) {
            const deltaX = e.clientX - s.pointerStart.x;
            const deltaY = e.clientY - s.pointerStart.y;

            // Drag velocity coefficient
            const speed = 0.0025;
            s.targetRotation.y = s.rotationStart.y - deltaX * speed;
            s.targetRotation.x = s.rotationStart.x - deltaY * speed;

            // Clamp vertical rotation (pitch) to prevent flipping (approx. -25 to +25 degrees)
            s.targetRotation.x = Math.max(-0.45, Math.min(0.45, s.targetRotation.x));

            // Calculate instantaneous momentum
            const now = performance.now();
            const timeDiff = Math.max(1, now - s.lastMoveTime);
            s.velocity.y = ((e.clientX - s.prevPointer.x) * speed * 8) / timeDiff;
            s.velocity.x = ((e.clientY - s.prevPointer.y) * speed * 8) / timeDiff;

            s.prevPointer.x = e.clientX;
            s.prevPointer.y = e.clientY;
            s.lastMoveTime = now;
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        const s = stateRef.current;
        if (s.isDragging) {
            s.isDragging = false;
            if (canvasRef.current) {
                canvasRef.current.releasePointerCapture(e.pointerId);
            }

            // Click verification (if displacement was extremely small)
            const displacementX = Math.abs(e.clientX - s.pointerStart.x);
            const displacementY = Math.abs(e.clientY - s.pointerStart.y);
            if (displacementX < 4 && displacementY < 4) {
                handleCanvasClick();
            }
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (selectedImage) return;

        const s = stateRef.current;
        const speed = 0.0007;

        // Easing scrolling: horizontal dy translates to yaw, vertical dx translates to pitch
        s.targetRotation.y += e.deltaY * speed;
        s.targetRotation.x += e.deltaX * speed;

        s.targetRotation.x = Math.max(-0.45, Math.min(0.45, s.targetRotation.x));

        // Kill velocity to override with scroll inputs
        s.velocity.x = 0;
        s.velocity.y = 0;
    };

    const handleCanvasClick = () => {
        const s = stateRef.current;
        if (s.hoveredMesh && !selectedImage) {
            const mesh = s.hoveredMesh;
            onCardClick(mesh.userData.image, mesh.userData);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full select-none outline-none"
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full block touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
            />

            {/* Bottom floating details HUD indicating hovered project */}
            <div
                className={`absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-500 flex flex-col items-center text-center font-mono ${
                    hoveredCardData ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
            >
                <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                    {hoveredCardData?.brand || ""}
                </span>
                <span className="text-sm font-bold tracking-[0.3em] uppercase text-white mt-1">
                    {hoveredCardData?.title || ""}
                </span>
            </div>
        </div>
    );
}
