import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

export function CanvasStage({
  isDrawer = false,
  currentTool = 'pencil',
  brushColor = '#0F172A',
  brushSize = 6,
  canvasRef = null,
}) {
  const { socket, currentRoom, sendStroke } = useGame();
  const localRef = useRef(null);
  const activeCanvas = canvasRef || localRef;
  const isDrawing = useRef(false);
  const lastCoord = useRef({ x: 0, y: 0, normX: 0, normY: 0 });

  // Draw incoming vector stroke on canvas
  const renderStroke = (stroke, canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    if (stroke.type === 'dot') {
      const x = stroke.x * rect.width;
      const y = stroke.y * rect.height;
      const size = stroke.size || 6;
      ctx.beginPath();
      ctx.arc(x, y, (stroke.tool === 'eraser' ? size * 2 : size) / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
      ctx.fill();
    } else if (stroke.type === 'line') {
      const fromX = stroke.fromX * rect.width;
      const fromY = stroke.fromY * rect.height;
      const toX = stroke.toX * rect.width;
      const toY = stroke.toY * rect.height;
      const size = stroke.size || 6;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = stroke.tool === 'eraser' ? '#FFFFFF' : stroke.color;
      ctx.lineWidth = stroke.tool === 'eraser' ? size * 2.5 : size;
      ctx.stroke();
    }
  };

  // Canvas High-DPI setup & Socket Listener binding
  useEffect(() => {
    const canvas = activeCanvas.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Temporary copy to avoid clearing on resize
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tempCanvas.width > 0 && tempCanvas.height > 0) {
        ctx.drawImage(tempCanvas, 0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Socket: Receive drawing strokes from drawer
    const onRemoteStroke = (stroke) => {
      renderStroke(stroke, canvas);
    };

    // Socket: Clear Canvas
    const onRemoteClear = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    if (socket) {
      socket.on('drawing:stroke', onRemoteStroke);
      socket.on('drawing:clear', onRemoteClear);

      // Reconnect / Late Sync
      if (currentRoom?.id) {
        socket.emit('drawing:sync', { roomId: currentRoom.id }, (res) => {
          if (res?.strokes && Array.isArray(res.strokes)) {
            res.strokes.forEach((s) => renderStroke(s, canvas));
          }
        });
      }
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (socket) {
        socket.off('drawing:stroke', onRemoteStroke);
        socket.off('drawing:clear', onRemoteClear);
      }
    };
  }, [activeCanvas, socket, currentRoom]);

  const getCanvasCoordinates = (e) => {
    const canvas = activeCanvas.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return {
      x,
      y,
      normX: Math.max(0, Math.min(1, x / rect.width)),
      normY: Math.max(0, Math.min(1, y / rect.height)),
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
    ctx.arc(
      coords.x,
      coords.y,
      (currentTool === 'eraser' ? brushSize * 2 : brushSize) / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = currentTool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.fill();

    // Broadcast dot event
    sendStroke({
      type: 'dot',
      x: coords.normX,
      y: coords.normY,
      tool: currentTool,
      color: brushColor,
      size: brushSize,
    });
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

    // Broadcast line event
    sendStroke({
      type: 'line',
      fromX: lastCoord.current.normX,
      fromY: lastCoord.current.normY,
      toX: coords.normX,
      toY: coords.normY,
      tool: currentTool,
      color: brushColor,
      size: brushSize,
    });

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
        style={{
          cursor: isDrawer
            ? currentTool === 'eraser'
              ? 'cell'
              : 'crosshair'
            : 'default',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {!isDrawer && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 16,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-light)',
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          👀 Guessing Mode — Watch the canvas in real time
        </div>
      )}
    </div>
  );
}

export default CanvasStage;
