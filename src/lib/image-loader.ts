/** next/image loader for Unsplash's on-the-fly resizing CDN. */
interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

export default function unsplashLoader({ src, width, quality }: LoaderArgs): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 70));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}
