// import reactLogo from './assets/react.svg'
import './App.scss'

import { nanoid } from 'nanoid'
import { useEffect, useReducer, useRef, useState } from 'react'
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
  todos: Todo[]
}

export type ProjectKeys = keyof Exclude<Project, 'id'>

export type Todo = {
  id: string
  title: string
}

const adjectives = [
  'Funky',
  'Dopey',
  'Retarded',
  'Sleepy',
  'Crazy',
  'Chubby',
  'Skinny',
  'Hefty',
  'Corny',
  'Tony the',
  'That One',
  'Big Booty',
]
const animals = [
  'Dog',
  'Cat',
  'Giraffe',
  'Shark',
  'T-Rex',
  'Otter',
  'Lion',
  'Tiger',
  'Bonobo',
  'Space Monkey',
  'Human',
  'Rabbit',
  'Squirrel',
  'Elephant',
  'Gorilla',
  'Wolf',
  'Cougar',
]

function getRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const name = adjective + ' ' + animal

  return name === 'Retarded Dog' ? getRandomName() : name
}

function useTodoProjects() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects([
      {
        id: nanoid(),
        title: 'Untitled Project 1',
        description: '',
        todos: [],
      },
    ])
  }, [])

  function addNewProject() {
    setProjects([
      ...projects,
      {
        id: nanoid(),
        title: 'Untitled Project ' + (projects.length + 1),
        description: '',
        todos: [],
      },
    ])
  }

  return { addNewProject, projects }
}

export type ProjectCardProps = {
  project: Project
  onChange: (project: Project) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onChange,
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

    const newProject = {
      ...project,
      title: title ?? project.title,
      description: description ?? project.title,
    }

    onChange(newProject)
  }

  useEffect(() => {
    setTitle(project.title)
    setDescription(project.description)
  }, [project])

  return project === null ? null : (
    <div className='project-card'>
      <div className={'header' + (isCtrlsActive ? ' active' : '')}>
        <input
          ref={inputEl}
          type='text'
          className='project-title'
          value={title}
          onFocus={() => {
            setIsCtrlsActive(true)
            inputEl.current && inputEl.current.select()
          }}
          onBlur={handleOnChange}
          onKeyDown={(e) =>
            e.key === 'Escape' && inputEl.current && inputEl.current.blur()
          }
          onInput={(e) => {
            console.log(e.currentTarget.value)

            return handleChangeTitle(e.currentTarget.value)
          }}
        />
        <nav>
          <button title='Add due date'>
            <FiClock />
          </button>
          <button title='Delete?'>
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
    </div>
  )
}

const App = () => {
  // const { projects, addNewProject } = useTodoProjects()

  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  function addNewProject() {
    const newProject: Project = {
      id: nanoid(),
      title: getRandomName(),
      description: '',
      todos: [],
    }

    setProjects(
      [...projects, newProject].sort((a, b) => (a.title > b.title ? 1 : -1))
    )
    setSelectedProject(newProject)
  }

  function updateSelectedProject(project: Project) {
    setSelectedProject(project)
    setProjects(
      projects
        .map((proj) => (proj.id === project.id ? project : proj))
        .sort((a, b) => (a.title > b.title ? 1 : -1))
    )
  }

  function selectProject(id: string) {
    const project = projects.find((proj) => proj.id === id)

    if (project) {
      setSelectedProject(project)
    }
  }

  return (
    <>
      <header>
        <nav>
          <h1>Project Tracker</h1>
          <div className='project-controls'>
            {projects.length ? (
              <select
                value={selectedProject?.id}
                onChange={(e) => selectProject(e.target.value)}
              >
                {/* <option value={'boop'}>Boop</option> */}
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            ) : null}
            <button onClick={addNewProject}>New Project</button>
          </div>
        </nav>
      </header>
      {/* <code>
        <pre>{JSON.stringify(projects)}</pre>
      </code> */}
      <main>
        {selectedProject && (
          <ProjectCard
            project={selectedProject}
            onChange={updateSelectedProject}
          />
        )}
        <hr />
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
              {/* <h3 className='title'>Work on todo app</h3> */}
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
                {/* <span className='button'>
                  <FiPlay />
                </span> */}
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
              {/* <h3 className='title'>Reply to emails</h3> */}
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
        </section>
      </main>
    </>
  )
}

export default App
