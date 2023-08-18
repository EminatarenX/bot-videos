const { S3Client } = require('@aws-sdk/client-s3')
require('dotenv').config()

const REGION = process.env.AWS_REGION
const ACCESS_KEY_ID = process.env.AWS_BUCKET_PUBLIC_KEY
const SECRET_ACCESS_KEY = process.env.AWS_BUCKET_SECRET_KEY
const BUCKET_NAME = process.env.AWS_BUCKET
const ENDPOINT = process.env.AWS_BUCKET_ENDPOINT

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
})

module.exports = {
  s3,
  BUCKET_NAME,
  ENDPOINT
}