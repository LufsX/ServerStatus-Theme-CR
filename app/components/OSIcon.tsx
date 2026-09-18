import { MonitorCog, type LucideProps } from "lucide-react";
import { getOSLogo } from "@/lib/osIcons";

interface OSIconProps extends LucideProps {
  os: string;
}

/** Official OS logos inherit the label color for both light and dark themes. */
export function OSIcon({ os, size = 16, ...props }: OSIconProps) {
  const logo = getOSLogo(os);
  if (!logo) {
    return <MonitorCog size={size} role="img" aria-label={os} {...props} />;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={logo.viewBox}
      fill="currentColor"
      role="img"
      aria-label={os}
      {...props}
    >
      <path d={logo.path} />
    </svg>
  );
}
