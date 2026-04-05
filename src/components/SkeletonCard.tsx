const SkeletonCard = () => (
  <div className="neon-card rounded-lg overflow-hidden">
    <div className="h-48 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
    <div className="p-5 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-3/4 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-5 w-16 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-3 w-5/6 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-3 w-2/3 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="h-3 w-24 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      <div className="h-8 w-full rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
    </div>
  </div>
);

export default SkeletonCard;
