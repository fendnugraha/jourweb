const AuthLayout = ({ children }) => {
  return (
    <div
      style={{
        backgroundImage: "url('/bg-new-t.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
      className="relative flex justify-center items-center h-screen w-screen p-4 overflow-hidden"
    >
      {/* Soft modern gradient overlays */}
      <div className="absolute inset-0 bg-slate-100/60 dark:bg-slate-950/70 backdrop-blur-xs transition-colors duration-300 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-tr from-blue-500/10 via-transparent to-orange-500/15 pointer-events-none" />

      {/* Content card wrapper */}
      <div className="relative z-10 w-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
