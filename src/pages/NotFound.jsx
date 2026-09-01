import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-6 bg-bg">
      <p className="font-mono text-[88px] font-bold text-surface2 leading-none mb-6 select-none tracking-[-0.03em]">
        404
      </p>
      <p className="text-lg font-semibold text-text mb-2">Esta página no existe.</p>
      <p className="text-sm text-zinc-500 mb-8 leading-relaxed max-w-[300px]">
        Si escaneaste un QR, usá el link que tenías originalmente.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="h-[38px] px-5 bg-accent text-bg border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150 hover:bg-[#27272A]"
      >
        ← Volver al inicio
      </button>
    </div>
  );
}
