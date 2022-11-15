import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodos } from '../../businessLayer/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('get-todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const userId = getUserId(event)
      const todos = await getTodos(userId)

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
        })
      }
    } catch (error: any) {
      logger.error(`Failed to fetch todos: ${error.message}`)

      return {
        statusCode: 500,
        body: `${error.message}`
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
