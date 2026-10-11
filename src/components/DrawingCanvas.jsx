import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  Eraser, 
  Paintbrush, 
  Circle,
  Eye
} from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 560;

const PALETTE = [
  '#181824', // Midnight Ink
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber / Gold
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#EC4899', // Pink
  '#78350F', // Brown
  '#FFFFFF'  // White
];

const BRUSH_SIZES = [
  { label: 'S', size: 4 },
  { label: 'M', size: 9 },
  { label: 'L', size: 18 },
  { label: 'XL', size: 30 }
];

export default function DrawingCanvas({
  isDrawer = true,
  strokes = [],
  onStrokesChange,
  onClearCanvas
}) {
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState('#181824');
  const [currentSize, setCurrentSize] = useState(9);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef(null);

  // Redraw all strokes onto the canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background to clean paper white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Render all saved strokes
    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = stroke.size;
      ctx.strokeStyle = stroke.isEraser ? '#FFFFFF' : stroke.color;

      ctx.beginPath();
      const pts = stroke.points;
      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.isEraser ? '#FFFFFF' : stroke.color;
        ctx.fill();
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    });

    // Render currently active stroke (if in progress)
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      const active = currentStrokeRef.current;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = active.size;
      ctx.strokeStyle = active.isEraser ? '#FFFFFF' : active.color;

      ctx.beginPath();
      const pts = active.points;
      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, active.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = active.isEraser ? '#FFFFFF' : active.color;
        ctx.fill();
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [strokes]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Compute scaled coordinates inside the 800x560 canvas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e) => {
    if (!isDrawer) return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);

    const pt = getCoordinates(e);
    const newStroke = {
      id: 's_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      color: currentColor,
      size: currentSize,
      isEraser: isEraser,
      points: [pt]
    };

    currentStrokeRef.current = newStroke;
    setIsDrawing(true);
    redrawCanvas();
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !isDrawer || !currentStrokeRef.current) return;
    e.preventDefault();

    const pt = getCoordinates(e);
    currentStrokeRef.current.points.push(pt);
    redrawCanvas();
  };

  const finishDrawing = (e) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    if (e && canvasRef.current?.hasPointerCapture(e.pointerId)) {
      canvasRef.current.releasePointerCapture(e.pointerId);
    }

    const completedStroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    setIsDrawing(false);

    if (completedStroke.points.length > 0 && onStrokesChange) {
      onStrokesChange([...strokes, completedStroke]);
    }
  };

  // Undo last stroke
  const handleUndo = () => {
    if (!isDrawer || strokes.length === 0 || !onStrokesChange) return;
    const next = strokes.slice(0, -1);
    onStrokesChange(next);
  };

  // Clear all strokes
  const handleClear = () => {
    if (!isDrawer) return;
    if (onClearCanvas) {
      onClearCanvas();
    } else if (onStrokesChange) {
      onStrokesChange([]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Canvas Frame */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '800 / 560',
          backgroundColor: '#FFFFFF',
          border: '3px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          touchAction: 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: isDrawer ? (isEraser ? 'cell' : 'crosshair') : 'default'
          }}
        />

        {/* Guesser View-Only Indicator Watermark */}
        {!isDrawer && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(24, 24, 36, 0.75)',
              color: '#FFFFFF',
              backdropFilter: 'blur(3px)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              pointerEvents: 'none'
            }}
          >
            <Eye size={14} /> View Only
          </div>
        )}
      </div>

      {/* Drawer Controls Bar */}
      {isDrawer ? (
        <div 
          className="doodle-card"
          style={{
            marginTop: '0.85rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}
        >
          {/* Colors Palette */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {PALETTE.map((color) => {
              const isSelected = !isEraser && currentColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setCurrentColor(color);
                    setIsEraser(false);
                  }}
                  aria-label={`Color ${color}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: isSelected ? '3px solid var(--color-border)' : '2px solid rgba(0,0,0,0.15)',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                />
              );
            })}
          </div>

          {/* Tools & Size Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Brush Sizes */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: 'var(--color-bg-alt)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-border-subtle)'
              }}
            >
              {BRUSH_SIZES.map((b) => {
                const isSelected = currentSize === b.size;
                return (
                  <button
                    key={b.size}
                    type="button"
                    onClick={() => setCurrentSize(b.size)}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--color-border)' : '1px solid transparent',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>

            {/* Eraser Toggle */}
            <button
              type="button"
              className={`btn ${isEraser ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setIsEraser(!isEraser)}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              title="Eraser tool"
            >
              <Eraser size={16} />
              <span>Eraser</span>
            </button>

            {/* Undo */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
              title="Undo last stroke"
            >
              <RotateCcw size={16} />
              <span>Undo</span>
            </button>

            {/* Clear */}
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClear}
              disabled={strokes.length === 0}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', color: '#EF4444' }}
              title="Clear entire canvas"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Watch the canvas and type your guess in the chat on the right!
        </div>
      )}
    </div>
  );
}
