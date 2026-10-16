const key = process.argv[2];

if (
	!key ||
	key
		.split("/")
		.some((segment) => !segment || segment === "." || segment === "..")
) {
	console.error("Usage: node scripts/hf-read.mjs <bucket-object-key>");
	process.exitCode = 2;
} else {
	const path = key.split("/").map(encodeURIComponent).join("/");
	const response = await fetch(
		`https://huggingface.co/buckets/Sarverott/mediacontainer/resolve/${path}`,
		{ credentials: "omit", signal: AbortSignal.timeout(15_000) },
	);
	if (!response.ok) {
		console.error(`Public media download failed: HTTP ${response.status}`);
		process.exitCode = 1;
	} else {
		process.stdout.write(Buffer.from(await response.arrayBuffer()));
	}
}
