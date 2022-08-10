// import reactLogo from './assets/react.svg'
import './App.scss'

import { differenceInDays, format } from 'date-fns'
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
  FiTrash2,
  FiWatch,
  FiX,
} from 'react-icons/fi'

export type Project = {
  id: string
  title: string
  description: string
  dueDate: string | null
  todos: Todo[]
}

export type ProjectKeys = keyof Exclude<Project, 'id'>

export type Todo = {
  id: string
  title: string
}

const adjectives = [
  'Big Booty',
  'Chubby',
  'Chunky',
  'Corny',
  'Crazy',
  'Dopey',
  'Fast',
  'Funky',
  'Hefty',
  'Skinny',
  'Sleepy',
  'That One',
  'Tony the',
]
const animals = [
  'Bonobo',
  'Cat',
  'Cheetah',
  'Cougar',
  'Dog',
  'Elephant',
  'Giraffe',
  'Gorilla',
  'Human',
  'Lion',
  'Orca',
  'Otter',
  'Rabbit',
  'Shark',
  'Space Monkey',
  'Squirrel',
  'T-Rex',
  'Tiger',
  'Wolf',
]

function getRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const name = adjective + ' ' + animal

  return name
}

//-- components

export type CustomOnChange<T> = {
  onChange?: (value: T) => void
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
        (e.key === 'Escape' || e.key === 'Enter') && e.target.blur()
      }
      onInput={(e) => setText(e.currentTarget.value)}
      onBlur={(e) => props.onChange && props.onChange(text)}
      value={text}
    />
  )
}

export type ProjectCardProps = {
  project: Project
  dispatch: React.Dispatch<Action>
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  dispatch,
}) => {
  const inputEl = useRef<HTMLInputElement>(null)
  const textareaEl = useRef<HTMLTextAreaElement>(null)
  const [isCtrlsActive, setIsCtrlsActive] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)

  function handleChangeTitle(newTitle: string) {
    setTitle(newTitle)
  }
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

    // const newProject = {
    //   ...project,
    //   title: title ?? project.title,
    //   description: description ?? project.title,
    // }

    // onChange(newProject)
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
              dispatch({ type: 'DELETE_PROJECT', payload: project })
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
        {project.todos.map((todo) => (
          <div>{todo.title}</div>
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
  selectedProject: Project | null
}

export type Action =
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: Project }
  | { type: 'ADD_NEW_PROJECT' }
  | { type: 'SELECT_PROJECT'; payload: Project | string }

export function stateReducer(state: State, action: Action): State {
  switch (action.type) {
    default:
      return state
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
      const projects = state.projects.filter(
        (proj) => proj.id !== action.payload.id
      )
      return {
        ...state,
        projects,
        selectedProject: projects[0] ?? null,
      }
    }
    case 'ADD_NEW_PROJECT': {
      const newProject: Project = {
        id: nanoid(),
        title: getRandomName(),
        description: '',
        dueDate: null,
        todos: [],
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
  }
}

const App = () => {
  const [state, dispatch] = useReducer<(state: State, action: Action) => State>(
    stateReducer,
    { projects: [], selectedProject: null }
  )

  const { projects, selectedProject } = state

  // useEffect(() => {
  //   console.log('rerendering app')
  // }, [state])

  return (
    <>
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
      {/* <code>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </code> */}
      <main>
        {selectedProject && (
          <ProjectCard project={selectedProject} dispatch={dispatch} />
        )}

        {/* <hr />
        <section className='project-card'>
          <div className='header'>
            <div>
              <input
                type='text'
                className='project-title'
                value='Project Title'
              />
            </div>
            <div className='button'>
              <FiMenu />
            </div>
          </div>
          <div className='description'>
            <textarea spellCheck={false}>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Perferendis dolores laborum illo fuga, suscipit ut in! Ea possimus
              nesciunt fugit incidunt quae eum iste. Reprehenderit esse
              consequatur, porro deserunt fugiat omnis corporis? Exercitationem,
              deleniti? Excepturi, recusandae. Repellendus porro possimus vitae
              vero iure nulla provident nam?
            </textarea>
          </div>
        </section>
        <section className='task-list'>
          <ul>
            <li className='active'>
              <input
                className='title'
                type='text'
                defaultValue='Work on some todo app'
              />
              <div className='time'>
                3 <FiWatch /> 0:15:32
              </div>
              <nav className='task-ctrls'>
                <span className='button'>
                  <FiX />
                </span>
                <span className='button'>
                  <FiPause />
                </span>
              </nav>
            </li>
            <li className='new-task'>
              <input type='text' className='title' />
              <nav className='task-ctrls'>
                <span className='button' title='Add task'>
                  <FiPlus />
                </span>
                <span
                  className='button'
                  title='Add task and start time tracking'
                >
                  <FiPlay />
                </span>
              </nav>
            </li>
            <li>
              <input
                className='title'
                type='text'
                defaultValue='Reply to emails'
              />
              <div className='time'>
                0 <FiWatch /> -:--:--
              </div>
              <nav className='task-ctrls'>
                <span className='button'>
                  <FiTrash2 />
                </span>
                <span className='button'>
                  <FiPlay />
                </span>
              </nav>
            </li>
          </ul>
        </section> */}
      </main>
    </>
  )
}

export default App
