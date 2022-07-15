import { useState, useEffect, useReducer } from 'react'
// import reactLogo from './assets/react.svg'
import './App.css'

import { Task, PartialTask } from './types'
import NewTask from './components/NewTask'
import TaskCards from './components/TaskCards'
import Navbar from './components/Navbar'
import { nanoid } from 'nanoid'

type State = {
  nextId: string
  tasks: Task[]
}

type Action =
  | { type: 'addTask'; payload: PartialTask }
  | {
      type: 'updateTask'
      payload: Task
    }
  | {
      type: 'deleteTask'
      payload: string | null
    }

const initialState = localStorage.getItem('todo-state')

const stateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    default:
      return state
    case 'addTask':
      return {
        ...state,
        nextId: nanoid(),
        tasks: [
          ...state.tasks,
          {
            description: '',
            dueDate: '',
            status: 'incomplete',
            assignedTo: '',
            id: state.nextId,
            createdAt: new Date().toISOString(),
            ...action.payload,
          },
        ],
      }
    case 'updateTask':
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          return task.id === action.payload.id ? action.payload : task
        }),
      }
    case 'deleteTask':
      return action.payload === null
        ? { ...state, tasks: [] }
        : {
            ...state,
            tasks: state.tasks.filter((task) => task.id !== action.payload),
          }
  }
}

function App() {
  const [state, dispatch] = useReducer(
    stateReducer,
    initialState ? JSON.parse(initialState) : { nextId: 0, tasks: [] }
  )

  useEffect(() => {
    localStorage.setItem('todo-state', JSON.stringify(state))
  }, [state])

  const addNewTask = (task: PartialTask) => {
    dispatch({ type: 'addTask', payload: task })
  }

  const updateTask = (task: Task) => {
    dispatch({ type: 'updateTask', payload: task })
  }

  const deleteTask = (id: string | null) => {
    dispatch({ type: 'deleteTask', payload: id })
  }

  return (
    <>
      <header>
        <Navbar onDeleteAll={() => deleteTask(null)} />
      </header>
      <main className='App'>
        <NewTask onNewTask={addNewTask} />
        <TaskCards
          tasks={state.tasks}
          onDelete={deleteTask}
          onChange={updateTask}
        />
      </main>
      <footer>
        <a href='https://www.flaticon.com/free-icons/to-do' title='to-do icons'>
          To-do icons created by Freepik - Flaticon
        </a>
      </footer>
    </>
  )
}

export default App
