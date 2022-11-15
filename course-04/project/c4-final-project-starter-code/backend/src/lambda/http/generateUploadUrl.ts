import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import * as uuid from 'uuid'
import { generateSignedUrl } from '../../helpers/attachmentUtils'
import { updateTodoAttachmentUrl } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('upload')

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)

      const imageId = uuid.v4()
      const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
      const uploadUrl = await generateSignedUrl(imageId)

      logger.info(`Signed url: ${uploadUrl}`)

      await updateTodoAttachmentUrl(attachmentUrl, todoId, userId)

      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl
        })
      }
    } catch (error: any) {
      logger.error(`Upload failed: ${error.message}`)
      return {
        statusCode: 500,
        body: ''
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
