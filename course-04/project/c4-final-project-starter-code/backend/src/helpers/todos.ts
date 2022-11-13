import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from '../models/TodoItem'

const todosTable = process.env.TODOS_TABLE

const XAWS = AWSXRay.captureAWS(AWS)
const client = new XAWS.DynamoDB()

export async function getTodosForUser(userId: string) {
  const result = await client
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeNames: { ':userId': userId },
      ScanIndexForward: true
    })
    .promise()

  return result.Items
}

export async function createTodo(todo: TodoItem) {
  // @ts-ignore
  await client.putItem({ TableName: todosTable, Item: todo }).promise()

  return todo
}

export async function updateTodo(
  todo: Partial<Omit<TodoItem, 'todoId' | 'createdAt' | 'userId'>>,
  todoId: string
) {
  // @ts-ignore
  await client
    .updateItem({ TableName: todosTable, Item: todo, Key: { todoId } })
    .promise()

  return todo
}

export async function deleteTodo(todoId: string) {
  // @ts-ignore
  return await client
    .deleteItem({ TableName: todosTable, Key: { todoId } })
    .promise()
}
