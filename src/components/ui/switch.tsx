"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-white/60 bg-white/80 shadow-[inset_0_1px_2px_rgba(20,36,47,0.08)] transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-[color:var(--primary)] focus-visible:ring-4 focus-visible:ring-[color:var(--ring)] aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 data-[size=default]:h-7 data-[size=default]:w-12 data-[size=sm]:h-5 data-[size=sm]:w-9 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-strong)_100%)] data-unchecked:bg-white/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-[0_6px_14px_rgba(18,37,52,0.2)] ring-0 transition-transform group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-4 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-3px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-3px)] group-data-[size=default]/switch:data-unchecked:translate-x-[2px] group-data-[size=sm]/switch:data-unchecked:translate-x-[1px]"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
