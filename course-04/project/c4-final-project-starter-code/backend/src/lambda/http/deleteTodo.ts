import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../businessLayer/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('delete-todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    try {
      await deleteTodo({ todoId, userId })

      return {
        statusCode: 200,
        body: ''
      }
    } catch (error: any) {
      logger.error(`Failed to delete todo: ${error.message}`)

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
