export type IconName = "home" | "pulse" | "person" | "list" | "more" | "check" | "chevron";

/** One outline set: 24px grid, stroke 1.75, rounded caps, drawn in currentColor. */
export default function Icon({ name, small }: { name: IconName; small?: boolean }) {
  return (
    <svg
      className={`mfl-icon${small ? " mfl-icon--sm" : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {name === "home" && <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />}
      {name === "pulse" && <path d="M3 12h4l3-8 4 16 3-8h4" />}
      {name === "person" && <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />}
      {name === "list" && <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />}
      {name === "more" && (
        <g fill="currentColor" stroke="none">
          <circle cx="5" cy="12" r="1.9" />
          <circle cx="12" cy="12" r="1.9" />
          <circle cx="19" cy="12" r="1.9" />
        </g>
      )}
      {name === "check" && <path d="M5 13l4 4L19 7" />}
      {name === "chevron" && <path d="M9 6l6 6-6 6" />}
    </svg>
  );
}
