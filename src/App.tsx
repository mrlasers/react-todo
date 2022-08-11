// import reactLogo from './assets/react.svg'
import './App.scss'

import {
  differenceInDays,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInSeconds,
  format,
  isDate,
} from 'date-fns'
import * as E from 'fp-ts/Either'
import { flow, identity, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { nanoid } from 'nanoid'
import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import {
  FiClock,
  FiDelete,
  FiMenu,
  FiPause,
  FiPlay,
  FiPlus,
  FiPlusCircle,
  FiSquare,
  FiStopCircle,
  FiTrash2,
  FiWatch,
  FiX,
} from 'react-icons/fi'
import Modal from 'react-modal'

import { getRandomName } from './helpers'
import {
  newProject,
  newTodo,
  removeTodo,
  replaceTodo,
  startTodoTimer,
  todoCancelTimer,
  todoStopTimer,
} from './helpers/update'

Modal.setAppElement('#root')

export type Project = {
  id: string
  title: string
  description: string
  dueDate: string | null
}

export type ProjectKeys = keyof Exclude<Project, 'id'>

//-- components

export type CustomOnChange<T> = {
  onChange?: (value: T) => void
}

export type WithDispatch = {
  dispatch: React.Dispatch<Msg>
}

//-- TODO

export type Todo = {
  id: string
  title: string
  projectId: string
  taskTime: {
    start: Date
    end: Date
    duration: number
  }[]
  lastWorked?: Date
  totalDuration: number
  taskStartTime?: Date
}

export type TodoCardProps = {
  onDelete?: (todo: Todo) => void
  onTimerStart?: (id: ID) => void
  onTimerStop?: (id: ID) => void
  onTimerCancel?: (id: ID) => void
}

export const TodoCard: React.FC<
  CustomOnChange<Todo> & TodoCardProps & { todo: Todo }
> = ({
  onChange,
  onDelete,
  onTimerStart,
  onTimerStop,
  onTimerCancel,
  todo,
}) => {
  return (
    <div className='todo-card'>
      <TextInput
        type='text'
        value={todo.title}
        onChange={(title) => onChange && onChange({ ...todo, title })}
      />
      <div>
        <button onClick={() => onDelete?.(todo)}>
          <FiTrash2 />
        </button>
        {!todo.taskStartTime ? null : (
          <button onClick={() => onTimerCancel?.(todo.id)}>
            <FiX />
          </button>
        )}
        <button
          onClick={() =>
            todo.taskStartTime
              ? onTimerStop?.(todo.id)
              : onTimerStart?.(todo.id)
          }
        >
          {todo.taskStartTime ? <FiSquare /> : <FiPlay />}
        </button>
      </div>
    </div>
  )
}

export const DueDatePicker: React.FC<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> &
    CustomOnChange<string> & { value: string | null }
> = (props) => {
  const { children, onChange, value, ...attrs } = props

  const daysLeft = !value
    ? null
    : differenceInDays(new Date(value), new Date(getDateValue()))

  return (
    <button
      {...attrs}
      className={
        !daysLeft ? '' : daysLeft <= 1 ? 'warn' : daysLeft <= 7 ? 'chill' : ''
      }
      style={{ position: 'relative' }}
    >
      <input
        required
        value={value ?? ''}
        type='date'
        onChange={(e) => {
          onChange && onChange(e.target.value)
        }}
        onClick={(e) => {
          console.log('click')
        }}
        style={{
          opacity: 0,
          // border: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999999,
        }}
      />
      <FiClock /> <span>{value && format(new Date(value), 'MMM d')}</span>
      {/* {children} */}
    </button>
  )
}

export type TextInputProps = {
  onChange?: (text: string) => void
}

/**
 * Text <input/> that selects text `onFocus` and calls `onChange` on blur
 *
 * blurs on `Escape` or `Enter` keys
 */
export const TextInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & TextInputProps
> = (props) => {
  const [text, setText] = useState(
    typeof props.value === 'string' ? props.value : ''
  )

  const { onChange, ...attrs } = props

  useEffect(() => {
    setText(typeof props.value === 'string' ? props.value : text)
  }, [props.value])

  return (
    <input
      {...attrs}
      type='text'
      // ref={ref}
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) =>
        (e.key === 'Escape' || e.key === 'Enter') && e.currentTarget.blur()
      }
      onInput={(e) => setText(e.currentTarget.value)}
      onBlur={(e) => props.onChange && props.onChange(text)}
      value={text}
    />
  )
}

