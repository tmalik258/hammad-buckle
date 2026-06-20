import { cn } from "@/lib/utils";
import { getUserInitials } from "@/lib/utils/user-initials";

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-2xl",
} as const;

interface UserInitialsAvatarProps {
  name?: string | null;
  email?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function UserInitialsAvatar({
  name,
  email,
  size = "md",
  className,
}: UserInitialsAvatarProps) {
  const initials = getUserInitials(name, email);

  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
