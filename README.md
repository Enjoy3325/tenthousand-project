# FormLite

Fullstack monorepo — спрощений клон Google Forms. Тестове завдання.

## Стек

| Шар           | Технологія                                                |
| ------------- | --------------------------------------------------------- |
| Monorepo      | pnpm workspaces                                           |
| Server        | Apollo Server 5 · Express 5 · GraphQL · tsx               |
| Client        | React 18 · TypeScript · Vite                              |
| State         | Redux Toolkit · RTK Query                                 |
| Router        | React Router v6                                           |
| API           | GraphQL (graphql-request)                                 |
| Styles        | SCSS (BEM) · Inter · JetBrains Mono                       |
| Shared        | `@tenthousand/shared` — GraphQL schema + TypeScript types |
| Notifications | react-hot-toast                                           |
| Tests         | Vitest                                                    |

---

## Структура

```
apps/
  client/          # React SPA
  server/          # Apollo Server + Express
packages/
  shared/          # GraphQL schema + generated types
```

### Client

```
src/
├── app/
│   ├── api/
│   │   ├── baseApi.ts         # RTK Query base
│   │   ├── generated.ts       # Auto-generated hooks + types
│   │   └── operations.graphql # GraphQL операції
│   ├── hooks.ts               # useAppDispatch / useAppSelector
│   └── store.ts               # Redux store
├── components/
│   ├── layout/
│   │   ├── Header.tsx + Header.scss
│   │   └── PageLayout.tsx + PageLayout.scss
│   └── ui/
│       ├── Button.tsx
│       ├── Emptystate.tsx
│       └── Spinner.tsx
├── features/
│   ├── forms/
│   │   ├── formBuilderSlice.ts   # Redux slice
│   │   ├── useFormBuilder.ts     # Хук + вся логіка builder
│   │   ├── useFormFiller.ts      # Хук + вся логіка filler
│   │   ├── useForms.ts           # RTK Query wrapper
│   │   ├── useLoadForm.ts        # RTK Query wrapper
│   │   ├── FormBuilderPage.tsx
│   │   ├── FormFillPage.tsx
│   │   ├── FormFiller.tsx
│   │   └── HomePage.tsx
│   ├── responses/
│   │   ├── useResponses.ts       # useMemo O(n) lookup
│   │   └── FormResponsesPage.tsx
│   └── notFound/
│       └── NotFoundPage.tsx
├── constant.ts    # MAX_QUESTIONS, MIN_OPTIONS_FOR_CHOICE, etc.
├── index.scss     # Дизайн-система (SCSS BEM)
├── App.tsx        # Routes + Toaster
└── main.tsx
```

---

## Запуск

```bash
# Встановити залежності
pnpm install

# Запустити сервер (порт 4000)
cd apps/server && pnpm dev

# Запустити клієнт (порт 5173)
cd apps/client && pnpm dev
```

> Обидва сервіси мають бути запущені одночасно.

---

## Корисні команди

```bash
# Регенерувати типи з GraphQL схеми (сервер має бути запущений)
cd apps/client && pnpm codegen

# TypeScript перевірка
cd apps/client && pnpm tsc --noEmit

# Тести
cd apps/client && pnpm test
```

---

## Архітектурні рішення

### Поділ відповідальності

Компоненти містять **тільки JSX розмітку** — жодної бізнес-логіки, жодних `useState`, жодних `useEffect`. Вся логіка живе в хуках:

```
Компонент → імпортує хук → рендерить дані + прокидає хендлери
```

| Що                                | Де                  |
| --------------------------------- | ------------------- |
| `ChangeEvent` хендлери            | хук                 |
| `useEffect` (тости, beforeunload) | хук                 |
| `useState`                        | хук                 |
| Валідація                         | pure функція в хуку |
| JSX                               | компонент           |

### Redux тільки для FormBuilder

`formBuilderSlice` зберігає стан форми між рендерами бо це складний мультикроковий стан. Всі інші сторінки використовують RTK Query кеш — Redux там не потрібен.

### O(n) lookup у відповідях

В `useResponses` відповіді перетворюються в `Record<questionId, answer>` через `useMemo` один раз при зміні даних. Це дає O(1) доступ у JSX замість O(n) `.find()` на кожному рендері:

```
Без мапи: 10 питань × 100 відповідей = 1000 операцій
З мапою:  100 операцій для побудови + 10 × O(1) = ~110 операцій
```

### Форматування поза JSX

`shortId`, `submittedAt` форматуються в хуку і повертаються як готові рядки. JSX не містить `slice()`, `new Date()` чи інших обчислень.

---

## Дизайн-система

Скандинавський мінімалізм — теплий, без тіней, на бордерах.

```scss
--clr-bg: #f5f4f0; // теплий льон
--clr-surface: #fafaf8; // майже білий
--clr-accent: #1a1916; // чорний як єдиний акцент
--clr-border: #e2e0d8; // м'який бежевий

--font-sans: 'Inter';
--font-mono: 'JetBrains Mono';
```

Кнопки — чорні з теплим білим текстом (підхід Linear / Vercel / Notion).  
Радіуси — 4–14px, менш заокруглені ніж у Bootstrap.  
Тіні — майже відсутні, структуру тримає бордер.

---

## Тести

Тести покривають **чисті функції** — без React, без Redux, без моків:

- `validateForm` — валідація перед збереженням форми
- `validateAnswers` — валідація перед відправкою відповідей
- `buildAnswerMap` — O(n) побудова мапи відповідей
- `formatDate` — форматування дати

```bash
cd apps/client && pnpm test
```

---

## GraphQL операції

```graphql
query GetForms
query GetForm($id: ID!)
query GetResponses($formId: ID!)

mutation CreateForm($title: String!, $description: String, $questions: [QuestionInput!]!)
mutation SubmitResponse($formId: ID!, $answers: [AnswerInput!]!)
```

---

## Обмеження

| Константа                  | Значення |
| -------------------------- | -------- |
| `MAX_QUESTIONS`            | 12       |
| `MAX_OPTIONS_PER_QUESTION` | 12       |
| `MIN_OPTIONS_FOR_CHOICE`   | 2        |

---

## Що не реалізовано (out of scope)

- Редагування існуючих форм
- Видалення форм
- Автентифікація
- Пагінація відповідей
