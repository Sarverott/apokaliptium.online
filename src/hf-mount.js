// Install: npm install @aws-sdk/client-s3 @smithy/fetch-http-handler
// Save as example.mjs and run: node example.mjs
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";

// NOTE: code was given by huggingface, it should work with https://huggingface.co/buckets/Sarverott/mediacontainer at read-only mode so should be no need for creds mentioned below

// Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
// in your environment before running this example.
const s3 = new S3Client({
  requestHandler: new FetchHttpHandler(),
  endpoint: "https://s3.hf.co/Sarverott",
  region: "us-east-1",
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const response = await s3.send(new GetObjectCommand({
  Bucket: "mediacontainer",
  Key: "example.txt",
}));
console.log(await response.Body.transformToString());