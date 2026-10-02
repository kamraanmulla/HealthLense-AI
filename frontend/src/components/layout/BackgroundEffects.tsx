export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle Futuristic Tech Dot/Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at 50% 15%, black 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 15%, black 40%, transparent 85%)',
        }}
      />

      {/* Primary Emerald Glow Top-Right */}
      <div
        className="absolute -top-[12%] right-[5%] w-[42vw] h-[42vw] rounded-full bg-gradient-to-br from-[#10B981] to-[#14B8A6] opacity-[0.035] blur-[140px]"
      />

      {/* Secondary Soft Cyan/Teal Glow Bottom-Left */}
      <div
        className="absolute -bottom-[15%] -left-[10%] w-[48vw] h-[48vw] rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#10B981] opacity-[0.03] blur-[160px]"
      />

      {/* Gentle Center Vignette Glow */}
      <div
        className="absolute top-[35%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-[#10B981] opacity-[0.015] blur-[120px]"
      />
    </div>
  );
}
