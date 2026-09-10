import { useApp } from "../context/AppContext";

export function Toasts() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone || "ok"}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
