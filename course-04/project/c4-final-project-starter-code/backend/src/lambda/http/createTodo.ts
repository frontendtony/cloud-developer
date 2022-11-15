import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import 'source-map-support/register'
import * as uuid from 'uuid'
import { createTodo } from '../../helpers/todos'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('todos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const payload: CreateTodoRequest = JSON.parse(event.body)
      logger.info(`Todo creation start. Payload: ${JSON.stringify(payload)}`)

      const todoId = uuid.v4()
      const createdAt = new Date().toISOString()
      const userId = getUserId(event)

      const newTodo = { todoId, createdAt, done: false, userId, ...payload }

      logger.info(`New todo object: ${JSON.stringify(newTodo)}`)

      await createTodo(newTodo)

      return {
        statusCode: 201,
        body: JSON.stringify({ item: newTodo })
      }
    } catch (error: any) {
      logger.error(`Failed to create toto: ${error.message}`)

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
