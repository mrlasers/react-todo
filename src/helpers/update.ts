import { differenceInMilliseconds } from 'date-fns'
import * as E from 'fp-ts/Either'
import { flow, identity } from 'fp-ts/lib/function'
import { nanoid } from 'nanoid'

import { ID, Model, Project, Todo } from '../App'
import { getRandomName } from './'

export function replaceTodo(todos: Todo[], todo: Todo): Todo[] {
  return todos.map((td) => (td.id === todo.id ? todo : td))
}

export function removeTodo(todos: Todo[], todo: Todo): Todo[] {
  return todos.filter((td) => td.id !== todo.id)
}

export function replaceProject(
  projects: Project[],
  project: Project,
): Project[] {
  return projects.filter((proj) => proj.id !== project.id)
}

export function startTodoTimer(todos: Todo[], id: ID): Todo[] {
  return todos.map(
    flow(
      E.fromPredicate((todo) => todo.id !== id, identity),
      E.map(todoStopTimer),
      E.fold(
        (todo) =>
          todo.taskStartTime
            ? todo
            : {
                ...todo,
                taskStartTime: new Date(),
              },
        identity,
      ),
    ),
  )
}

export function newProject(): Project {
  return {
    id: nanoid(),
    title: getRandomName(),
    description: "",
    dueDate: null,
  }
}

export function newTodo(project: Project): Todo {
  return {
    id: nanoid(),
    title: getRandomName(),
    projectId: project.id,
    taskTime: [],
    totalDuration: 0,
  }
}

export function todoCancelTimer(todo: Todo): Todo {
  return {
    ...todo,
    taskStartTime: undefined,
  }
}

export function todoStopTimer(todo: Todo): Todo {
  if (!todo.taskStartTime) {
    return todo
  }

  const endTime = new Date()
  const duration = differenceInMilliseconds(endTime, todo.taskStartTime)

  return {
    ...todo,
    taskStartTime: undefined,
    taskTime: [
      ...todo.taskTime,
      {
        start: todo.taskStartTime,
        end: endTime,
        duration: duration,
      },
    ],
    totalDuration: todo.totalDuration + duration,
    lastWorked: endTime,
  }
}
