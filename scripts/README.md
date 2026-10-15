# Media procedures

Destination: https://huggingface.co/buckets/Sarverott/mediacontainer

The original images stay in `assets/` until upload and public verification are
complete. `media.json` lists sizes, SHA-256 hashes and destination keys.
Keys include the full content hash under `apokaliptium.online/` so different
versions cannot overwrite each other. These procedures never delete files.

## Inspect

```sh
task media:plan
```

This validates every original and prints the plan without network access.
If an image changes, update its size, SHA-256 and content-addressed key in the
manifest before uploading.

## Upload

Install the Python tooling with `uv sync`. Configure write access locally using
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
node scripts/hf-read.mjs <object-key>
```

The JavaScript reader replaces `src/hf-mount.js` and writes object bytes to
stdout. Public HTTP reads need no AWS SDK or credentials. A public bucket does
not grant upload access; missing objects return an error until uploaded.

After verification, update every site image URL and the future timeline's CSS
background URL before deleting `assets/`. Astro migration remains postponed.

References: [HF bucket uploads](https://huggingface.co/docs/huggingface_hub/guides/buckets)
and [S3 configuration](https://huggingface.co/docs/hub/storage-buckets-s3).
