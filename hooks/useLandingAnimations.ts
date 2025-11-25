
import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks mouse position to create a 3D tilt effect.
 * Calculates rotation values based on the mouse's distance from the center of the viewport.
 * 
 * @param {number} [intensity=15] - The maximum degrees of rotation.
 * @returns {Object} An object containing 'x' and 'y' rotation degrees.
 */
export const useMouseTilt = (intensity = 15) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate percentage from center (-0.5 to 0.5)
      const xPct = (e.clientX / window.innerWidth) - 0.5;
      const yPct = (e.clientY / window.innerHeight) - 0.5;
      
      // Target rotation values
      // Moving mouse right (positive x) should rotate Y axis positively
      // Moving mouse down (positive y) should rotate X axis negatively (tilt back)
      const targetX = -yPct * intensity;
      const targetY = xPct * intensity;

      animationFrameId = requestAnimationFrame(() => {
        setTilt({ x: targetX, y: targetY }); 
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return tilt;
};
