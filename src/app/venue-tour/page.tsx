"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  Compass,
  ArrowLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Palette,
  MapPin,
  Sparkles,
  Layers,
  RotateCcw,
  Check,
  Eye,
} from "lucide-react";
import { useEventStore, TableclothTheme } from "@/store/useEventStore";

// Pre-configured Perspective Hotspots (yaw / pitch)
interface Hotspot {
  id: string;
  name: string;
  desc: string;
  lon: number;
  lat: number;
  fov: number;
}

const VENUE_HOTSPOTS: Hotspot[] = [
  { id: "grand-entrance", name: "Grand Palace Foyer Entrance", desc: "Arrival royal archway & welcome reception", lon: 0, lat: 2, fov: 70 },
  { id: "head-table", name: "Imperial Royal Head Table", desc: "Front VIP vantage towards stage & mandap", lon: 88, lat: -4, fov: 60 },
  { id: "dance-floor", name: "Central Sangeet Ballroom Floor", desc: "360° immersion under gilded crystal chandeliers", lon: 185, lat: 10, fov: 75 },
  { id: "cocktail-bar", name: "Heritage Mixology Lounge", desc: "Private salon and champagne bar", lon: 275, lat: -2, fov: 65 },
];

export default function VenueTourPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    activeEventId,
    events,
    setTableclothTheme,
  } = useEventStore();

  const currentEvent = events[activeEventId] || events["sharma-verma-wedding"] || Object.values(events)[0];
  const activeTheme = currentEvent.tableclothTheme || "teal-velvet";

  // Viewer State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFov, setCurrentFov] = useState(70);
  const [activeHotspotId, setActiveHotspotId] = useState<string>("grand-entrance");
  const [isLoadingTexture, setIsLoadingTexture] = useState(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const sphereMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Drag coordinates
  const isUserInteractingRef = useRef(false);
  const onPointerDownPointerXRef = useRef(0);
  const onPointerDownPointerYRef = useRef(0);
  const onPointerDownLonRef = useRef(0);
  const onPointerDownLatRef = useRef(0);
  const lonRef = useRef(0);
  const latRef = useRef(0);
  const targetLonRef = useRef(0);
  const targetLatRef = useRef(0);

  // Initialize Three.js Equirectangular Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, width / height, 1, 1100);
    cameraRef.current = camera;

    // 2. Inverted Sphere Geometry for 360 Panorama
    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);

    // Initial Material Tint based on activeTheme
    const themeTint =
      activeTheme === "teal-velvet"
        ? new THREE.Color("#dcf0ee")
        : activeTheme === "champagne"
        ? new THREE.Color("#fbf3e4")
        : new THREE.Color("#ffffff");

    const material = new THREE.MeshBasicMaterial({
      color: themeTint,
    });
    sphereMaterialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    sphereMeshRef.current = mesh;
    scene.add(mesh);

    // 3. Texture Loader with High-Res Equirectangular Panorama
    // Reliable public equirectangular ballroom/palace panorama
    const textureLoader = new THREE.TextureLoader();
    const panoramaUrl =
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=2048&q=80";

    textureLoader.load(
      panoramaUrl,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        material.map = texture;
        material.needsUpdate = true;
        setIsLoadingTexture(false);
      },
      undefined,
      () => {
        // Fallback procedural starry luxury ballroom ambient canvas
        const canvas = document.createElement("canvas");
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 0, 1024);
          grad.addColorStop(0, "#070A0E");
          grad.addColorStop(0.5, "#0D1E1D");
          grad.addColorStop(1, "#182C2A");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 2048, 1024);

          // Draw ambient chandeliers & architectural gilded glow lines
          ctx.strokeStyle = "rgba(197, 160, 89, 0.4)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 2048; i += 128) {
            ctx.beginPath();
            ctx.arc(i, 300, 60, 0, Math.PI * 2);
            ctx.stroke();
          }
          const generatedTexture = new THREE.CanvasTexture(canvas);
          material.map = generatedTexture;
          material.needsUpdate = true;
        }
        setIsLoadingTexture(false);
      }
    );

    // 4. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 5. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera interpolation towards target lon/lat
      lonRef.current += (targetLonRef.current - lonRef.current) * 0.08;
      latRef.current += (targetLatRef.current - latRef.current) * 0.08;

      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      const targetX = 500 * Math.sin(phi) * Math.cos(theta);
      const targetY = 500 * Math.cos(phi);
      const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);
    };
    animate();

    // 6. Window Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Update Tablecloth Theme Tint
  useEffect(() => {
    if (!sphereMaterialRef.current) return;
    const themeTint =
      activeTheme === "teal-velvet"
        ? new THREE.Color("#dcf0ee")
        : activeTheme === "champagne"
        ? new THREE.Color("#fbf3e4")
        : new THREE.Color("#ffffff");

    sphereMaterialRef.current.color = themeTint;
    sphereMaterialRef.current.needsUpdate = true;
  }, [activeTheme]);

  // Mouse / Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isUserInteractingRef.current = true;
    onPointerDownPointerXRef.current = e.clientX;
    onPointerDownPointerYRef.current = e.clientY;
    onPointerDownLonRef.current = targetLonRef.current;
    onPointerDownLatRef.current = targetLatRef.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isUserInteractingRef.current) return;
    const deltaX = (onPointerDownPointerXRef.current - e.clientX) * 0.15;
    const deltaY = (e.clientY - onPointerDownPointerYRef.current) * 0.15;

    targetLonRef.current = onPointerDownLonRef.current + deltaX;
    targetLatRef.current = Math.max(-85, Math.min(85, onPointerDownLatRef.current + deltaY));
  };

  const handlePointerUp = () => {
    isUserInteractingRef.current = false;
  };

  // Zoom / Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const newFov = Math.max(35, Math.min(95, cameraRef.current.fov + e.deltaY * 0.05));
    cameraRef.current.fov = newFov;
    cameraRef.current.updateProjectionMatrix();
    setCurrentFov(Math.round(newFov));
  };

  const updateZoom = (delta: number) => {
    if (!cameraRef.current) return;
    const newFov = Math.max(35, Math.min(95, cameraRef.current.fov + delta));
    cameraRef.current.fov = newFov;
    cameraRef.current.updateProjectionMatrix();
    setCurrentFov(Math.round(newFov));
  };

  // Switch Hotspot Coordinates Smoothly
  const handleSelectHotspot = (spot: Hotspot) => {
    setActiveHotspotId(spot.id);
    targetLonRef.current = spot.lon;
    targetLatRef.current = spot.lat;
    if (cameraRef.current) {
      cameraRef.current.fov = spot.fov;
      cameraRef.current.updateProjectionMatrix();
      setCurrentFov(spot.fov);
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-teal-950 text-white overflow-hidden select-none">
      {/* Top Controls Bar */}
      <div className="flex h-14 items-center justify-between border-b border-gold-500/20 bg-teal-950/95 px-4 sm:px-6 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/floor-plan"
            className="flex items-center gap-1 text-xs font-semibold text-gold-300/80 hover:text-gold-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Floor Plan</span>
          </Link>
          <div className="h-4 w-px bg-gold-500/20" />
          <h1 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Compass className="h-4 w-4 text-gold-400" />
            <span className="gold-text-gradient">360° Photorealistic Venue Stager</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Buttons */}
          <div className="flex items-center rounded-lg border border-gold-500/30 bg-teal-900/60 p-1">
            <button
              type="button"
              onClick={() => updateZoom(8)}
              className="p-1 rounded hover:bg-gold-500/20 text-gold-200 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-mono text-gold-300">{currentFov}°</span>
            <button
              type="button"
              onClick={() => updateZoom(-8)}
              className="p-1 rounded hover:bg-gold-500/20 text-gold-200 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-lg border border-gold-500/30 bg-teal-900/60 p-2 text-gold-200 hover:bg-gold-500/20 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Stager Body: Left Decor Sidebar + 360 Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Interactive Decor & Hotspots */}
        <div className="w-80 border-r border-gold-500/20 bg-teal-950 p-5 flex flex-col justify-between overflow-y-auto z-20">
          <div className="space-y-6">
            {/* Tablecloth Theme Switcher */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400">
                <Palette className="h-4 w-4" />
                <span>Tablecloth & Linen Theme</span>
              </div>
              <p className="mt-1 text-xs text-teal-200/60">
                Dynamically switch spatial lighting and luxury linen textures.
              </p>

              <div className="mt-3 space-y-2">
                {[
                  {
                    id: "teal-velvet" as TableclothTheme,
                    name: "Royal Emerald & Obsidian Velvet",
                    desc: "Moody imperial emerald velvet styling",
                    colorClass: "bg-teal-800 border-gold-500/50",
                  },
                  {
                    id: "classic-white" as TableclothTheme,
                    name: "Classic Silk Ivory",
                    desc: "Crisp Parisian cotton & crystal candelabras",
                    colorClass: "bg-[#FAF8F5] border-gold-400/40 text-teal-950",
                  },
                  {
                    id: "champagne" as TableclothTheme,
                    name: "Imperial Champagne Gold",
                    desc: "Warm spun gold & candlelight tones",
                    colorClass: "bg-gold-100 border-gold-400 text-teal-950",
                  },
                ].map((theme) => {
                  const isActive = activeTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setTableclothTheme(theme.id)}
                      className={`w-full text-left rounded-xl border p-3 transition-all flex items-center justify-between ${
                        isActive
                          ? "border-gold-500 bg-teal-900/90 shadow-gold-glow/20 ring-1 ring-gold-500/50"
                          : "border-gold-500/15 bg-teal-900/30 hover:border-gold-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-6 w-6 rounded-full border shadow-sm ${theme.colorClass}`} />
                        <div>
                          <div className="text-xs font-semibold text-white">{theme.name}</div>
                          <div className="text-[10px] text-teal-200/60">{theme.desc}</div>
                        </div>
                      </div>
                      {isActive && <Check className="h-4 w-4 text-gold-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Perspective Camera Hot-Spots */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400">
                <MapPin className="h-4 w-4" />
                <span>Perspective Hotspots</span>
              </div>
              <p className="mt-1 text-xs text-teal-200/60">
                Smoothly pan camera to key venue coordinates.
              </p>

              <div className="mt-3 space-y-2">
                {VENUE_HOTSPOTS.map((spot) => {
                  const isActive = activeHotspotId === spot.id;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => handleSelectHotspot(spot)}
                      className={`w-full text-left rounded-xl border p-3 transition-all flex items-center justify-between ${
                        isActive
                          ? "border-gold-500 bg-teal-900 text-white shadow-sm ring-1 ring-gold-500/40"
                          : "border-gold-500/15 bg-teal-900/20 text-teal-200/80 hover:bg-teal-900/40"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{spot.name}</div>
                        <div className="text-[10px] text-teal-300/60 mt-0.5">{spot.desc}</div>
                      </div>
                      <Eye className={`h-4 w-4 ${isActive ? "text-gold-400" : "text-teal-600"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Guide */}
          <div className="mt-6 rounded-xl border border-gold-500/20 bg-teal-900/40 p-3 text-[11px] text-teal-200/70">
            <div className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span>Navigation Controls</span>
            </div>
            Click and drag with mouse to spin 360°. Scroll or pinch to zoom in/out.
          </div>
        </div>

        {/* 360 Panorama Viewer Container */}
        <div className="relative flex-1 bg-black">
          {/* Three.js Canvas mount target */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* Loading Indicator */}
          {isLoadingTexture && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-teal-950/80 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-400 mb-3" />
              <div className="font-serif text-sm font-semibold tracking-wide text-white">
                Staging Photorealistic 360° Panorama...
              </div>
              <div className="text-xs text-gold-300/60 mt-1">Calibrating spherical lighting</div>
            </div>
          )}

          {/* In-Scene Floating Hotspot Pins Overlay */}
          <div className="pointer-events-none absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div className="rounded-full bg-teal-950/90 backdrop-blur-md px-4 py-1.5 border border-gold-500/30 text-xs text-white flex items-center gap-2 shadow-lg">
              <span className="h-2 w-2 rounded-full bg-gold-400 animate-ping" />
              <span>Active Vantage: <strong className="text-gold-300">{VENUE_HOTSPOTS.find((s) => s.id === activeHotspotId)?.name}</strong></span>
            </div>
            <div className="rounded-full bg-teal-950/90 backdrop-blur-md px-4 py-1.5 border border-gold-500/30 text-xs text-gold-300 shadow-lg">
              Linen Tone: {activeTheme.replace("-", " ").toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
