import { MonitorCog, type LucideProps } from "lucide-react";

interface OSIconProps extends LucideProps {
  os: string;
}

/** A neutral OS symbol; the accessible name preserves the actual OS identity. */
export function OSIcon({ os, size = 16, ...props }: OSIconProps) {
  return <MonitorCog size={size} role="img" aria-label={os} {...props} />;
}
