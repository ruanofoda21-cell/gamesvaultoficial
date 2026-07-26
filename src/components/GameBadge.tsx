import { cn } from "@/lib/utils";

interface GameBadgeProps {
  type?: "new" | "popular" | "torrent";
  label?: string;
  className?: string;
}

const presets: Record<string, { label: string; className: string }> = {
  new: { label: "NOVO", className: "bg-neon-green/20 text-neon-green border-neon-green/30" },
  popular: { label: "POPULAR", className: "bg-accent/20 text-accent border-accent/30" },
  torrent: { label: "TORRENT", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

// Color mapping for custom badge labels
const labelColors: Record<string, string> = {
  torrent: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  online: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  multiplayer: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  singleplayer: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  coop: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "em português": "bg-green-500/20 text-green-400 border-green-500/30",
  dublado: "bg-green-500/20 text-green-400 border-green-500/30",
  legendado: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  repack: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  portable: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  demo: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  beta: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "early access": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  atualizado: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  dlc: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  crack: "bg-red-500/20 text-red-400 border-red-500/30",
  steam: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  "epic games": "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  gog: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

const GameBadge = ({ type, label, className }: GameBadgeProps) => {
  const display = type ? presets[type].label : (label || "").toUpperCase();
  const style = type
    ? presets[type].className
    : labelColors[(label || "").toLowerCase()] || "bg-primary/15 text-primary border-primary/30";
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider border whitespace-nowrap",
      style,
      className
    )}>
      {display}
    </span>
  );
};

export default GameBadge;
