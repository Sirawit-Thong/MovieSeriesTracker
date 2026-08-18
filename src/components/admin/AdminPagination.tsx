'use client';

import {useTranslations} from 'next-intl';

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function AdminPagination({page, totalPages, total, onPageChange}: AdminPaginationProps) {
  const t = useTranslations('Admin');

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-border">
      <p className="text-sm text-foreground/50">
        {t('pagination', {page, totalPages, count: total})}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t('previous')}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
}