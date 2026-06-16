import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
  onSubmit: (dataUrl: string) => void | Promise<unknown>;
  disabled?: boolean;
}

const BRUSH_COLORS = ['#18181b', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899'];

export function DrawingCanvas({ onSubmit, disabled }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.strokeStyle = brushColor;
  }, [brushColor]);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const me = e as React.MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  }, []);

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || submitted) return;
    e.preventDefault();
    setDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    const pos = getPos(e);
    ctx?.beginPath();
    ctx?.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawing || disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    const pos = getPos(e);
    ctx?.lineTo(pos.x, pos.y);
    ctx?.stroke();
  };

  const endDraw = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx!.fillStyle = '#ffffff';
    ctx!.fillRect(0, 0, rect.width, rect.height);
    setSubmitted(false);
  };

  const submit = () => {
    const data = canvasRef.current?.toDataURL('image/png');
    if (data) {
      onSubmit(data);
      setSubmitted(true);
    }
  };

  return (
    <div>
      <div className="brush-palette" role="group" aria-label="Brush colors">
        {BRUSH_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`brush-swatch ${brushColor === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => setBrushColor(c)}
            disabled={disabled || submitted}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>
      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          style={{ height: 220 }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={clear} disabled={disabled || submitted}>
          Clear
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          onClick={submit}
          disabled={disabled || submitted}
          data-testid="submit-drawing-btn"
        >
          {submitted ? 'Submitted!' : 'Submit Drawing'}
        </button>
      </div>
    </div>
  );
}