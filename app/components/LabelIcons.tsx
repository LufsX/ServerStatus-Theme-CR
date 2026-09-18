import { CalendarDays, Cog, Server, Tag, type LucideProps } from "lucide-react";

// Keep the existing label API and 16px default while sharing Lucide's SVG props.
export const SpecIcon = ({ size = 16, ...props }: LucideProps) => <Cog size={size} aria-hidden="true" {...props} />;
export const HostIcon = ({ size = 16, ...props }: LucideProps) => <Server size={size} aria-hidden="true" {...props} />;
export const CalendarIcon = ({ size = 16, ...props }: LucideProps) => <CalendarDays size={size} aria-hidden="true" {...props} />;
export const TagIcon = ({ size = 16, ...props }: LucideProps) => <Tag size={size} aria-hidden="true" {...props} />;
