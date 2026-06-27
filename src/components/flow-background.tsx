"use client";

import { useEffect, useRef } from "react";

type FlowLine = {
  y: number;
  amplitude: number;
  speed: number;
  offset: number;
  frequency: number;
  opacity: number;
  lineWidth: number;
};

const LINE_COUNT = 15;

export default function FlowBackground() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationId = 0;
    let lines: FlowLine[] = [];

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      width = host.clientWidth;
      height = host.clientHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      lines = [];
      for (let i = 0; i < LINE_COUNT; i += 1) {
        lines.push({
          y: height * (0.3 + Math.random() * 0.5),
          amplitude: 40 + Math.random() * 60,
          speed: (0.0002 + Math.random() * 0.0003) * 0.7,
          offset: Math.random() * Math.PI * 2,
          frequency: 0.0004 + Math.random() * 0.0004,
          opacity: 0.2 + Math.random() * 0.3,
          lineWidth: 1.2 + Math.random() * 1.0
        });
      }
    };

    const drawFlowLines = (time: number) => {
      lines.forEach((line) => {
        ctx.beginPath();
        ctx.lineWidth = line.lineWidth;
        ctx.strokeStyle = `rgba(190, 215, 255, ${line.opacity})`;

        for (let x = 0; x < width; x += 3) {
          const mainWave = Math.sin(
            x * line.frequency + time * line.speed + line.offset
          );
          const subWave = Math.sin(x * 0.004 + time * (line.speed * 4)) * 0.2;
          const y = line.y + (mainWave + subWave) * line.amplitude;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.stroke();
      });
    };

    const animate = (now: number) => {
      ctx.fillStyle = "#05070a";
      ctx.fillRect(0, 0, width, height);

      drawFlowLines(now);
      animationId = window.requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => init());
      resizeObserver.observe(host);
    }

    init();
    animate(performance.now());
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 z-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
