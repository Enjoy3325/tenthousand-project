import { Button } from '../../components/ui/Button'
import { PageLayout } from '../../components/layout/PageLayout'
import { QuestionType } from '../../app/api/generated'
import { Spinner } from '../../components/ui/Spinner'
import { useFormBuilder } from './useFormBuilder'

export function FormBuilderPage() {
  const {
    title,
    description,
    questions,
    hasUnsavedChanges,
    isLoading,
    canAddQuestion,
    handleTitleChange,
    handleDescriptionChange,
    handleTypeChange,
    handleQuestionTextChange,
    handleRequiredChange,
    handleOptionChange,
    onSave,
    handleAddQuestion,
    handleRemoveQuestion,
    handleAddOption,
    handleRemoveOption,
    handleReset,
  } = useFormBuilder()

  if (isLoading && questions.length === 0) {
    return (
      <PageLayout>
        <Spinner fullPage />
      </PageLayout>
    )
  }

  return (
    <PageLayout>

      <div className="builder__meta">
        <div className="field">
          <label className="label" htmlFor="form-title">Form title</label>
          <input
            id="form-title"
            type="text"
            placeholder="Untitled form"
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="form-desc">Description</label>
          <textarea
            id="form-desc"
            placeholder="Optional description…"
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
      </div>

      <div className="questions-list">
        {questions.map((q, index) => (
          <div key={q.id} className="question-card">

            <div className="question-card__header">
              <span className="question-card__number">Q{index + 1}</span>
              <select
                value={q.type}
                aria-label="Question type"
                onChange={(e) => handleTypeChange(e, q.id)}
              >
                <option value={QuestionType.Text}>Text</option>
                <option value={QuestionType.MultipleChoice}>Multiple choice</option>
                <option value={QuestionType.Checkbox}>Checkbox</option>
                <option value={QuestionType.Date}>Date</option>
              </select>
            </div>

            <div className="question-card__body">
              <div className="field">
                <input
                  type="text"
                  placeholder="Question text"
                  value={q.text}
                  aria-label={`Question ${index + 1} text`}
                  onChange={(e) => handleQuestionTextChange(e, q.id)}
                />
              </div>

              {(q.type === QuestionType.MultipleChoice ||
                q.type === QuestionType.Checkbox) && (
                <div className="options-list">
                  {q.options.map((opt) => (
                    <div key={opt.id} className="option-row">
                      <input
                        type="text"
                        placeholder="Option text"
                        value={opt.label}
                        aria-label="Option text"
                        onChange={(e) => handleOptionChange(e, q.id, opt.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remove option"
                        onClick={() => handleRemoveOption(q.id, opt.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddOption(q.id)}
                  >
                    + Add option
                  </Button>
                </div>
              )}
            </div>

            <div className="question-card__footer">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => handleRequiredChange(e, q.id)}
                />
                Required
              </label>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemoveQuestion(q.id)}
              >
                Remove
              </Button>
            </div>

          </div>
        ))}
      </div>

      <div className="builder__actions">
        <div className="builder__actions-left">
          <Button
            variant="secondary"
            disabled={!canAddQuestion}
            onClick={handleAddQuestion}
          >
            + Add question
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
        <div className="builder__actions-right">
          {hasUnsavedChanges && (
            <span className="alert alert--warning">Unsaved changes</span>
          )}
          <Button
            variant="primary"
            loading={isLoading}
            disabled={!title.trim()}
            onClick={onSave}
          >
            Save form
          </Button>
        </div>
      </div>

    </PageLayout>
  )
}