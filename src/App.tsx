import { useState, useEffect, useReducer } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import { Task, PartialTask } from './types'
import NewTask from './components/NewTask'
import TaskCards from './components/TaskCards'

type State = {
  nextId: number
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
      payload: number
    }

const initialState = JSON.parse(
  localStorage.getItem('todo-state') ?? `{nextId: 0, tasks: []}`
)

const stateReducer = (state: State, action: Action): State => {
  switch (action.type) {
    default:
      return state
    case 'addTask':
      return {
        ...state,
        nextId: state.nextId + 1,
        tasks: [
          ...state.tasks,
          {
            description: '',
            dueDate: '',
            status: 'incomplete',
            assignedTo: '',
            id: state.nextId + 1,
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
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }
  }
}

function App() {
  const [state, dispatch] = useReducer(stateReducer, initialState)

  useEffect(() => {
    localStorage.setItem('todo-state', JSON.stringify(state))
  }, [state])

  const addNewTask = (task: PartialTask) => {
    dispatch({ type: 'addTask', payload: task })
  }

  const updateTask = (task: Task) => {
    dispatch({ type: 'updateTask', payload: task })
  }

  const deleteTask = (id: number) => {
    dispatch({ type: 'deleteTask', payload: id })
  }

  return (
    <div className='App'>
      <NewTask onNewTask={addNewTask} />
      <TaskCards
        tasks={state.tasks}
        onDelete={deleteTask}
        onChange={updateTask}
      />
    </div>
  )
}

export default App
