import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { generateUploadUrl } from '../../businessLayer/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)

      const uploadUrl = await generateUploadUrl({ todoId, userId })

      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl
        })
      }
    } catch (error: any) {
      logger.error(`Failed to generate upload url: ${error.message}`)

      return {
        statusCode: 500,
        body: `${error.message}`
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
