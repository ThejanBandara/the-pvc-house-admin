import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] flex flex-col items-center text-center gap-3 px-5 py-16 text-[var(--text-muted)]">
      <div className="w-16 h-16 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <div className="text-[var(--text)] text-[17px] font-extrabold">{title}</div>
      <div className="max-w-[340px] text-[13.5px] leading-[1.5]">{description}</div>
    </div>
  );
}
