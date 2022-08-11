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
  dispatch: React.Dispatch<Action>
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
  totalDuration: number
  taskStartTime?: Date
}

export type TodoCardProps = {
  onDelete?: (todo: Todo) => void
  onTimer?: (todoId: ID, op: 'start' | 'stop' | 'cancel') => void
}

export const TodoCard: React.FC<
  CustomOnChange<Todo> & TodoCardProps & { todo: Todo }
> = ({ onChange, onDelete, onTimer, todo }) => {
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
          <button onClick={() => onTimer?.(todo.id, 'cancel')}>
            <FiX />
          </button>
        )}
        <button
          onClick={() =>
            onTimer?.(todo.id, todo.taskStartTime ? 'stop' : 'start')
          }
        >
          {todo.taskStartTime ? <FiSquare /> : <FiPlay />}
        </button>
      </div>
    </div>
  )
}

export function todoStopTimer(todo: Todo): Todo {
  if (!todo.taskStartTime) {
    return todo
  }

  const end = new Date()
  const duration = differenceInMilliseconds(end, todo.taskStartTime)

  return {
    ...todo,
    taskStartTime: undefined,
    taskTime: [
      ...todo.taskTime,
      {
        start: todo.taskStartTime,
        end: end,
        duration: duration,
      },
    ],
    totalDuration: todo.totalDuration + duration,
  }
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
  dispatch: React.Dispatch<Action>
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

  // function handleChangeTitle(newTitle: string) {
  //   setTitle(newTitle)
  // }
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
            onClick={() => {
              console.log('deleting', project.id)
              dispatch({
                type: 'DELETE',
                payload: {
                  type: 'DELETE_PROJECT',
                  payload: project,
                },
              })
            }}
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
          <button
            onClick={() => dispatch({ type: 'ADD_TODO', payload: project })}
          >
            Add Task
          </button>
        </nav>
        {todos.map((todo) => (
          <TodoCard
            todo={todo}
            onChange={(newTodo) =>
              dispatch({
                type: 'UPDATE_TODO',
                payload: newTodo,
              })
            }
            onTimer={(id, op) => {
              switch (op) {
                case 'start':
                  return dispatch({ type: 'TODO_TIMER_START', payload: id })
                case 'stop':
                  return dispatch({ type: 'TODO_TIMER_STOP', payload: id })
                case 'cancel':
                  return dispatch({ type: 'TODO_TIMER_CANCEL', payload: id })
              }
            }}
            onDelete={(todo) =>
              dispatch({
                type: 'DELETE',
                payload: { type: 'DELETE_TODO', payload: todo },
              })
            }
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

export type State = {
  projects: Project[]
  todos: Todo[]
  selectedProject: Project | null
  deleteOp?: DeleteAction
}

export type ID = string

export type TodoAction =
  | { type: 'TODO_TIMER_START'; payload: ID }
  | { type: 'TODO_TIMER_STOP'; payload: ID }
  | { type: 'TODO_TIMER_CANCEL'; payload: ID }

export type DeleteAction =
  | { type: 'DELETE_PROJECT'; payload: Project }
  | { type: 'DELETE_TODO'; payload: Todo }

export type Action =
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: Project }
  | { type: 'DELETE'; payload?: DeleteAction }
  | { type: 'ADD_NEW_PROJECT' }
  | { type: 'SELECT_PROJECT'; payload: Project | string }
  | { type: 'ADD_TODO'; payload: Project }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: Todo }
  | TodoAction

export function stateReducer(state: State, action: Action): State {
  console.log('stateReducer:', action)
  switch (action.type) {
    default:
      return state
    case 'DELETE': {
      const deleteAction = action.payload
      return {
        ...state,
        deleteOp: deleteAction,
      }
    }
    case 'UPDATE_PROJECT': {
      const { projects } = state
      const { payload: project } = action

      const selectedProject =
        state.selectedProject?.id === project.id
          ? project
          : state.selectedProject

      return {
        ...state,
        projects: projects.map((thisProject) =>
          thisProject.id === project.id ? project : thisProject
        ),
        selectedProject: selectedProject,
      }
    }
    case 'DELETE_PROJECT': {
      console.log('DELETE_PROJECT', action.payload)
      const projects = state.projects.filter(
        (proj) => proj.id !== action.payload.id
      )
      return {
        ...state,
        projects,
        selectedProject: projects[0] ?? null,
        deleteOp: undefined,
      }
    }
    case 'ADD_NEW_PROJECT': {
      const newProject: Project = {
        id: nanoid(),
        title: getRandomName(),
        description: '',
        dueDate: null,
      }

      return {
        ...state,
        projects: [...state.projects, newProject].sort(sortByTitle),
        selectedProject: newProject,
      }
    }
    case 'SELECT_PROJECT': {
      const { payload } = action
      const id = typeof payload === 'string' ? payload : payload.id
      const selectedProject = state.projects.find(
        (project) => project.id === id
      )

      return !selectedProject
        ? state
        : {
            ...state,
            selectedProject,
          }
    }
    //-- todo cases
    case 'ADD_TODO': {
      const { payload: project } = action

      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: nanoid(),
            title: getRandomName(),
            projectId: project.id,
            taskTime: [],
            totalDuration: 0,
          },
        ],
      }
    }
    case 'UPDATE_TODO': {
      const { payload: todo } = action

      return {
        ...state,
        todos: state.todos.map((td) => (td.id === todo.id ? todo : td)),
      }
    }
    case 'DELETE_TODO': {
      const { payload: todo } = action

      return {
        ...state,
        todos: state.todos.filter((td) => td.id !== todo.id),
        deleteOp: undefined,
      }
    }
    case 'TODO_TIMER_START': {
      console.log('TODO_TIMER_START')
      const id = action.payload
      const todos = state.todos.map(
        flow(
          E.fromPredicate((todo) => todo.id !== id, identity),
          E.map(todoStopTimer),
          E.fold(
            (todo) =>
              todo.taskStartTime
                ? todo
                : {
                    ...todo,
                    taskStartTime: new Date(),
                  },
            identity
          )
        )
      )

      return {
        ...state,
        todos: todos,
      }
    }
    case 'TODO_TIMER_STOP': {
      console.log('TODO_TIMER_STOP')
      const id = action.payload
      const todos = state.todos.map((todo) =>
        todo.id === id ? todoStopTimer(todo) : todo
      )

      return {
        ...state,
        todos: todos,
      }
    }
    case 'TODO_TIMER_CANCEL': {
      const id = action.payload
      const todos = state.todos.map((todo) =>
        todo.id !== id
          ? todo
          : {
              ...todo,
              taskStartTime: undefined,
            }
      )

      return {
        ...state,
        todos: todos,
      }
    }
  }
}

const DeleteModal: React.FC<{
  dispatch: React.Dispatch<Action>
  deleteAction?: DeleteAction
}> = ({ dispatch, deleteAction }) => {
  return (
    <Modal
      isOpen={!!deleteAction}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      onRequestClose={() => dispatch({ type: 'DELETE' })}
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
          onClick={() => dispatch({ type: 'DELETE' })}
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

  const [state, dispatch] = useReducer<(state: State, action: Action) => State>(
    stateReducer,
    { projects: [], todos: [], selectedProject: null }
  )

  const { projects, selectedProject } = state

  return (
    <>
      <DeleteModal dispatch={dispatch} deleteAction={state.deleteOp} />
      <header>
        <nav>
          <h1>Project Tracker</h1>
          <div className='project-controls'>
            {projects.length ? (
              <select
                value={selectedProject?.id}
                onChange={(e) =>
                  dispatch({ type: 'SELECT_PROJECT', payload: e.target.value })
                }
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
