import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[1.15rem] border border-transparent bg-clip-padding text-sm font-semibold tracking-[-0.01em] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-strong)_100%)] text-primary-foreground shadow-[0_18px_40px_rgba(228,93,56,0.24)] hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(228,93,56,0.3)]",
        outline:
          "border-[color:var(--surface-border)] bg-white/82 text-foreground shadow-[0_14px_32px_rgba(18,37,52,0.08)] backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white aria-expanded:bg-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_14px_32px_rgba(15,141,132,0.12)] hover:-translate-y-0.5 hover:bg-secondary/85 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-foreground shadow-none hover:bg-white/70 hover:text-foreground aria-expanded:bg-white/70 aria-expanded:text-foreground",
        destructive:
          "bg-destructive text-white shadow-[0_18px_38px_rgba(203,75,55,0.22)] hover:-translate-y-0.5 hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-7 gap-1 rounded-[0.9rem] px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 rounded-[1rem] px-3 text-[0.82rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-11 rounded-[1.1rem]",
        "icon-xs":
          "size-7 rounded-[0.9rem] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-9 rounded-[1rem] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12 rounded-[1.25rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export { buttonVariants }
