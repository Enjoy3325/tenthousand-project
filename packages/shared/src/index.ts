export { typeDefs } from './schema.js'

export enum QuestionType {
  Text = 'TEXT',
  MultipleChoice = 'MULTIPLE_CHOICE',
  Checkbox = 'CHECKBOX',
  Date = 'DATE',
}

export interface Option {
  id: string
  label: string
}

export interface Question {
  id: string
  formId: string
  text: string
  type: QuestionType
  required: boolean
  order: number
  options?: Option[] | null
}

export interface Form {
  id: string
  title: string
  description?: string | null
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: string
  questionId: string
  value: string
}

export interface FormResponse {
  id: string
  formId: string
  answers: Answer[]
  submittedAt: string
}

export interface QuestionInput {
  text: string
  type: QuestionType
  required: boolean
  order: number
  options?: Array<{ label: string }> | null
}

export interface AnswerInput {
  questionId: string
  value: string
}