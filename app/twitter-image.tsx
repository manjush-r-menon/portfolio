import { ImageResponse } from "next/og";
import { ogImageElement, OG_IMAGE_SIZE } from "@/utils/og-image";

export const alt = "Manjush Menon — Frontend Developer";
export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(ogImageElement(), size);
}
