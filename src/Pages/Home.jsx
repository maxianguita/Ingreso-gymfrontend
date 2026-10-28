// pages/Home.jsx
import { Link } from "react-router-dom";
import { UserPlus, Dumbbell, ArrowRight } from "lucide-react";
import bgVideo from "../video/strong.mp4";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-black overflow-hidden">

      {/* 1. VIDEO DE FONDO - Asegúrate que la ruta src sea correcta */}
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover"
          src={bgVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      </div>

      {/* 2. OVERLAY - Un solo gradiente oscuro desde la izquierda */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/35 to-black/10" />

      {/* 3. CONTENIDO - Subimos el z-index a 20 */}
      <section className="relative z-20 mx-auto flex min-h-screen max-w-7xl items-center justify-start px-6 md:px-12">
        <div className="max-w-3xl text-left">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 bg-red-600/20 border border-red-600/30 px-3 py-1 rounded-full backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-xs font-black text-red-500 uppercase tracking-[0.2em]">High Performance</span>
          </div>

          <h1 className="text-[clamp(2.25rem,9vw,6rem)] font-black leading-[0.9] text-white uppercase italic tracking-tighter drop-shadow-2xl">
            CREANDO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">
              CAMPEONES
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg md:text-xl text-gray-300 font-medium leading-relaxed">
            Gestión de socios y control de pases. <br />
            <span className="text-white border-l-2 border-red-600 pl-3 mt-2 block italic">
              "El dolor es temporal, el orgullo es eterno."
            </span>
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/admin/create"
              className="group relative overflow-hidden rounded-xl bg-red-700 px-8 py-4 transition-all active:scale-95"
            >
              <div className="relative flex items-center gap-3 font-black uppercase text-white tracking-widest text-sm">
                <UserPlus size={20} strokeWidth={3} />
                Nuevo Socio
              </div>
            </Link>

            <Link
              to="/pases"
              className="group rounded-xl border-2 border-white/20 bg-white/5 backdrop-blur-md px-8 py-4 transition-all hover:border-white/40 active:scale-95"
            >
              <div className="flex items-center gap-3 font-black uppercase text-white tracking-widest text-sm">
                <Dumbbell size={20} />
                Ver Pases
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Marca de agua lateral */}
      <div className="absolute right-10 bottom-10 hidden lg:block z-10">
        <p className="text-white/5 text-9xl font-black rotate-90 origin-bottom-right uppercase select-none">
          EST. 2026
        </p>
      </div>

    </main>
  );
}
