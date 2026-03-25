import { cva } from "class-variance-authority"

const badgeVariants = cva(
  "group/badge inline-flex min-h-7 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-3 py-1 text-[0.78rem] font-semibold tracking-[-0.01em] whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-strong)_100%)] text-primary-foreground shadow-[0_12px_28px_rgba(228,93,56,0.18)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_10px_24px_rgba(15,141,132,0.1)]",
        destructive:
          "bg-destructive/12 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-[color:var(--surface-border)] bg-white/72 text-foreground [a]:hover:bg-white",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export { badgeVariants }
