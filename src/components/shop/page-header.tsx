import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  description,
  meta,
  className,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b border-ink-100 bg-linear-to-b from-peach-50 to-white",
        className,
      )}
    >
      <div className="container-page py-7 sm:py-9">
        {crumbs ? <Breadcrumbs items={crumbs} className="mb-4" /> : null}
        {eyebrow ? (
          <p className="text-[11px] font-bold tracking-[0.2em] text-brand-700 uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm text-ink-500">{description}</p> : null}
        {meta ? <div className="mt-5">{meta}</div> : null}
      </div>
    </div>
  );
}
