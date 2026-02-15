import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>}
          <button onClick={onClose} className="ml-auto rounded-lg p-1 hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
