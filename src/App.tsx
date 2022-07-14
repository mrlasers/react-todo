import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import NewTask, { Task } from './components/NewTask'

function App() {
  const [nextId, setNextId] = useState(0)
  const [tasks, setTasks] = useState<(Task & { id: number })[]>([])

  const addNewTask = (task: Task) => {
    setTasks([...tasks, { ...task, id: nextId }])
    setNextId(nextId + 1)
  }

  return (
    <div className='App'>
      <NewTask onNewTask={addNewTask} />
      <ul>
        {tasks.map((task) => (
          <li>{task.title}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
