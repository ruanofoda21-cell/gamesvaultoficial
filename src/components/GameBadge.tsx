import { cn } from "@/lib/utils";

interface GameBadgeProps {
  type: "new" | "popular" | "torrent";
  className?: string;
}

const badges = {
  new: { label: "NOVO", className: "bg-neon-green/20 text-neon-green border-neon-green/30" },
  popular: { label: "POPULAR", className: "bg-accent/20 text-accent border-accent/30" },
  torrent: { label: "TORRENT", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const GameBadge = ({ type, className }: GameBadgeProps) => {
  const badge = badges[type];
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider border",
      badge.className,
      className
    )}>
      {badge.label}
    </span>
  );
};

export default GameBadge;
