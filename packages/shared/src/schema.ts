export const typeDefs = /* GraphQL */ `
  enum QuestionType {
    TEXT
    MULTIPLE_CHOICE
    CHECKBOX
    DATE
  }

  type Option {
    id: ID!
    label: String!
  }

  type Question {
    id: ID!
    formId: ID!
    text: String!
    type: QuestionType!
    required: Boolean!
    order: Int!
    options: [Option!]
  }

  type Form {
    id: ID!
    title: String!
    description: String
    questions: [Question!]!
    createdAt: String!
    updatedAt: String!
  }

  type Answer {
    id: ID!
    questionId: ID!
    value: String!
  }

  type Response {
    id: ID!
    formId: ID!
    answers: [Answer!]!
    submittedAt: String!
  }

  input OptionInput {
    label: String!
  }

  input QuestionInput {
    text: String!
    type: QuestionType!
    required: Boolean!
    order: Int!
    options: [OptionInput!]
  }

  input AnswerInput {
    questionId: ID!
    value: String!
  }

  type Query {
    forms: [Form!]!
    form(id: ID!): Form
    responses(formId: ID!): [Response!]!
  }

  type Mutation {
    createForm(
      title: String!
      description: String
      questions: [QuestionInput!]
    ): Form!

    submitResponse(
      formId: ID!
      answers: [AnswerInput!]!
    ): Response!
  }
`