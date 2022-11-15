import * as AWS from 'aws-sdk'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const todosTable = process.env.TODOS_TABLE

const client = new XAWS.DynamoDB.DocumentClient()

const logger = createLogger('todos')

export async function getTodosForUser(userId: string) {
  const result = await client
    .query({
      TableName: todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false
    })
    .promise()

  return result.Items
}

export async function createTodo(todo: TodoItem) {
  const Item = {
    done: todo.done,
    name: todo.name,
    createdAt: todo.createdAt,
    dueDate: todo.dueDate,
    todoId: todo.todoId,
    userId: todo.userId
  }

  logger.info(`Create todo item: ${JSON.stringify(Item)}`)

  await client.put({ TableName: todosTable, Item }).promise()

  return todo
}

export async function updateTodo(
  todo: Partial<
    Omit<TodoItem, 'todoId' | 'createdAt' | 'userId' | 'attachmentUrl'>
  >,
  todoId: string,
  userId: string
) {
  await client
    .update({
      TableName: todosTable,
      Key: { todoId, userId },
      ExpressionAttributeValues: {
        ':done': todo.done,
        ':dueDate': todo.dueDate,
        ':name': todo.name,
        ':userId': userId
      },
      ExpressionAttributeNames: { '#todoName': 'name' },
      ConditionExpression: 'userId = :userId',
      UpdateExpression:
        'set dueDate = :dueDate, done = :done, #todoName = :name'
    })
    .promise()

  return todo
}

export async function updateTodoAttachmentUrl(
  attachmentUrl: string,
  todoId: string,
  userId: string
) {
  return await client
    .update({
      TableName: todosTable,
      Key: { todoId, userId },
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl,
        ':userId': userId
      },
      ConditionExpression: 'userId = :userId',
      UpdateExpression: 'set attachmentUrl = :attachmentUrl'
    })
    .promise()
}

export async function deleteTodoById(todoId: string, userId: string) {
  return await client
    .delete({
      TableName: todosTable,
      Key: { todoId, userId },
      ConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId }
    })
    .promise()
}
