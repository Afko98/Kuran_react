import React from 'react';
import './slider.css';

export default function Slider({ value, onChange, min = 0, max = 100, step = 1, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
{label && (
  <label className="slider-label">
    {label}: <strong>{value}</strong>
  </label>
)}

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          accentColor: 'var(--color-accent, #0078ff)',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
