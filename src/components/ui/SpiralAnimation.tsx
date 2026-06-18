"use client";

import React, { useEffect, useRef } from "react";

export function SpiralAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    let rotation = 0;

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      const arms = 3;
      const dotsPerArm = 150;
      rotation += 0.0015; // Slow premium rotation

      for (let arm = 0; arm < arms; arm++) {
        const armAngle = (arm * 2 * Math.PI) / arms + rotation;

        for (let i = 0; i < dotsPerArm; i++) {
          const t = i / dotsPerArm; // normalized distance along arm
          
          // Logarithmic spiral math: angle increases as radius increases
          const tightness = 2.8; 
          const angle = armAngle + t * tightness * Math.PI * 2;
          // Distribute radius exponentially for high-prestige spacing density
          const radius = Math.pow(t, 1.6) * Math.min(width, height) * 0.7;

          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          // Fade out towards edge and center using a smooth sine wave
          const opacity = Math.sin(t * Math.PI) * 0.22;

          // Premium color interpolation along the arm length
          let color = "#00C9A7"; // Primary Teal
          if (t > 0.65) {
            color = "#7C3AED"; // Accent Violet
          } else if (t > 0.3) {
            color = "#00B4FF"; // Secondary Sky
          }

          ctx.beginPath();
          ctx.arc(x, y, 1.2 + t * 2.5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          
          // Apply canvas context configuration safely
          ctx.globalAlpha = opacity;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 0 }} 
    />
  );
}
