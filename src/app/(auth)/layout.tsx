export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ background: "#F8F4EF" }}>
      {/* Radial glow top right */}
      <div
        className="pointer-events-none absolute right-0 top-0"
        style={{
          width: 400, height: 400,
          background: "radial-gradient(circle at 70% 30%, rgba(243,229,212,0.6) 0%, transparent 70%)",
          opacity: 0.8,
        }}
      />
      {children}
    </div>
  );
}