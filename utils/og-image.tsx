// Shared JSX/size for the site's generated Open Graph / Twitter card image
// (see app/opengraph-image.tsx, app/twitter-image.tsx). Kept in one place
// so both special-file routes render the exact same card instead of two
// hand-kept copies drifting apart. Uses the same --bg/--ink/--accent hex
// values as styles/tailwind.css — ImageResponse renders outside the CSS
// pipeline, so the custom properties themselves aren't available here.
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export function ogImageElement() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#faf9f4",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 96, fontWeight: 800, color: "#141412" }}>
        Manjush Menon
      </div>
      <div style={{ fontSize: 36, color: "#d1591f", marginTop: 20 }}>
        Frontend Developer
      </div>
    </div>
  );
}
