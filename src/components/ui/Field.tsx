import { cloneElement, isValidElement, useId } from "react";
import type { ReactNode } from "react";

/** Label/help semantics for fields that are not naturally wrapped by <label>. */
export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const labelled = isValidElement<{
    id?: string;
    "aria-labelledby"?: string;
    suppressHydrationWarning?: boolean;
  }>(children)
    ? cloneElement(children, {
        suppressHydrationWarning: true,
        ...(htmlFor && !children.props.id
          ? { id: htmlFor }
          : children.props.id || children.props["aria-labelledby"]
            ? {}
            : { "aria-labelledby": labelId }),
      })
    : children;
  return htmlFor ? (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span id={labelId} className="field-label">
        {label}
      </span>
      {labelled}
    </label>
  ) : (
    <div className="block space-y-1.5">
      <span id={labelId} className="field-label">
        {label}
      </span>
      {labelled}
    </div>
  );
}
