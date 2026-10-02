'use client';

import Link from 'next/link';
import { resolveImageUrl } from '@/lib/utils/image-url';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import { DeleteButton } from '@/components/common/DeleteButton';
import type { HeroReel } from '@/lib/types/hero-reel.types';

export function HeroReelsTable({
  reels,
  deleteAction,
}: {
  reels: HeroReel[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  if (reels.length === 0) {
    return <EmptyState title="No hero reels yet" description="Add your first Reel clip to show it on the home page." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
            <th className="px-4 py-3">Preview</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Linked product</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reels.map((reel) => (
            <tr key={reel.id} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-3">
                <video
                  src={resolveImageUrl(reel.videoUrl)}
                  muted
                  className="h-16 w-10 rounded border border-[var(--border)] bg-black object-cover"
                />
              </td>
              <td className="px-4 py-3">{reel.priority}</td>
              <td className="px-4 py-3 font-medium text-[var(--heading)]">
                {reel.product?.name ?? <span className="text-[var(--muted)]">—</span>}
              </td>
              <td className="px-4 py-3">
                <Badge tone={reel.isActive ? 'brand' : 'neutral'}>
                  {reel.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {new Date(reel.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/hero-reels/${reel.id}`} className="font-semibold text-[var(--brand)]">
                    Edit
                  </Link>
                  <RoleGate permission="heroReels.delete">
                    <DeleteButton
                      id={reel.id}
                      action={deleteAction}
                      confirmMessage="Delete this hero reel? This permanently removes it and cannot be undone."
                    />
                  </RoleGate>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
