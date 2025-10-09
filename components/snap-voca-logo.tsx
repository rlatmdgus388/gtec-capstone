import Image from 'next/image';

export function SnapVocaLogo({ size = "md", className }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-48 h-48",
  };

  return (
    <Image
      src="/logo.png"
      alt="SnapVoca Logo"
      className={`${sizeClasses[size]} ${className}`}
      width={200}
      height={200}
    />
  );
}
