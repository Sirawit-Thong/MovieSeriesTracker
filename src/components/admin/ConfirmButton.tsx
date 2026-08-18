'use client';

import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import type {ReactNode} from 'react';

type ConfirmButtonProps = {
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
};

export default function ConfirmButton({
  onConfirm,
  disabled,
  children,
  confirmLabel,
  cancelLabel,
  className = '',
}: ConfirmButtonProps) {
  const t = useTranslations('Admin');
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    setConfirming(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleFirstClick() {
    setConfirming(true);
    timerRef.current = setTimeout(reset, 3000);
  }

  async function handleConfirm() {
    reset();
    await onConfirm();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {confirmLabel ?? t('confirm')}
        </button>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors"
        >
          {cancelLabel ?? t('cancel')}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleFirstClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg bg-background border border-border text-foreground/70 hover:text-red-400 hover:border-red-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}