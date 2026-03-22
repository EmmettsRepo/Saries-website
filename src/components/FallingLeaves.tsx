"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

interface Leaf {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  speedX: number;
  speedY: number;
  wobblePhase: number;
  wobbleSpeed: number;
  opacity: number;
  green: number;
  shape: number;
  blownAway: boolean;
}

function createLeaf(canvasWidth: number): Leaf {
  return {
    x: Math.random() * canvasWidth,
    y: -20 - Math.random() * 40,
    size: 8 + Math.random() * 14,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: 0.3 + Math.random() * 0.5,
    wobblePhase: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.01 + Math.random() * 0.015,
    opacity: 0.15 + Math.random() * 0.15,
    green: 120 + Math.floor(Math.random() * 60),
    shape: Math.floor(Math.random() * 3),
    blownAway: false,
  };
}

function drawLeaf(ctx: CanvasRenderingContext2D, leaf: Leaf) {
  ctx.save();
  ctx.translate(leaf.x, leaf.y);
  ctx.rotate(leaf.rotation);
  ctx.globalAlpha = leaf.opacity;

  const g = leaf.green;
  const color = `rgb(${Math.floor(g * 0.45)}, ${g}, ${Math.floor(g * 0.4)})`;
  ctx.fillStyle = color;
  ctx.beginPath();

  const s = leaf.size;

  if (leaf.shape === 0) {
    ctx.ellipse(0, 0, s * 0.4, s * 0.7, 0, 0, Math.PI * 2);
  } else if (leaf.shape === 1) {
    ctx.moveTo(0, -s * 0.7);
    ctx.quadraticCurveTo(s * 0.5, -s * 0.2, s * 0.3, s * 0.3);
    ctx.quadraticCurveTo(0, s * 0.7, -s * 0.3, s * 0.3);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.2, 0, -s * 0.7);
  } else {
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 0.6, s * 0.3, 0, s * 0.6);
    ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.6, -s * 0.5, 0, -s * 0.5);
  }

  ctx.fill();

  ctx.strokeStyle = color;
  ctx.globalAlpha = leaf.opacity * 0.4;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(0, s * 0.5);
  ctx.stroke();

  ctx.restore();
}

declare global {
  interface Window {
    __blowLeavesAway?: () => void;
  }
}

export default function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leavesRef = useRef<Leaf[]>([]);
  const frameRef = useRef<number>(0);
  const pauseSpawnUntilRef = useRef(0);
  const mouseRef = useRef({ x: -999, y: -999 });

  const getRM = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const subRM = (cb: () => void) => { const mq = window.matchMedia("(prefers-reduced-motion: reduce)"); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); };
  const prefersReducedMotion = useSyncExternalStore(subRM, getRM, () => false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track mouse position
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });

    // Start with a few leaves already on screen
    leavesRef.current = Array.from({ length: 6 }, () =>
      createLeaf(canvas.width)
    );

    // Blow away on page switch
    window.__blowLeavesAway = () => {
      leavesRef.current.forEach((leaf) => {
        leaf.blownAway = true;
        const angle = (Math.random() - 0.5) * Math.PI * 0.8;
        const force = 8 + Math.random() * 12;
        leaf.speedX = Math.cos(angle) * force * (Math.random() > 0.5 ? 1 : -1);
        leaf.speedY = -Math.abs(Math.sin(angle) * force) - 2;
        leaf.rotationSpeed = (Math.random() - 0.5) * 0.15;
      });
      pauseSpawnUntilRef.current = Date.now() + 1500;
    };

    const maxLeaves = 36;
    let spawnTimer = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = Date.now();
      const canSpawn = now > pauseSpawnUntilRef.current;

      spawnTimer++;
      if (canSpawn && spawnTimer > 60 && leavesRef.current.length < maxLeaves) {
        if (Math.random() < 0.9) {
          leavesRef.current.push(createLeaf(canvas.width));
        }
        spawnTimer = 0;
      }

      leavesRef.current = leavesRef.current.filter((leaf) => {
        if (leaf.blownAway) {
          leaf.x += leaf.speedX;
          leaf.y += leaf.speedY;
          leaf.rotation += leaf.rotationSpeed;
          leaf.opacity -= 0.008;
          leaf.speedY += 0.05;
          drawLeaf(ctx, leaf);
          return leaf.opacity > 0.01;
        }

        // Check cursor proximity — blow leaf away if close
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dx = leaf.x - mx;
        const dy = leaf.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50) {
          leaf.blownAway = true;
          // Push away from cursor
          const angle = Math.atan2(dy, dx);
          const force = 4 + Math.random() * 4;
          leaf.speedX = Math.cos(angle) * force;
          leaf.speedY = Math.sin(angle) * force;
          leaf.rotationSpeed = (Math.random() - 0.5) * 0.12;
          drawLeaf(ctx, leaf);
          return true;
        }

        leaf.wobblePhase += leaf.wobbleSpeed;
        leaf.x += leaf.speedX + Math.sin(leaf.wobblePhase) * 0.4;
        leaf.y += leaf.speedY;
        leaf.rotation += leaf.rotationSpeed;

        leaf.speedX += (Math.random() - 0.5) * 0.01;
        leaf.speedX = Math.max(-0.8, Math.min(0.8, leaf.speedX));

        if (leaf.y > canvas.height * 0.85) {
          leaf.opacity -= 0.001;
        }

        drawLeaf(ctx, leaf);

        return leaf.y < canvas.height + 30 && leaf.opacity > 0.01;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      delete window.__blowLeavesAway;
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
