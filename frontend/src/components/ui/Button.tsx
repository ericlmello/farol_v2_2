import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]',
  {
    variants: {
      variant: {
        default: 'border border-[#061531] bg-[#f9f7f2] text-[#061531] hover:bg-[#061531] hover:text-[#f9f7f2] focus-visible:ring-[#061531] transition-all duration-200',
        destructive: 'border border-[#dc2626] bg-[#f9f7f2] text-[#dc2626] hover:bg-[#dc2626] hover:text-[#f9f7f2] focus-visible:ring-[#dc2626] transition-all duration-200',
        outline: 'border border-[#061531] bg-[#f9f7f2] text-[#061531] hover:bg-[#061531] hover:text-[#f9f7f2] focus-visible:ring-[#061531] transition-all duration-200',
        secondary: 'border border-[#061531] bg-[#f1f5f9] text-[#061531] hover:bg-[#061531] hover:text-[#f9f7f2] focus-visible:ring-[#061531] transition-all duration-200',
        ghost: 'border border-transparent hover:bg-[#061531] hover:text-[#f9f7f2] focus-visible:ring-[#061531] transition-all duration-200',
        link: 'border border-transparent text-primary underline-offset-4 hover:underline hover:text-primary focus-visible:ring-ring transition-all duration-200',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-10 rounded-md px-3',
        lg: 'h-12 rounded-md px-8',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
