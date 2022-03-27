import aws = require("@pulumi/aws");
import pulumi = require("@pulumi/pulumi");
import mime = require("mime");
import { publicReadPolicyForBucket } from "./policies/public_read";

// Create an S3 bucket
let siteBucket = new aws.s3.Bucket("s3-website-bucket");

let siteDir = "www"; // directory for content files

// For each file in the directory, create an S3 object stored in `siteBucket`
for (let item of require("fs").readdirSync(siteDir)) {
    let filePath = require("path").join(siteDir, item);
    let object = new aws.s3.BucketObject(item, {
      bucket: siteBucket,
      source: new pulumi.asset.FileAsset(filePath),     // use FileAsset to point to a file
      contentType: mime.getType(filePath) || undefined, // set the MIME type of the file
    });
}


let bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
    bucket: siteBucket.bucket,
    policy: siteBucket.bucket.apply(publicReadPolicyForBucket)
  });
  
exports.websiteUrl = siteBucket.websiteEndpoint; // output the endpoint as a stack output  
exports.bucketName = siteBucket.bucket; 