export type ProjectCardProps = {
  project: Project
  todos: Todo[]
  dispatch: React.Dispatch<Msg>
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  todos,
  dispatch,
}) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const textareaEl = useRef<HTMLTextAreaElement>(null)
  const [isCtrlsActive, setIsCtrlsActive] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)

  function handleChangeDescription(newDescription: string) {
    setDescription(newDescription)
  }

  function handleOnChange() {
    setIsCtrlsActive(false)
    if (!title) {
      return setTitle(project.title)
    }

    dispatch({
      type: 'UPDATE_PROJECT',
      payload: {
        ...project,
        title: title ?? project.title,
        description: description ?? project.description,
      },
    })
  }

  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    setTitle(project.title)
    setDescription(project.description)
  }, [project])

  return project === null ? null : (
    <div className='project-card'>
      <div className={'header' + (isCtrlsActive ? ' active' : '')}>
        <TextInput
          type='text'
          className='project-title'
          value={title}
          onBlur={handleOnChange}
          onChange={(title) => {
            return dispatch({
              type: 'UPDATE_PROJECT',
              payload: { ...project, title: title },
            })
          }}
        />
        <nav>
          <DueDatePicker
            value={project.dueDate}
            onChange={(date) =>
              dispatch({
                type: 'UPDATE_PROJECT',
                payload: {
                  ...project,
                  dueDate: date,
                },
              })
            }
          >
            <FiClock />
          </DueDatePicker>
          <button
            title='Delete?'
            onClick={flow(() => msgDeleteProject(project), dispatch)}
          >
            <FiTrash2 />
          </button>
        </nav>
      </div>
      <div className='description'>
        <textarea
          ref={textareaEl}
          spellCheck={false}
          placeholder='Enter description, notes, etc., here...'
          value={description}
          onBlur={handleOnChange}
          onKeyDown={(e) =>
            e.key === 'Escape' &&
            textareaEl.current &&
            textareaEl.current.blur()
          }
          onInput={(e) => handleChangeDescription(e.currentTarget.value)}
        ></textarea>
      </div>
      <div className='todos-list'>
        <h3>Todos</h3>
        <nav>
          <button onClick={flow(() => msgAddTodo(project), dispatch)}>
            Add Task
          </button>
        </nav>
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onChange={flow(msgUpdateTodo, dispatch)}
            onTimerStart={flow(msgTodoTimerStart, dispatch)}
            onTimerStop={flow(msgTodoTimerStop, dispatch)}
            onTimerCancel={flow(msgTodoTimerCancel, dispatch)}
            onDelete={flow(() => msgDeleteTodo(todo), dispatch)}
          />
        ))}
      </div>
    </div>
  )
}

//-- little helper functions

export const sortByTitle = (a: Project, b: Project) =>
  a.title > b.title ? 1 : -1

export const getDateValue = (date?: Date) => {
  const now = date ?? new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  return `${year}-${month}-${day}`
}

//-- state reducer and stuff

export type Model = {
  projects: Project[]
  todos: Todo[]
  selectedProject: Project | null
  deleteOp?: DeleteMsg
}

export type ID = string

export type TODO_TIMER_START = msg<'TODO_TIMER_START', ID>
export type TODO_TIMER_STOP = msg<'TODO_TIMER_STOP', ID>
export type TODO_TIMER_CANCEL = msg<'TODO_TIMER_CANCEL', ID>

