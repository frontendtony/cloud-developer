import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import 'source-map-support/register'
import * as uuid from 'uuid'
import { createTodo } from '../../helpers/todos'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const payload: CreateTodoRequest = JSON.parse(event.body)

    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const userId = getUserId(event)

    const newTodo = { todoId, createdAt, done: false, userId, ...payload }
    await createTodo(newTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({ item: newTodo })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
