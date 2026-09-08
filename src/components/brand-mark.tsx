import { APP_NAME, TAGLINE } from "@/lib/toets/site";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="26"
          height="26"
          rx="6"
          className="fill-card stroke-border"
          strokeWidth="1.5"
        />
        <rect
          x="8"
          y="8"
          width="8"
          height="8"
          rx="1.5"
          className="fill-transparent stroke-primary"
          strokeWidth="1.8"
        />
        <path
          d="M10.2 12.1 12 14l4.2-5"
          className="stroke-primary"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="18.5" y="10" width="7" height="1.6" rx="0.8" className="fill-muted-foreground/50" />
        <rect x="8" y="20" width="16" height="1.6" rx="0.8" className="fill-muted-foreground/35" />
        <rect x="8" y="24" width="11" height="1.6" rx="0.8" className="fill-muted-foreground/25" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
        <span className="mt-1 text-[11px] font-medium tracking-wide text-muted-foreground">
          {TAGLINE}
        </span>
      </span>
    </span>
  );
}
