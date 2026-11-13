interface Props {
  seed: number
  className?: string
  animated?: boolean
}

export default function GradientVisual({ seed, className = '', animated = true }: Props) {
  const hue1 = ((seed * 137.508) % 360 + 360) % 360
  const spread = 60 + (seed % 7) * 10
  const hue2 = (hue1 + spread) % 360
  const hue3 = (hue1 + spread * 2) % 360
  const angle = (seed * 7) % 360

  const bg = `linear-gradient(${angle}deg, hsl(${hue1}, 80%, 35%), hsl(${hue2}, 70%, 25%), hsl(${hue3}, 75%, 30%))`
  const orb1 = `radial-gradient(circle at ${30 + (seed % 40)}% ${20 + (seed % 30)}%, hsl(${hue1}, 90%, 50%) 0%, transparent 60%)`
  const orb2 = `radial-gradient(circle at ${60 + (seed % 30)}% ${70 + (seed % 20)}%, hsl(${hue3}, 85%, 45%) 0%, transparent 50%)`

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: bg }}>
      <div className="absolute inset-0 opacity-40" style={{ background: orb1 }} />
      <div className="absolute inset-0 opacity-30" style={{ background: orb2 }} />
      {animated && (
        <>
          <div
            className="absolute w-32 h-32 rounded-full opacity-20 animate-float"
            style={{
              background: `radial-gradient(circle, hsl(${hue1}, 100%, 60%), transparent)`,
              top: `${10 + (seed % 30)}%`,
              left: `${10 + (seed % 40)}%`,
              animationDuration: '4s',
            }}
          />
          <div
            className="absolute w-24 h-24 rounded-full opacity-15 animate-float"
            style={{
              background: `radial-gradient(circle, hsl(${hue3}, 100%, 55%), transparent)`,
              bottom: `${10 + (seed % 20)}%`,
              right: `${10 + (seed % 30)}%`,
              animationDelay: '2s',
              animationDuration: '5s',
            }}
          />
        </>
      )}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, transparent 60%, rgba(9,9,11,0.4) 100%)',
      }} />
      <div className="absolute bottom-2 right-3 text-xs font-mono text-white/20 select-none">VAULT</div>
    </div>
  )
}
