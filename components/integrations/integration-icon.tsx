import {
  Bot,
  Brain,
  Building2,
  Cog,
  Github,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  openai: Bot,
  anthropic: Brain,
  github: Github,
  cursor: Sparkles,
  microsoft: Building2,
  google: Bot,
  slack: MessageSquare,
  internal: Cog,
};

interface IntegrationIconProps {
  iconId: string;
}

export function IntegrationIcon({ iconId }: IntegrationIconProps) {
  const Icon = ICON_MAP[iconId] ?? Bot;
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
      <Icon className="size-6 text-foreground" aria-hidden />
    </div>
  );
}
