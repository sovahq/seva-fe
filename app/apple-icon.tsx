import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#002d5b",
          borderRadius: 28,
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 32 32"
          fill="none"
          style={{ margin: "auto" }}
        >
          <path
            d="M10 8c6 0 6 4 6 6s-2 4-6 4c-4 0-6 2-6 6s2.5 6 8 6"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
