import { differenceInMilliseconds, isDate } from 'date-fns'
import * as E from 'fp-ts/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'

import { RemoveMsg } from '../App'

export const maybeDate: D.Decoder<unknown, O.Option<Date>> = {
  decode: (u) => {
    return isDate(u) ? D.success(O.of(u as Date)) : D.success(O.none)
  },
}

type maybeString = O.Option<string>

export const maybeSomefin = <T>(decoder: D.Decoder<D.DecodeError, T>): D.Decoder<unknown, O.Option<T> =>
  pipe(
    decoder,
    E.match<never, T, O.Some<T> | O.None>(
      (_): E.Either<never, O.None> => E.right(O.none),
      (a): E.Either<never, O.Some<T | never>> => E.right(O.some(a)),
    ),
  )

export const mbDecoder: D.Decoder<unknown, string> = {
  decode: (u) =>
    typeof u === "string" ? E.of(u) : D.failure(u, "oops, should be string"),
}

export const maybeDecoder = <A>(decoder: D.Decoder<unknown, A>) =>
  D.compose(decoder)

// export const maybeString: D.Decoder<unknown, O.Option<string>> = pipe(
//   D.string,
//   D.parse: (u) => typeof u === 'string' ? D.success(O.of(u)) : D.success(O.none)
// )

export type MaybeDate = D.TypeOf<typeof maybeDate>

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
export type PersistantModel = C.TypeOf<typeof PersistantModel>

export type Model = PersistantModel & {
  deleteOp?: RemoveMsg
}
