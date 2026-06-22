import { useEffect, useRef } from 'react';

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

    // Global mouse listener for full-screen parallax rotation
    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX - width / 2;
      const mouseY = event.clientY - height / 2;
      targetRotateY = (mouseX / (width / 2)) * 0.3;
      targetRotateX = -(mouseY / (height / 2)) * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const vertices = [
      { x: -1, y: -1, z: -1 },
      { x: 1, y: -1, z: -1 },
      { x: 1, y: 1, z: -1 },
      { x: -1, y: 1, z: -1 },
      { x: -1, y: -1, z: 1 },
      { x: 1, y: -1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: -1, y: 1, z: 1 },
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    // Generate 7 floating cubes distributed across screen coordinates
    const cubes = [
      { x: -width * 0.35, y: -height * 0.3, z: 100, size: 55, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.002, speedY: 0.003, speedZ: 0.001 },
      { x: width * 0.35, y: -height * 0.25, z: -50, size: 65, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.001, speedY: 0.002, speedZ: 0.003 },
      { x: -width * 0.3, y: height * 0.3, z: 0, size: 50, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.003, speedY: 0.001, speedZ: 0.002 },
      { x: width * 0.3, y: height * 0.35, z: -100, size: 60, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.002, speedY: 0.002, speedZ: 0.002 },
      { x: -width * 0.1, y: -height * 0.4, z: -20, size: 40, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.001, speedY: 0.004, speedZ: 0.001 },
      { x: width * 0.1, y: height * 0.4, z: 80, size: 45, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.004, speedY: 0.001, speedZ: 0.003 },
      { x: 0, y: 0, z: -150, size: 70, rx: Math.random(), ry: Math.random(), rz: Math.random(), speedX: 0.001, speedY: 0.001, speedZ: 0.001 },
    ];

    // Generate 60 floating particles in 3D space
    const particles: { x: number; y: number; z: number; speedZ: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: (Math.random() - 0.5) * 500,
        speedZ: 0.1 + Math.random() * 0.25,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      rotateX += (targetRotateX - rotateX) * 0.04;
      rotateY += (targetRotateY - rotateY) * 0.04;

      const isLightMode = document.documentElement.dataset.theme === 'light';
      
      const lineColor = isLightMode 
        ? 'rgba(6, 182, 212, 0.03)' 
        : 'rgba(56, 189, 248, 0.06)';
      const nodeColor = isLightMode
        ? 'rgba(16, 185, 129, 0.05)' 
        : 'rgba(52, 211, 153, 0.09)';
      const particleColor = isLightMode
        ? 'rgba(6, 182, 212, 0.12)'
        : 'rgba(56, 189, 248, 0.18)';

      // Draw floating dust
      ctx.fillStyle = particleColor;
      particles.forEach((p) => {
        p.z -= p.speedZ;
        if (p.z < -250) p.z = 250;

        const cosX = Math.cos(rotateX * 0.4);
        const sinX = Math.sin(rotateX * 0.4);
        const cosY = Math.cos(rotateY * 0.4);
        const sinY = Math.sin(rotateY * 0.4);

        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;
        let x2 = p.x * cosY - z1 * sinY;
        let z2 = p.x * sinY + z1 * cosY;

        const fov = 500;
        const scale = fov / (fov + z2);
        const px = width / 2 + x2 * scale;
        const py = height / 2 + y1 * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, 1.3 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw floating wireframe cubes
      cubes.forEach((cube) => {
        cube.rx += cube.speedX;
        cube.ry += cube.speedY;
        cube.rz += cube.speedZ;

        const finalRx = cube.rx + rotateX;
        const finalRy = cube.ry + rotateY;
        const finalRz = cube.rz;

        const projected: { x: number; y: number }[] = [];

        vertices.forEach((v) => {
          let x = v.x * cube.size;
          let y = v.y * cube.size;
          let z = v.z * cube.size;

          const cosX = Math.cos(finalRx);
          const sinX = Math.sin(finalRx);
          let y1 = y * cosX - z * sinX;
          let z1 = y * sinX + z * cosX;

          const cosY = Math.cos(finalRy);
          const sinY = Math.sin(finalRy);
          let x2 = x * cosY - z1 * sinY;
          let z2 = x * sinY + z1 * cosY;

          const cosZ = Math.cos(finalRz);
          const sinZ = Math.sin(finalRz);
          let x3 = x2 * cosZ - y1 * sinZ;
          let y3 = x2 * sinZ + y1 * cosZ;

          const finalX = x3 + cube.x;
          const finalY = y3 + cube.y;
          const finalZ = z2 + cube.z;

          const fov = 500;
          const scale = fov / (fov + finalZ);
          
          projected.push({
            x: width / 2 + finalX * scale,
            y: height / 2 + finalY * scale,
          });
        });

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        edges.forEach((edge) => {
          const p1 = projected[edge[0]];
          const p2 = projected[edge[1]];
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        });

        ctx.fillStyle = nodeColor;
        projected.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
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
