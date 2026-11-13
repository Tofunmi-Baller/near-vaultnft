interface GradientVisualProps {
  seed: number
  className?: string
}

function seededHues(seed: number): [number, number, number] {
  const base = ((seed * 137.508) % 360 + 360) % 360
  const spread = 60 + (seed % 7) * 10
  return [base, (base + spread) % 360, (base + spread * 2) % 360]
}

export default function GradientVisual({ seed, className = '' }: GradientVisualProps) {
  const [h1, h2, h3] = seededHues(seed)
  const gradient = `linear-gradient(135deg, hsl(${h1}, 75%, 40%), hsl(${h2}, 70%, 35%), hsl(${h3}, 65%, 30%))`

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: gradient }}>
      <div
        className="absolute inset-0 opacity-20 animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.2), transparent 60%),
            radial-gradient(circle at 70% 60%, rgba(255,255,255,0.1), transparent 50%)`,
        }}
      />
    </div>
  )
}
