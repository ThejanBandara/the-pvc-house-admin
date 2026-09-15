import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-[rgba(4,8,16,0.6)] backdrop-blur-[2px] animate-[fadeIn_0.15s_var(--ease)] md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto bg-[var(--bg-elevated)] border border-[var(--border)] rounded-t-[var(--radius-lg)] shadow-[var(--shadow-lg)] px-[18px] pt-[10px] pb-[calc(18px+env(safe-area-inset-bottom))] animate-[slideUp_0.22s_var(--ease)] md:rounded-[var(--radius-lg)] md:max-h-[85vh] md:pt-[18px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded-full bg-[var(--border-strong)] mx-auto mb-3 md:hidden" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="m-0 text-[17px] font-extrabold tracking-[-0.2px]">{title}</h2>
          <button
            className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-colors hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
