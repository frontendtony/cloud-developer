import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import 'source-map-support/register'
import { createNewTodo } from '../../businessLayer/todos'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('create-todo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const payload: CreateTodoRequest = JSON.parse(event.body)
      const userId = getUserId(event)

      const newTodo = await createNewTodo({ payload, userId })

      return {
        statusCode: 201,
        body: JSON.stringify({ item: newTodo })
      }
    } catch (error: any) {
      logger.error(`Failed to create todo: ${error.message}`)

      return {
        statusCode: 400,
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
