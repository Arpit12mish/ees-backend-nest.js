export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h3 className="text-base font-semibold text-red-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-700">{description}</p>
    </div>
  );
}
