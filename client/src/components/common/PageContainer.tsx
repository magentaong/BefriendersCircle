import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="flex justify-center items-stretch p-4 sm:p-8 md:p-12 w-full">

      <div
        className="
          w-full max-w-6xl
          bg-white/85
          rounded-2xl md:rounded-3xl
          border-2 border-white/90
          shadow-2xl shadow-yellow-100/40 shadow-inner
          shadow-[0_0_24px_6px_rgba(255,255,255,0.45)]
          backdrop-blur-md
          px-2 sm:px-6 md:px-8
          py-4 sm:py-6 md:py-10
          flex flex-col
          no-scrollbar
          transition-all
        "
        style={{
          boxShadow: "0 4px 40px 0 rgba(252, 234, 187, 0.25), inset 0 1px 20px 0 rgba(220, 220, 220, 0.07)"
        }}
      >
        {children}
      </div>
          </div>

  );
}
