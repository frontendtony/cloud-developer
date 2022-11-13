import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import * as uuid from 'uuid'
import { generateSignedUrl } from '../../helpers/attachmentUtils'
import { updateTodo } from '../../helpers/todos'

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    const imageId = uuid.v4()
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    const uploadUrl = await generateSignedUrl(imageId)
    await updateTodo({ attachmentUrl }, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
