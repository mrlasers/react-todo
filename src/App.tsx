import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import { Task, PartialTask } from './types'
import NewTask from './components/NewTask'
import TaskCards from './components/TaskCards'

type IDedTask = Task & { id: number }

function App() {
  const [nextId, setNextId] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])

  const addNewTask = (task: PartialTask) => {
    const t: Task = {
      description: '',
      dueDate: '',
      status: 'incomplete',
      assignedTo: '',
      id: nextId,
      ...task,
    }
    setTasks([...tasks, t])
    setNextId(nextId + 1)
  }

  const updateTask = (task: Task) => {
    console.log(task.title, 'butthole')
    setTasks(
      tasks.map((t) => {
        return t.id !== task.id ? t : task
      })
    )
  }

  return (
    <div className='App'>
      <NewTask onNewTask={addNewTask} />
      <TaskCards tasks={tasks} onChange={updateTask} />
    </div>
  )
}

export default App
