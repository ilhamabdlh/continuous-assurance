/** Official Atumcell mark + wordmark lockup */

type MarkProps = {
  className?: string;
  title?: string;
};

export function AtumcellMark({ className = "atumcell-mark-img", title = "Atumcell" }: MarkProps) {
  return (
    <img
      className={className}
      src="/brand/atumcell-mark.png"
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
