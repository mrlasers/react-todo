// import reactLogo from './assets/react.svg'
import './App.scss'

import { nanoid } from 'nanoid'
import { useEffect, useReducer, useState } from 'react'
import { FiDelete, FiMenu, FiPause, FiPlay, FiPlus, FiTrash2, FiWatch, FiX } from 'react-icons/fi'

export type Project = {
  id: string
  title: string
  description: string
}

function useTodoProjects() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects([
      {
        id: nanoid(),
        title: 'Untitled Project 1',
        description: '',
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
      },
    ])
  }

  return { addNewProject, projects }
}

const App = () => {
  const { projects, addNewProject } = useTodoProjects()

  return (
    <>
      <header>
        <nav>
          <h1>Project Tracker</h1>
        </nav>
      </header>
      <main>
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
                  title='Add task and start time tracking'>
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
