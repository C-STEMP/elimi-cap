import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { logoIcon } from "@/assets";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark";
  width?: number;
  height?: number;
  href?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  theme,
  width = 141,
  height,
  href,
  ...props
}) => {
  const computedHeight = height ?? Math.round(width / (141 / 80));

  const content = (
    <div className={`flex items-center select-none ${className}`} {...props}>
      <Image
        src={logoIcon}
        alt="ELIMI Logo"
        width={width}
        height={computedHeight}
        priority
        className="object-contain w-auto h-auto"
        style={{ width: "auto", height: "auto" }}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
};
