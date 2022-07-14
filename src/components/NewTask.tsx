import './NewTask.css'
import * as React from 'react'

import { useState, useEffect, useReducer, FC } from 'react'

import { PartialTask } from '../types'

type NewTaskProps = {
  onNewTask: (task: PartialTask) => void
}

const NewTask: FC<NewTaskProps> = (props) => {
  const [newTask, setNewTask] = useState<PartialTask>({ title: '' })

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    props.onNewTask(newTask)
    setNewTask({ title: '' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        name='title'
        placeholder='What do?'
        onChange={handleChange}
        value={newTask.title}
      />
      {!newTask.title.length ? null : (
        <>
          {' '}
          <textarea
            name='description'
            placeholder='Where/why/how do?'
            onChange={handleChange}
            value={newTask.description}></textarea>
          <input
            type='date'
            name='dueDate'
            onChange={handleChange}
            value={newTask.dueDate}
          />
          <input
            type='text'
            name='project'
            placeholder='Who do?'
            onChange={handleChange}
            value={newTask.assignedTo}
          />
          <input type='submit' value='Add task' />
        </>
      )}
    </form>
  )
}

export default NewTask
