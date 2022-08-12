import { differenceInMilliseconds, isDate } from 'date-fns'
import { flow, pipe } from 'fp-ts/lib/function'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'

import { RemoveMsg } from '../App'

export const ID = C.make(
  pipe(
    D.string,
    D.parse((s) =>
      s.match(/[A-Za-z0-9_-]{21,}/)
        ? D.success(s)
        : D.failure(s, `Expected nanoid string, but received "${s}"`),
    ),
  ),
  {
    encode: (s) => s,
  },
)

export const DateCodec = C.make(
  pipe(
    D.string,
    D.parse((s) =>
      pipe(new Date(s), (date) =>
        isDate(date)
          ? D.success(date)
          : D.failure(s, `Expected ISO date string`),
      ),
    ),
  ),
  {
    encode: (date: Date) => date.toISOString(),
  },
)

export const TaskTime = C.make(
  pipe(
    D.struct({
      start: DateCodec,
      end: DateCodec,
    }),
    D.parse(({ start, end }) =>
      D.success({
        start,
        end,
        duration: differenceInMilliseconds(end, start),
      }),
    ),
  ),
  {
    encode: ({ start, end, duration }) => ({
      start: start.toISOString(),
      end: end.toISOString(),
      duration,
    }),
  },
)

export const Todo = pipe(
  C.struct({
    id: ID,
    projectId: ID,
    title: C.string,
    taskTime: C.array(TaskTime),
    totalDuration: C.number,
  }),
  C.intersect(
    C.partial({
      lastWorked: DateCodec,
      taskStartTime: DateCodec,
    }),
  ),
)

export const Project = pipe(
  C.struct({
    id: ID,
    title: C.string,
    description: C.string,
  }),
  C.intersect(
    C.partial({
      dueDate: C.nullable(DateCodec),
    }),
  ),
)

export const PersistantModel = pipe(
  C.struct({
    projects: C.array(Project),
    todos: C.array(Todo),
  }),
  C.intersect(
    C.partial({
      selectedProject: C.nullable(Project),
    }),
  ),
)

export type ID = C.TypeOf<typeof ID>
export type Todo = C.TypeOf<typeof Todo>
export type Project = C.TypeOf<typeof Project>
export type State = C.TypeOf<typeof PersistantModel>

export type Model = State & {
  deleteOp?: RemoveMsg
}
