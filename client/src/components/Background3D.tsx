import { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Polyhedron {
  type: 'cube' | 'pyramid';
  x: number;
  y: number;
  z: number;
  size: number;
  rx: number;
  ry: number;
  rz: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  colorType: 'cyan' | 'purple' | 'emerald';
  // Hover offsets
  hoverOffset: number;
  hoverSpeed: number;
}

export function Background3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    let targetRotateX = 0;
    let targetRotateY = 0;
    let rotateX = 0;
    let rotateY = 0;
    let time = 0;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse movement listeners
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX - width / 2;
      const mouseY = event.clientY - height / 2;
      targetRotateY = (mouseX / (width / 2)) * 0.45;
      targetRotateX = -(mouseY / (height / 2)) * 0.45;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3D Shape Geometries
    // Cube Geometry (8 vertices, 6 faces)
    const cubeVertices: Point3D[] = [
      { x: -1, y: -1, z: -1 },
      { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: -1, y: 1, z: 1 },
    ];

    const cubeFaces = [
      [0, 1, 2, 3], // Back
      [4, 5, 6, 7], // Front
      [0, 1, 5, 4], // Bottom
      [2, 3, 7, 6], // Top
      [0, 3, 7, 4], // Left
      [1, 2, 6, 5], // Right
    ];

    // Pyramid Geometry (4 vertices, 4 triangular faces)
    const pyramidVertices: Point3D[] = [
      { x: 0, y: -1.1, z: 0 },       // Top
      { x: -1, y: 0.8, z: -0.8 },    // Bottom Left Back
      { x: 1, y: 0.8, z: -0.8 },     // Bottom Right Back
      { x: 0, y: 0.8, z: 1.1 },      // Bottom Front
    ];

    const pyramidFaces = [
      [0, 1, 2], // Back Face
      [0, 2, 3], // Right Face
      [0, 3, 1], // Left Face
      [1, 2, 3], // Bottom Face
    ];

    // Generate 7 premium crystal shapes
    const polyhedra: Polyhedron[] = [
      { type: 'cube', x: -width * 0.35, y: -height * 0.25, z: 80, size: 50, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.003, speedY: 0.005, speedZ: 0.002, colorType: 'cyan', hoverOffset: Math.random() * 100, hoverSpeed: 0.0015 },
      { type: 'pyramid', x: width * 0.36, y: -height * 0.22, z: -40, size: 60, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.002, speedY: 0.004, speedZ: 0.003, colorType: 'purple', hoverOffset: Math.random() * 100, hoverSpeed: 0.002 },
      { type: 'cube', x: -width * 0.32, y: height * 0.28, z: 0, size: 45, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.004, speedY: 0.002, speedZ: 0.003, colorType: 'emerald', hoverOffset: Math.random() * 100, hoverSpeed: 0.0018 },
      { type: 'pyramid', x: width * 0.32, y: height * 0.32, z: -80, size: 55, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.003, speedY: 0.003, speedZ: 0.004, colorType: 'cyan', hoverOffset: Math.random() * 100, hoverSpeed: 0.0025 },
      { type: 'cube', x: -width * 0.1, y: -height * 0.38, z: -20, size: 38, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.002, speedY: 0.005, speedZ: 0.002, colorType: 'purple', hoverOffset: Math.random() * 100, hoverSpeed: 0.0012 },
      { type: 'pyramid', x: width * 0.12, y: height * 0.38, z: 70, size: 42, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.005, speedY: 0.002, speedZ: 0.005, colorType: 'emerald', hoverOffset: Math.random() * 100, hoverSpeed: 0.0022 },
      { type: 'cube', x: 0, y: height * 0.15, z: -140, size: 65, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.001, speedY: 0.002, speedZ: 0.001, colorType: 'cyan', hoverOffset: Math.random() * 100, hoverSpeed: 0.001 },
    ];

    // Generate 55 background particles
    const particles: { x: number; y: number; z: number; speedZ: number }[] = [];
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.6,
        y: (Math.random() - 0.5) * height * 1.6,
        z: (Math.random() - 0.5) * 400,
        speedZ: 0.12 + Math.random() * 0.22,
      });
    }

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Dampen rotation target adjustments
      rotateX += (targetRotateX - rotateX) * 0.045;
      rotateY += (targetRotateY - rotateY) * 0.045;

      const isLightMode = document.documentElement.dataset.theme === 'light';

      // Colors defined based on theme
      const nodeColors = {
        cyan: isLightMode ? 'rgba(6, 182, 212, 0.45)' : 'rgba(56, 189, 248, 0.55)',
        purple: isLightMode ? 'rgba(139, 92, 246, 0.45)' : 'rgba(192, 132, 252, 0.55)',
        emerald: isLightMode ? 'rgba(16, 185, 129, 0.45)' : 'rgba(52, 211, 153, 0.55)',
      };

      const particleColor = isLightMode
        ? 'rgba(99, 102, 241, 0.26)' // Violet in light mode
        : 'rgba(56, 189, 248, 0.32)'; // Neon Cyan in dark mode

      // 1. Draw floating particles
      const projectedParticles: { x: number; y: number; scale: number; visible: boolean }[] = [];
      
      ctx.fillStyle = particleColor;
      particles.forEach((p) => {
        p.z -= p.speedZ;
        if (p.z < -200) p.z = 200;

        const cosX = Math.cos(rotateX * 0.35);
        const sinX = Math.sin(rotateX * 0.35);
        const cosY = Math.cos(rotateY * 0.35);
        const sinY = Math.sin(rotateY * 0.35);

        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;
        let x2 = p.x * cosY - z1 * sinY;
        let z2 = p.x * sinY + z1 * cosY;

        const fov = 500;
        const scale = fov / (fov + z2);
        const px = width / 2 + x2 * scale;
        const py = height / 2 + y1 * scale;

        const visible = px >= 0 && px <= width && py >= 0 && py <= height;
        projectedParticles.push({ x: px, y: py, scale, visible });

        if (visible) {
          ctx.beginPath();
          ctx.arc(px, py, 1.4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 2. Draw connecting paths between close particles (constellation grid)
      for (let i = 0; i < projectedParticles.length; i++) {
        for (let j = i + 1; j < projectedParticles.length; j++) {
          const p1 = projectedParticles[i];
          const p2 = projectedParticles[j];
          if (!p1.visible || !p2.visible) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * (isLightMode ? 0.16 : 0.22);
            ctx.strokeStyle = isLightMode 
              ? `rgba(99, 102, 241, ${alpha})` 
              : `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.65;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw 3D Crystals using Painter's Algorithm (sorting faces back-to-front)
      polyhedra.forEach((poly) => {
        poly.rx += poly.speedX;
        poly.ry += poly.speedY;
        poly.rz += poly.speedZ;

        const finalRx = poly.rx + rotateX;
        const finalRy = poly.ry + rotateY;
        const finalRz = poly.rz;

        // Apply Hover floating sine offset
        const hoverOffset = Math.sin(time * 2 + poly.hoverOffset) * 12;

        const refVertices = poly.type === 'cube' ? cubeVertices : pyramidVertices;
        const refFaces = poly.type === 'cube' ? cubeFaces : pyramidFaces;

        // Rotate and project all vertices
        const rotatedVerts: Point3D[] = [];
        const projectedVerts: { x: number; y: number }[] = [];

        refVertices.forEach((v) => {
          let x = v.x * poly.size;
          let y = v.y * poly.size;
          let z = v.z * poly.size;

          // Rotate X
          const cosX = Math.cos(finalRx);
          const sinX = Math.sin(finalRx);
          let y1 = y * cosX - z * sinX;
          let z1 = y * sinX + z * cosX;

          // Rotate Y
          const cosY = Math.cos(finalRy);
          const sinY = Math.sin(finalRy);
          let x2 = x * cosY - z1 * sinY;
          let z2 = x * sinY + z1 * cosY;

          // Rotate Z
          const cosZ = Math.cos(finalRz);
          const sinZ = Math.sin(finalRz);
          let x3 = x2 * cosZ - y1 * sinZ;
          let y3 = x2 * sinZ + y1 * cosZ;

          // Translate with layout center, drift coordinates, and sine wave hovering offset
          const finalX = x3 + poly.x;
          const finalY = y3 + poly.y + hoverOffset;
          const finalZ = z2 + poly.z;

          rotatedVerts.push({ x: finalX, y: finalY, z: finalZ });

          const fov = 500;
          const scale = fov / (fov + finalZ);
          projectedVerts.push({
            x: width / 2 + finalX * scale,
            y: height / 2 + finalY * scale,
          });
        });

        // Face sorting structure
        const facesWithDepth = refFaces.map((indices, faceIndex) => {
          // Average Z depth of the face
          const avgZ = indices.reduce((sum, idx) => sum + rotatedVerts[idx].z, 0) / indices.length;
          return { indices, avgZ, faceIndex };
        });

        // Sort deepest faces first
        facesWithDepth.sort((a, b) => b.avgZ - a.avgZ);

        // Draw faces
        facesWithDepth.forEach(({ indices }) => {
          // Create crystal face color fill gradients
          let fillColor = '';
          let strokeColor = '';

          if (poly.colorType === 'cyan') {
            fillColor = isLightMode ? 'rgba(6, 182, 212, 0.08)' : 'rgba(56, 189, 248, 0.11)';
            strokeColor = isLightMode ? 'rgba(6, 182, 212, 0.38)' : 'rgba(56, 189, 248, 0.45)';
          } else if (poly.colorType === 'purple') {
            fillColor = isLightMode ? 'rgba(139, 92, 246, 0.08)' : 'rgba(192, 132, 252, 0.11)';
            strokeColor = isLightMode ? 'rgba(139, 92, 246, 0.38)' : 'rgba(192, 132, 252, 0.45)';
          } else {
            fillColor = isLightMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(52, 211, 153, 0.11)';
            strokeColor = isLightMode ? 'rgba(16, 185, 129, 0.38)' : 'rgba(52, 211, 153, 0.45)';
          }

          ctx.fillStyle = fillColor;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.25;

          ctx.beginPath();
          indices.forEach((idx, i) => {
            const p = projectedVerts[idx];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });

        // Draw structural nodes (vertices)
        ctx.fillStyle = nodeColors[poly.colorType];
        projectedVerts.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
