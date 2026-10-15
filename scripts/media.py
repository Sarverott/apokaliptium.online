import argparse
import hashlib
import json
import os
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "scripts" / "media.json"


def load_manifest():
    return json.loads(MANIFEST.read_text())


def local_files(manifest):
    files = []
    for entry in manifest["files"]:
        source = ROOT / "assets" / entry["name"]
        content = source.read_bytes()
        if len(content) != entry["bytes"] or hashlib.sha256(content).hexdigest() != entry["sha256"]:
            raise ValueError(f"Local media changed: {source.name}; update the manifest before uploading")
        files.append((source, entry["key"]))
    return files


def public_url(manifest, key):
    return f"https://huggingface.co/buckets/{manifest['bucket']}/resolve/{quote(key, safe='/')}"


def upload(manifest):
    files = local_files(manifest)
    from huggingface_hub import batch_bucket_files, get_token

    token = get_token()
    if token:
        batch_bucket_files(manifest["bucket"], add=files, token=token)
        return

    import boto3
    from botocore.config import Config

    os.environ.setdefault("AWS_EC2_METADATA_DISABLED", "true")
    session = boto3.Session()
    if session.get_credentials() is None:
        raise ValueError("No write credentials: configure HF_TOKEN, HF login, or Hugging Face S3 credentials locally")
    namespace, bucket = manifest["bucket"].split("/", 1)
    client = session.client(
        "s3",
        endpoint_url=f"https://s3.hf.co/{namespace}",
        config=Config(
            region_name="us-east-1",
            s3={"addressing_style": "path"},
            request_checksum_calculation="when_required",
            response_checksum_validation="when_required",
            connect_timeout=15,
            read_timeout=30,
            retries={"max_attempts": 2},
        ),
    )
    for source, key in files:
        client.upload_file(str(source), bucket, key, ExtraArgs={"ContentType": "image/webp"})


def verify(manifest):
    for entry in manifest["files"]:
        digest = hashlib.sha256()
        size = 0
        with urlopen(public_url(manifest, entry["key"]), timeout=30) as response:
            while chunk := response.read(65536):
                digest.update(chunk)
                size += len(chunk)
        if size != entry["bytes"] or digest.hexdigest() != entry["sha256"]:
            raise ValueError(f"Public media verification failed: {entry['name']}")
        print(f"Verified {entry['name']}")
    print("All public media verified. Local originals are unchanged.")


def main():
    parser = argparse.ArgumentParser(description="Plan, upload and verify Apokaliptium media; never deletes files")
    parser.add_argument("action", choices=("plan", "upload", "verify"))
    arguments = parser.parse_args()
    manifest = load_manifest()
    if arguments.action == "plan":
        local_files(manifest)
        print(json.dumps(manifest, indent=2))
        return
    if arguments.action == "upload":
        upload(manifest)
    verify(manifest)


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, ImportError) as error:
        raise SystemExit(str(error)) from None
