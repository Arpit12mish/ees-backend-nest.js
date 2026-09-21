'use client';

import Link from 'next/link';
import { useClientFilter } from '@/lib/hooks/useClientFilter';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { RoleGate } from '@/components/common/RoleGate';
import type { Category } from '@/lib/types/category.types';

export function CategoriesTable({
  categories,
  deleteAction,
}: {
  categories: Category[];
  deleteAction: (formData: FormData) => void | Promise<void>;
}) {
  const { query, setQuery, filtered } = useClientFilter(categories, (c) => [c.name, c.slug]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search categories…" />

      {filtered.length === 0 ? (
        <EmptyState
          title={categories.length === 0 ? 'No categories yet' : 'No matches'}
          description={categories.length === 0 ? undefined : 'Try a different search term.'}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <tr key={category.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">{category.priority}</td>
                  <td className="px-4 py-3 font-medium text-[var(--heading)]">{category.name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{category.slug}</td>
                  <td className="px-4 py-3">
                    <Badge tone={category.isActive ? 'brand' : 'neutral'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(category.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/categories/${category.id}`} className="font-semibold text-[var(--brand)]">
                        Edit
                      </Link>
                      <RoleGate permission="categories.write">
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={category.id} />
                          <button type="submit" className="font-semibold text-[var(--danger)]">
                            Delete
                          </button>
                        </form>
                      </RoleGate>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
