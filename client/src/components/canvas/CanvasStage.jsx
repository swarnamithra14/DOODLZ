import React, { useRef, useEffect } from 'react';

export function CanvasStage({
  isDrawer = true,
  currentTool = 'pencil',
  brushColor = '#0F172A',
  brushSize = 6,
  onDrawStroke = null,
  canvasRef = null,
}) {
  const localRef = useRef(null);
  const activeCanvas = canvasRef || localRef;
  const isDrawing = useRef(false);
  const lastCoord = useRef({ x: 0, y: 0 });

  // Handle high-DPI scaling and resizing
  useEffect(() => {
    const canvas = activeCanvas.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Save current content if any
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Restore
      ctx.drawImage(tempCanvas, 0, 0, canvas.width / dpr, canvas.height / dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [activeCanvas]);

  const getCanvasCoordinates = (e) => {
    const canvas = activeCanvas.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      normalizedX: (clientX - rect.left) / rect.width,
      normalizedY: (clientY - rect.top) / rect.height,
    };
  };

  const handlePointerDown = (e) => {
    if (!isDrawer) return;
    const canvas = activeCanvas.current;
    const coords = getCanvasCoordinates(e);

    isDrawing.current = true;
    lastCoord.current = coords;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, (currentTool === 'eraser' ? brushSize * 2 : brushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = currentTool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.fill();

    if (onDrawStroke) {
      onDrawStroke({
        type: 'dot',
        x: coords.normalizedX,
        y: coords.normalizedY,
        tool: currentTool,
        color: brushColor,
        size: brushSize,
      });
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || !isDrawer) return;
    const canvas = activeCanvas.current;
    const coords = getCanvasCoordinates(e);
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(lastCoord.current.x, lastCoord.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.lineWidth = currentTool === 'eraser' ? brushSize * 2.5 : brushSize;
    ctx.stroke();

    if (onDrawStroke) {
      onDrawStroke({
        type: 'line',
        fromX: lastCoord.current.normalizedX,
        fromY: lastCoord.current.normalizedY,
        toX: coords.normalizedX,
        toY: coords.normalizedY,
        tool: currentTool,
        color: brushColor,
        size: brushSize,
      });
    }

    lastCoord.current = coords;
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <div className="canvas-viewport">
      <canvas
        ref={activeCanvas}
        className="canvas-element"
        style={{ cursor: isDrawer ? (currentTool === 'eraser' ? 'cell' : 'crosshair') : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {!isDrawer && (
        <div style={{ position: 'absolute', top: 12, left: 16, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', border: '1px solid var(--border-light)', pointerEvents: 'none' }}>
          👀 Guessing Mode — Canvas is read-only
        </div>
      )}
    </div>
  );
}

export default CanvasStage;
