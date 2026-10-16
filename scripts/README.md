# Media procedures

Destination: https://huggingface.co/buckets/Sarverott/mediacontainer

Sett uploaded the images and removed the local `assets/` directory. The seven
WebP files use original names at the bucket root. `media.json` records the
actual keys, sizes and SHA-256 hashes. Anonymous downloads were verified
against the manifest and historical originals on 2026-10-16.
The bucket also lists six PNG files, outside the WebP verification manifest.

## Inspect

```sh
task media:plan
```

This requires local originals in `assets/`, no longer present in this checkout.
It validates them and prints the plan without network access.
If an image changes, update its size, SHA-256 and content-addressed key in the
manifest before uploading.

## Upload

For future uploads with local originals, install Python tooling with `uv sync`.
Configure write access locally using
`hf auth login` or `HF_TOKEN`; alternatively configure Hugging Face S3 credentials
through the usual AWS environment variables or profile. An HF token and an S3
access key are different credentials. Do not put either in this repository or
browser code. `uv run hf auth login` uses the project's installed HF CLI.

```sh
task media:upload
```

The script preflights local files, uploads through the HF API when an HF token
is available, otherwise uses the S3 gateway, then downloads every public object
anonymously and compares its size and SHA-256 with the manifest. Partial uploads
can be retried; success is reported only after all public downloads verify.

## Read without credentials

```sh
task media:verify
node scripts/hf-read.mjs hero.webp > /tmp/apokaliptium-hero.webp
```

The JavaScript reader replaces `src/hf-mount.js` and writes object bytes to
stdout. Public HTTP reads need no AWS SDK or credentials. A public bucket does
not grant upload access. Both reading commands use standard libraries and need
no frontend dependencies installed.

Public URL example:
https://huggingface.co/buckets/Sarverott/mediacontainer/resolve/hero.webp

The site's components still reference local media URLs; frontend
integration is pending.

References: [HF bucket uploads](https://huggingface.co/docs/huggingface_hub/guides/buckets)
and [S3 configuration](https://huggingface.co/docs/hub/storage-buckets-s3).
