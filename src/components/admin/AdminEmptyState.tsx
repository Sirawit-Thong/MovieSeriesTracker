'use client';

type AdminEmptyStateProps = {
  message: string;
};

export default function AdminEmptyState({message}: AdminEmptyStateProps) {
  return (
    <div className="px-6 py-8 text-center text-foreground/40">{message}</div>
  );
}