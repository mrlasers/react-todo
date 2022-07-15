import './NewTask.css'
import * as React from 'react'

import { useState, useRef, useEffect, useReducer, FC } from 'react'
import { nanoid } from 'nanoid'
import { PartialTask, Task } from '../types'

type NewTaskProps = {
  onNewTask: (task: PartialTask) => void
}

const makeNewTask = (): Task => ({
  title: '',
  description: '',
  assignedTo: '',
  dueDate: '',
  id: nanoid(),
  status: 'incomplete',
})

const NewTask: FC<NewTaskProps> = (props) => {
  const [newTask, setNewTask] = useState<Task>(makeNewTask())
  const newTaskTitleElement = useRef<HTMLInputElement | null>(null)

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
    setNewTask(makeNewTask())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      default:
        return
      case 'escape':
        e.preventDefault()
        setNewTask(makeNewTask())
        newTaskTitleElement.current && newTaskTitleElement.current.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        name='title'
        placeholder='What do?'
        onKeyDown={handleKeyPress}
        onChange={handleChange}
        value={newTask.title}
        ref={newTaskTitleElement}
      />
      <div className={`more ${newTask.title.length ? 'show' : ''}`}>
        <textarea
          name='description'
          placeholder='Where/why/how do?'
          onKeyDown={handleKeyPress}
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
      </div>
    </form>
  )
}

export default NewTask
