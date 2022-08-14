import { differenceInMilliseconds, isDate, parse, parseISO } from 'date-fns'
import * as E from 'fp-ts/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import * as En from 'io-ts/Encoder'

import { RemoveMsg } from '../App'

/**
 *
 * @param decoder Decoder<Input, A>
 * @param encoder Encoder<Output, A>
 * @returns Codec<Input, Output | null, A>
 */
export const maybeCodec = <I, O, A>(
  codec: C.Codec<I, O, A>,
  // decoder: D.Decoder<I, A>,
  // encoder: En.Encoder<O, A>,
) =>
  C.make(
    {
      decode: (u: I) =>
        pipe(
          codec.decode(u),
          E.fold(
            () => D.success(O.none),
            (a) => D.success(O.some(a)),
          ),
        ),
    },
    {
      encode: (a) =>
        pipe(
          a,
          O.fold(
            () => null,
            (a) => codec.encode(a),
          ),
        ),
    },
  )

export const ISODate = C.make(
  pipe(
    D.string,
    D.parse((s) =>
      pipe(parseISO(s), (date) =>
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
export const MaybeDateString = maybeCodec(ISODate)
export type MaybeDateString = C.TypeOf<typeof MaybeDateString>

export const StringCodec = C.make(D.string, { encode: (s) => s })
export const MaybeString = maybeCodec(StringCodec)
export type MaybeString = C.TypeOf<typeof MaybeString>

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

export const TaskTime = C.make(
  pipe(
    D.struct({
      start: ISODate,
      end: ISODate,
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
      lastWorked: ISODate,
      taskStartTime: ISODate,
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
      dueDate: C.nullable(ISODate),
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
