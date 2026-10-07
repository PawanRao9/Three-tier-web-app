import { cn } from "./utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Card component for grouping related content
 * Supports different padding sizes
 */
export default function Card({
  children,
  className,
  padding = "md",
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-sm",
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
