import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({ signatureVersion: 'v4' })

const logger = createLogger('bucket')

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function generateSignedUrl(imageId: string) {
  logger.info(`Generating signed url for ${imageId} and bucket ${bucketName}`)
  return await s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: 60000
  })
}
