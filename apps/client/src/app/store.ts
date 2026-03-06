import { baseApi } from './api/baseApi'
import { configureStore } from '@reduxjs/toolkit'
import { formBuilderReducer } from '../features/forms/formBuilderSlice'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    formBuilder: formBuilderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch