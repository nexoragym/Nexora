import type { ReactNode } from "react";
import type { NavIconName } from "../../lib/navigation";

const iconos: Record<NavIconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  routines: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </>
  ),
  train: <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
  progress: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-7M12 20V6M17 20v-10" />
    </>
  ),
  library: (
    <>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2.5z" />
      <path d="M8 8h7M8 12h5" />
    </>
  ),
};

type NavIconProps = {
  name: NavIconName;
  className?: string;
};

export function NavIcon({ name, className }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {iconos[name]}
    </svg>
  );
}