export type TodoMsg = TODO_TIMER_START | TODO_TIMER_STOP | TODO_TIMER_CANCEL

export type DeleteMsgProject = { type: 'DELETE_PROJECT'; payload: Project }
export type DeleteMsgTodo = { type: 'DELETE_TODO'; payload: Todo }

export type DeleteMsg = DeleteMsgProject | DeleteMsgTodo

export type msg<T extends string, P extends any> = { type: T; payload: P }

export type UPDATE_PROJECT = msg<'UPDATE_PROJECT', Project>
export type DELETE_PROJECT = msg<'DELETE_PROJECT', Project>

export type SELECT_PROJECT = msg<'SELECT_PROJECT', ID>
export type DELETE_SOMETHING = msg<'DELETE_SOMETHING', DeleteMsg | undefined>

export type ADD_TODO = msg<'ADD_TODO', Project>
export type UPDATE_TODO = msg<'UPDATE_TODO', Todo>

export type Msg =
  | UPDATE_PROJECT
  | DELETE_PROJECT
  // | { type: 'DELETE'; payload?: DeleteMsg }
  | DELETE_SOMETHING
  | { type: 'ADD_NEW_PROJECT'; payload?: never }
  // | { type: 'SELECT_PROJECT'; payload: Project | string }
  | SELECT_PROJECT
  // | { type: 'ADD_TODO'; payload: Project }
  | ADD_TODO
  | UPDATE_TODO
  | { type: 'DELETE_TODO'; payload: Todo }
  | TodoMsg

export function msgCreator<T extends Msg>(type: T['type']) {
  return (payload: T['payload']) => {
    return { type, payload }
  }
}

const updateProject = msgCreator<UPDATE_PROJECT>('UPDATE_PROJECT')
const deleteProject = msgCreator<DELETE_PROJECT>('DELETE_PROJECT')

const msgTodoTimerStart = msgCreator<TODO_TIMER_START>('TODO_TIMER_START')
const msgTodoTimerStop = msgCreator<TODO_TIMER_STOP>('TODO_TIMER_STOP')
const msgTodoTimerCancel = msgCreator<TODO_TIMER_CANCEL>('TODO_TIMER_CANCEL')

const msgSelectProject = msgCreator<SELECT_PROJECT>('SELECT_PROJECT')

const msgAddTodo = msgCreator<ADD_TODO>('ADD_TODO')
const msgUpdateTodo = msgCreator<UPDATE_TODO>('UPDATE_TODO')

const msgDeleteSomething = <T extends DELETE_SOMETHING>(
  something?: T['payload']
) => msgCreator<DELETE_SOMETHING>('DELETE_SOMETHING')(something)

const msgDeleteProject = (project: Project) =>
  msgCreator<DELETE_SOMETHING>('DELETE_SOMETHING')({
    type: 'DELETE_PROJECT',
    payload: project,
  })
const msgDeleteTodo = (todo: Todo) =>
  msgCreator<DELETE_SOMETHING>('DELETE_SOMETHING')({
    type: 'DELETE_TODO',
    payload: todo,
  })

