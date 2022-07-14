import * as React from 'react'

import { Task } from '../types'

import './TaskCards.css'

const TaskCard: React.FC<{ task: Task; onChange?: (task: Task) => void }> = ({
  task,
  onChange,
}) => {
  return (
    <li
      onClick={() =>
        onChange &&
        onChange({
          ...task,
          status: task.status === 'complete' ? 'incomplete' : 'complete',
        })
      }
      className={task.status}>
      <div className='title'>{task.title}</div>
      <div className='description'>{task.description ?? ''}</div>
    </li>
  )
}

const TaskCards: React.FC<{
  tasks: Task[]
  onChange?: (task: Task) => void
}> = ({ tasks, onChange }) => {
  return (
    <ul className='task-list'>
      {tasks.map((task) => {
        return (
          <TaskCard key={`task-${task.id}`} task={task} onChange={onChange} />
        )
      })}
    </ul>
  )
}

export default TaskCards
