import { AboutClient } from "./about-client";
import { GalleryWall } from "@/components/gallery-wall/gallery-wall";
import { GalleryWallMobile } from "@/components/gallery-wall/gallery-wall-mobile";
import { ScrollPath } from "@/components/scroll-path/scroll-path";
import { ScrollPathMobile } from "@/components/scroll-path/scroll-path-mobile";

export default function About() {
  return (
    <AboutClient
      desktopPath={<ScrollPath />}
      mobilePath={<ScrollPathMobile />}
      desktopGallery={<GalleryWall />}
      mobileGallery={<GalleryWallMobile />}
    />
  );
}
