import { createSlice, nanoid } from '@reduxjs/toolkit'

import type { PayloadAction } from '@reduxjs/toolkit'
import { QuestionType } from '@tenthousand/shared'
import type { RootState } from '../../app/store'

// ─── Types ───



// Local option type — for builder state
export interface BuilderOption {
  id: string       // nanoid() — used as key in React lists
  label: string    // option text like "Yes" / "No"
}


// Local question type — different from server type
// because here id is generated on the client (nanoid), not on the server
export interface BuilderQuestion {
  id: string
  text: string
  type: QuestionType
  required: boolean
  order: number
  options: BuilderOption[]
}


export type UpdateQuestionPatch = Partial<Omit<BuilderQuestion, 'id' | 'options'>>


// Slice state
export interface FormBuilderState {
  title: string
  description: string
  questions: BuilderQuestion[]
  hasUnsavedChanges: boolean   // whether there are unsaved changes — for UX ("Save" prompt)
}


// ─── Initial state ───


const initialState: FormBuilderState = {
  title: '',
  description: '',
  questions: [],
  hasUnsavedChanges: false,
}


// ─── Helper ───

function makeQuestion(order: number): BuilderQuestion {
  return {
    id: nanoid(),
    text: '',
    type: QuestionType.Text,
    required: false,
    order,
    options: [],
  }
}


// ─── Slice ───


export const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    // Reset builder state — after form is saved
    resetBuilder: () => initialState,


    // Change form title
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
      state.hasUnsavedChanges = true
    },


    // Change form description
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload
      state.hasUnsavedChanges = true
    },


    // Add a new empty question
    addQuestion: (state) => {
      state.questions.push(makeQuestion(state.questions.length))
      state.hasUnsavedChanges = true
    },


    // Remove question by id + recalculate order
    removeQuestion: (state, action: PayloadAction<string>) => {
      state.questions = state.questions
        .filter((q) => q.id !== action.payload)
        .map((q, idx) => ({ ...q, order: idx }))
      state.hasUnsavedChanges = true
    },


    // Update any question field
    updateQuestion: (
      state,
      action: PayloadAction<{
        id: string
        patch: Partial<Omit<BuilderQuestion, 'id' | 'options'>>
      }>
    ) => {
      const question = state.questions.find((q) => q.id === action.payload.id)
      if (!question) return

      Object.assign(question, action.payload.patch)

      // If type changed to non-choice — clear options
      const isChoiceType =
        action.payload.patch.type === QuestionType.MultipleChoice ||
        action.payload.patch.type === QuestionType.Checkbox
      if (action.payload.patch.type && !isChoiceType) {
        question.options = []
      }

      state.hasUnsavedChanges = true
    },


    // Add option to question
    addOption: (state, action: PayloadAction<string>) => {
      const question = state.questions.find((q) => q.id === action.payload)
      if (!question) return
      question.options.push({ id: nanoid(), label: '' })
      state.hasUnsavedChanges = true
    },


    // Update option label
    updateOption: (
      state,
      action: PayloadAction<{
        questionId: string
        optionId: string
        label: string
      }>
    ) => {
      const question = state.questions.find(
        (q) => q.id === action.payload.questionId
      )
      const option = question?.options.find(
        (o) => o.id === action.payload.optionId
      )
      if (!option) return
      option.label = action.payload.label
      state.hasUnsavedChanges = true
    },


    // Remove option
    removeOption: (
      state,
      action: PayloadAction<{ questionId: string; optionId: string }>
    ) => {
      const question = state.questions.find(
        (q) => q.id === action.payload.questionId
      )
      if (!question) return
      question.options = question.options.filter(
        (o) => o.id !== action.payload.optionId
      )
      state.hasUnsavedChanges = true
    },
  },
})


// ─── Export actions ───


export const {
  resetBuilder,
  setTitle,
  setDescription,
  addQuestion,
  removeQuestion,
  updateQuestion,
  addOption,
  updateOption,
  removeOption,
} = formBuilderSlice.actions


export const formBuilderReducer = formBuilderSlice.reducer


// ─── Selectors ───


export const selectTitle = (state: RootState) => state.formBuilder.title
export const selectDescription = (state: RootState) => state.formBuilder.description
export const selectQuestions = (state: RootState) => state.formBuilder.questions
export const selectHasUnsavedChanges = (state: RootState) => state.formBuilder.hasUnsavedChanges
