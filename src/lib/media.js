import content from "../data/content.json";

// Public URL of an object in the media bucket (see scripts/README.md).
// Keys are file names at the bucket root, e.g. media("hero.webp").
export function media(key) {
	return content.media.base + key.split("/").map(encodeURIComponent).join("/");
}
