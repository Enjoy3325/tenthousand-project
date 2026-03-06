import { forms, responses } from "../store"

import { v4 as uuid } from "uuid"

export const resolvers = {
  Query: {
    forms: () => forms,

    form: (_: unknown, { id }: { id: string }) => {
      return forms.find((f) => f.id === id)
    },

    responses: (_: unknown, { formId }: { formId: string }) => {
      return responses.filter((r) => r.formId === formId)
    }
  },

  Mutation: {
    createForm: (
      _: unknown,
      {
        title,
        description,
        questions
      }: {
        title: string
        description?: string
        questions: any[]
      }
    ) => {
      const formId = uuid()

      const newForm = {
        id: formId,
        title,
        description,
        questions: (questions || []).map((q, index) => ({
          id: uuid(),
          formId,
          text: q.text,
          type: q.type,
          required: q.required,
          order: q.order ?? index,
          options: q.options?.map((o: any) => ({
            id: uuid(),
            label: o.label
          }))
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      forms.push(newForm)

      return newForm
    },

    submitResponse: (
      _: unknown,
      {
        formId,
        answers
      }: {
        formId: string
        answers: { questionId: string; value: string }[]
      }
    ) => {
      const newResponse = {
        id: uuid(),
        formId,
        answers: answers.map((a) => ({
          id: uuid(),
          questionId: a.questionId,
          value: a.value
        })),
        submittedAt: new Date().toISOString()
      }

      responses.push(newResponse)

      return newResponse
    }
  }
}