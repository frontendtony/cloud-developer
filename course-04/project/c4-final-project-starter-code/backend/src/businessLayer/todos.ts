import * as uuid from 'uuid'
import {
  createTodo,
  deleteTodoById,
  getTodosForUser,
  updateTodo as updateTodoData,
  updateTodoAttachmentUrl
} from '../dataLayer/todos'
import { generateSignedUrl } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function createNewTodo({
  payload,
  userId
}: {
  userId: string
  payload: CreateTodoRequest
}): Promise<TodoItem> {
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()

  const newTodo = { todoId, createdAt, done: false, userId, ...payload }

  return await createTodo(newTodo)
}

export async function getTodos(userId: string): Promise<Array<any>> {
  return await getTodosForUser(userId)
}

export async function deleteTodo({
  todoId,
  userId
}: {
  todoId: string
  userId: string
}): Promise<void> {
  await deleteTodoById(todoId, userId)
}

export async function updateTodo({
  todoId,
  userId,
  payload
}: {
  todoId: string
  userId: string
  payload: CreateTodoRequest
}): Promise<void> {
  await updateTodoData(payload, todoId, userId)
}

export async function generateUploadUrl({
  todoId,
  userId
}: {
  todoId: string
  userId: string
}): Promise<string> {
  const imageId = uuid.v4()
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

  const uploadUrl = await generateSignedUrl(imageId)

  await updateTodoAttachmentUrl(attachmentUrl, todoId, userId)

  return uploadUrl
}
