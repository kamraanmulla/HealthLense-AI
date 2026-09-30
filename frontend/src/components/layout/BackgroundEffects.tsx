export default function BackgroundEffects() {
  return (
    <>
      {/* Soft Calm Medical Ambient Blurs */}
      <div 
        className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#16A34A] opacity-[0.025] blur-[140px] pointer-events-none z-0"
      />
      <div 
        className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#059669] opacity-[0.02] blur-[150px] pointer-events-none z-0"
      />
      <div 
        className="fixed top-[30%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-[#0284C7] opacity-[0.015] blur-[130px] pointer-events-none z-0"
      />
    </>
  );
}
