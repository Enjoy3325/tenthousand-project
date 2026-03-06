import { QuestionType } from "@tenthousand/shared"

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
  options?: Option[]
}

export interface Form {
  id: string
  title: string
  description?: string
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: string
  questionId: string
  value: string
}

export interface Response {
  id: string
  formId: string
  answers: Answer[]
  submittedAt: string
}

export const forms: Form[] = []
export const responses: Response[] = []