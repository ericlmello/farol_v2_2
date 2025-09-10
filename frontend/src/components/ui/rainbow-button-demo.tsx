import { RainbowButton } from "@/components/ui/rainbow-button"

export function RainbowButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">Rainbow Button Demo</h2>
      <RainbowButton>Get Unlimited Access</RainbowButton>
    </div>
  );
}
