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
    <div className="card coming-soon">
      <div className="coming-soon-icon">
        <Icon size={28} strokeWidth={1.8} />
      </div>
      <div className="coming-soon-title">{title}</div>
      <div className="coming-soon-desc">{description}</div>
    </div>
  );
}
