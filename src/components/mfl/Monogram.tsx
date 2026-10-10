import { monogram } from "@/lib/mfl/present";

export default function Monogram({ name, small }: { name: string | undefined; small?: boolean }) {
  return (
    <span className={`mfl-mono${small ? " mfl-mono--sm" : ""}`} aria-hidden="true">
      {monogram(name)}
    </span>
  );
}
