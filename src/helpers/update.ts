import { differenceInMilliseconds } from 'date-fns'
import * as E from 'fp-ts/Either'
import { flow, identity, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { nanoid } from 'nanoid'

import { ID, Model, Project, Todo } from '../codecs'
import { getRandomName } from './'

export function add(a: number) {
  return (b: number) => a + b
}

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
                taskStartTime: O.some(new Date()),
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
    dueDate: O.none,
  }
}

export function newTodo(project: Project): Todo {
  return {
    id: nanoid(),
    title: getRandomName(),
    projectId: project.id,
    taskTime: [],
    totalDuration: 0,
    lastWorked: O.none,
    taskStartTime: O.none,
  }
}

export function todoCancelTimer(todo: Todo): Todo {
  return {
    ...todo,
    taskStartTime: O.none,
  }
}

export function todoStopTimer(todo: Todo): Todo {
  return pipe(
    todo.taskStartTime,
    O.map((startTime) => {
      const endTime = new Date()
      const duration = differenceInMilliseconds(endTime, startTime)

      return {
        ...todo,
        taskStartTime: O.none,
        taskTime: [
          ...todo.taskTime,
          {
            start: startTime,
            end: endTime,
            duration: duration,
          },
        ],
        totalDuration: todo.totalDuration + duration,
        lastWorked: O.some(endTime),
      }
    }),
    O.getOrElse(() => todo),
  )

  // if (!todo.taskStartTime) {
  //   return todo
  // }

  // const endTime = new Date()
  // const duration = pipe(
  //   todo.taskStartTime,
  //   O.map((startTime) => differenceInMilliseconds(endTime, startTime)),
  // )

  // return {
  //   ...todo,
  //   taskStartTime: undefined,
  //   taskTime: [
  //     ...todo.taskTime,
  //     {
  //       start: todo.taskStartTime,
  //       end: endTime,
  //       duration: duration,
  //     },
  //   ],
  //   totalDuration: todo.totalDuration + duration,
  //   lastWorked: endTime,
  // }
}
