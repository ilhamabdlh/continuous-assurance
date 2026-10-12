/** Official Atumcell mark + wordmark lockup */

import { useTheme } from "../context/ThemeContext";

export const ATUMCELL_MARK = "/brand/atumcell-mark.png";
export const ATUMCELL_MARK_ON_DARK = "/brand/atumcell-mark-on-dark.png";

type MarkProps = {
  className?: string;
  title?: string;
};

export function useAtumcellMarkSrc() {
  const { theme } = useTheme();
  return theme === "dark" ? ATUMCELL_MARK_ON_DARK : ATUMCELL_MARK;
}

export function AtumcellMark({ className = "atumcell-mark-img", title = "Atumcell" }: MarkProps) {
  const src = useAtumcellMarkSrc();
  return (
    <img
      className={className}
      src={src}
      alt={title}
      width={40}
      height={40}
      decoding="async"
    />
  );
}

export function AtumcellBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`atumcell-brand${compact ? " is-compact" : ""}`}>
      <span className="atumcell-mark-wrap">
        <AtumcellMark />
      </span>
      <div className="atumcell-wordmark">
        <span className="atumcell-wordmark-name">Atumcell</span>
        <span className="atumcell-wordmark-sub">Assurance</span>
      </div>
    </div>
  );
}
