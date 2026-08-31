// Ported from images/gmail.svg — a multi-tone envelope illustration (not a
// flat glyph), so unlike the rest of icon-components/ this one keeps its
// own fixed fill/gradient colors instead of currentColor: collapsing it to
// a single ink/accent tone would flatten the illustration into a silhouette
// and lose the point of it. One consequence: the hover-to-accent color
// shift used for the other three social icons has no effect here — only
// the magnetic pull animates on hover for this one (the box behind it
// still shifts ink→accent on hover, same as the others).
// The source's red (#e75a4d body outline, #b2392f flap-back accent) was
// swapped for off-white tones already present elsewhere in this same icon
// (#f7f5ed, #b7b6ad) so it reads as a light glyph on the dark box like the
// rest of the row, instead of standing out as the one colored icon.
// The source also repeated the same triangular "fold" path/gradient 8 times under 8
// separate but byte-identical <linearGradient> ids (an artifact of however
// it was exported) — collapsed here to one shared gradient referenced 8
// times, which paints identically since a gradient definition is just a
// paint recipe, not a shape. Every path is otherwise kept as authored,
// including the ones fully occluded by later paths, since removing them
// would require re-verifying the final composite pixel-for-pixel.
export function GmailIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      viewBox="7.086 -169.483 1277.149 1277.149"
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient
          id="gmailFold"
          gradientUnits="userSpaceOnUse"
          x1="1959.712"
          y1="737.107"
          x2="26066.213"
          y2="737.107"
          gradientTransform="matrix(.0283 0 0 -.0283 248.36 225.244)"
        >
          <stop offset="0" stopColor="#f8f6ef" />
          <stop offset="1" stopColor="#e7e4d6" />
        </linearGradient>
      </defs>
      <path
        fill="#f7f5ed"
        d="M1179.439 7.087c57.543 0 104.627 47.083 104.627 104.626v30.331l-145.36 103.833-494.873 340.894L148.96 242.419v688.676h-37.247c-57.543 0-104.627-47.082-104.627-104.625V111.742C7.086 54.198 54.17 7.115 111.713 7.115l532.12 394.525L1179.41 7.115l.029-.028z"
      />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path
        fill="#e7e4d7"
        d="M148.96 242.419v688.676h989.774V245.877L643.833 586.771z"
      />
      <path
        fill="#b8b7ae"
        d="M148.96 931.095l494.873-344.324-2.24-1.586L148.96 923.527z"
      />
      <path
        fill="#b7b6ad"
        d="M1138.734 245.877l.283 685.218-495.184-344.324z"
      />
      <path
        fill="#b7b6ad"
        d="M1284.066 142.044l.17 684.51c-2.494 76.082-35.461 103.238-145.219 104.514l-.283-685.219 145.36-103.833-.028.028z"
      />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path fill="url(#gmailFold)" d="M111.713 7.087l532.12 394.525L1179.439 7.087z" />
      <path
        fill="#f7f5ed"
        d="M111.713 7.087l532.12 394.525L1179.439 7.087z"
      />
    </svg>
  );
}