export function update(model: Model, msg: Msg): Model {
  switch (msg.type) {
    default:
      return model
    case 'DELETE_SOMETHING': {
      const deleteAction = msg.payload
      return {
        ...model,
        deleteOp: deleteAction,
      }
    }
    case 'UPDATE_PROJECT': {
      return {
        ...model,
        projects: model.projects.map((thisProject) =>
          thisProject.id === msg.payload.id ? msg.payload : thisProject
        ),
        selectedProject:
          model.selectedProject?.id === msg.payload.id
            ? msg.payload
            : model.selectedProject,
      }
    }
    case 'DELETE_PROJECT': {
      return pipe(
        model.projects.filter((proj) => proj.id !== msg.payload.id),
        (projects) => ({
          ...model,
          projects,
          selectedProject: projects[0] ?? null,
          deleteOp: undefined,
        })
      )
    }
    case 'ADD_NEW_PROJECT': {
      return pipe(newProject(), (project) => ({
        ...model,
        projects: [...model.projects, project].sort(sortByTitle),
        selectedProject: project,
      }))
    }
    case 'SELECT_PROJECT': {
      return pipe(
        O.fromNullable(
          model.projects.find((project) => project.id === msg.payload)
        ),
        O.map((selectedProject) => ({ ...model, selectedProject })),
        O.getOrElse(() => model)
      )
    }
    //-- todo cases
    case 'ADD_TODO': {
      return {
        ...model,
        todos: [...model.todos, newTodo(msg.payload)],
      }
    }
    case 'UPDATE_TODO': {
      return {
        ...model,
        todos: replaceTodo(model.todos, msg.payload),
      }
    }
    case 'DELETE_TODO': {
      return {
        ...model,
        todos: removeTodo(model.todos, msg.payload),
        deleteOp: undefined,
      }
    }
    case 'TODO_TIMER_START': {
      return {
        ...model,
        todos: startTodoTimer(model.todos, msg.payload),
      }
    }
    case 'TODO_TIMER_STOP': {
      return {
        ...model,
        todos: model.todos.map(todoStopTimer),
      }
    }
    case 'TODO_TIMER_CANCEL': {
      return {
        ...model,
        todos: model.todos.map(todoCancelTimer),
      }
    }
  }
}

const DeleteModal: React.FC<{
  dispatch: React.Dispatch<Msg>
  deleteMsg: DeleteMsg
}> = ({ dispatch, deleteMsg: deleteAction }) => {
  return (
    <Modal
      isOpen={!!deleteAction}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      onRequestClose={flow(() => msgDeleteSomething(undefined), dispatch)}
      className='Modal'
      overlayClassName='Overlay'
    >
      <h2>
        Delete {deleteAction?.type === 'DELETE_PROJECT' ? 'Project' : 'Todo???'}{' '}
        <em>{deleteAction?.payload.title}</em>
      </h2>
      <div className='buttons'>
        <button
          className='soft-button'
          onClick={flow(() => msgDeleteSomething(undefined), dispatch)}
          // onClick={() => dispatch({ type: 'DELETE_SOMETHING' })}
        >
          Cancel
        </button>
        <button
          className='soft-button'
          onClick={() => deleteAction && dispatch(deleteAction)}
        >
          Confirm
        </button>
      </div>
    </Modal>
  )
}

const App = () => {
  const deleteDialogRef = useRef<React.LegacyRef<HTMLDialogElement>>(null)

  const [state, dispatch] = useReducer<(state: Model, action: Msg) => Model>(
    update,
    { projects: [], todos: [], selectedProject: null }
  )

  const { projects, selectedProject } = state

  return (
    <>
      {state.deleteOp && (
        <DeleteModal dispatch={dispatch} deleteMsg={state.deleteOp} />
      )}
      <header>
        <nav>
          <h1>Project Tracker</h1>
          <div className='project-controls'>
            {projects.length ? (
              <select
                value={selectedProject?.id}
                onChange={flow(
                  ({ target }) => target.value,
                  msgSelectProject,
                  dispatch
                )}
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            ) : null}
            <button onClick={() => dispatch({ type: 'ADD_NEW_PROJECT' })}>
              New Project
            </button>
          </div>
        </nav>
      </header>
      <main>
        {selectedProject && (
          <ProjectCard
            project={selectedProject}
            todos={state.todos.filter(
              (td) => td.projectId === selectedProject.id
            )}
            dispatch={dispatch}
          />
        )}

        <code>
          <pre>{JSON.stringify(state.todos, null, 2)}</pre>
        </code>
      </main>
    </>
  )
}

export default App
