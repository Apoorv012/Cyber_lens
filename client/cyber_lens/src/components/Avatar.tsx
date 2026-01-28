import { useState } from "react";

interface AvatarProps {
  email: string;
  name?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(email: string, name?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Extract initials from email (first letter before @)
  const emailPart = email.split("@")[0];
  if (emailPart.length >= 2) {
    return emailPart.substring(0, 2).toUpperCase();
  }
  return emailPart.substring(0, 1).toUpperCase() + emailPart.substring(0, 1).toUpperCase();
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
};

export default function Avatar({
  email,
  name,
  imageUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(email, name);
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`${sizeClass} rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-medium border border-cyan-500/30 ${className}`}
    >
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={name || email}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
