import * as React from 'react'

import { Task } from '../types'

import './TaskCards.css'

const TaskCard: React.FC<{
  task: Task
  onDelete?: (id: string) => void
  onChange?: (task: Task) => void
}> = ({ task, onChange, onDelete }) => {
  const handleDelete = (e: React.ChangeEvent<any>) => {
    e.preventDefault()
    e.stopPropagation()

    onDelete && onDelete(task.id)
  }

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
      <div className='data'>
        <div className='title'>{task.title}</div>
        <div className='description'>{task.description ?? ''}</div>
        <div className='due-date'>{task.dueDate}</div>
      </div>
      <div className='tools'>
        <span onClick={handleDelete}>🗑</span>
      </div>
    </li>
  )
}

const TaskCards: React.FC<{
  tasks: Task[]
  onChange?: (task: Task) => void
  onDelete?: (id: string) => void
}> = ({ tasks, onChange, onDelete }) => {
  return (
    <ul className='task-list'>
      {tasks.map((task) => {
        return (
          <TaskCard
            key={`task-${task.id}`}
            task={task}
            onDelete={onDelete}
            onChange={onChange}
          />
        )
      })}
    </ul>
  )
}

export default TaskCards
