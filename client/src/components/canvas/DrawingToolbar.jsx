import React from 'react';
import { Edit2, Eraser, Trash2, Pipette } from 'lucide-react';

const PALETTE_COLORS = [
  '#0F172A', // Slate 900
  '#64748B', // Slate 500
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#10B981', // Green
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#78350F', // Brown
];

const BRUSH_SIZES = [
  { label: 'S', size: 3, dotSize: 4 },
  { label: 'M', size: 7, dotSize: 7 },
  { label: 'L', size: 14, dotSize: 11 },
  { label: 'XL', size: 24, dotSize: 15 },
];

export function DrawingToolbar({
  currentTool,
  setCurrentTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  onClearCanvas,
}) {
  return (
    <div className="drawing-toolbar">
      {/* Tool Mode (Pencil / Eraser) */}
      <div className="toolbar-group">
        <button
          className={`tool-btn ${currentTool === 'pencil' ? 'active' : ''}`}
          onClick={() => setCurrentTool('pencil')}
          title="Pencil / Brush"
        >
          <Edit2 size={16} />
        </button>
        <button
          className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
          onClick={() => setCurrentTool('eraser')}
          title="Eraser"
        >
          <Eraser size={16} />
        </button>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border-light)' }} />

      {/* Brush Sizes */}
      <div className="toolbar-group">
        {BRUSH_SIZES.map((b) => (
          <button
            key={b.size}
            className={`tool-btn ${brushSize === b.size ? 'active' : ''}`}
            onClick={() => setBrushSize(b.size)}
            title={`Brush size: ${b.label}`}
          >
            <span
              className="size-dot"
              style={{
                width: b.dotSize,
                height: b.dotSize,
                backgroundColor: currentTool === 'eraser' ? 'var(--text-muted)' : brushColor,
              }}
            />
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border-light)' }} />

      {/* Color Palette Swatches */}
      <div className="toolbar-group" style={{ gap: '0.45rem' }}>
        {PALETTE_COLORS.map((c) => (
          <button
            key={c}
            className={`color-swatch ${brushColor === c && currentTool !== 'eraser' ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => {
              setBrushColor(c);
              if (currentTool === 'eraser') setCurrentTool('pencil');
            }}
            title={c}
          />
        ))}

        {/* Custom Color Input */}
        <label
          className="tool-btn"
          style={{ width: 28, height: 28, cursor: 'pointer', overflow: 'hidden', padding: 0 }}
          title="Custom Color"
        >
          <Pipette size={14} color="var(--text-secondary)" />
          <input
            type="color"
            value={brushColor}
            onChange={(e) => {
              setBrushColor(e.target.value);
              if (currentTool === 'eraser') setCurrentTool('pencil');
            }}
            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
          />
        </label>
      </div>

      <div style={{ width: 1, height: 24, background: 'var(--border-light)' }} />

      {/* Clear Canvas Action */}
      <div className="toolbar-group" style={{ marginLeft: 'auto' }}>
        <button
          className="btn btn-sm btn-danger"
          onClick={onClearCanvas}
          title="Clear canvas"
        >
          <Trash2 size={14} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}

export default DrawingToolbar;
