'use client';

// Wraps a delete server action with a confirm() prompt so a stray click
// can't trigger it — every delete button in the admin goes through this,
// since none of them had any confirmation before.
export function DeleteButton({
  id,
  action,
  confirmMessage,
  label = 'Delete',
  className = 'font-semibold text-[var(--danger)]',
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
