'use client'

export function ScanlineOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.015] mix-blend-overlay">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)',
        }}
      />
    </div>
  )
}
