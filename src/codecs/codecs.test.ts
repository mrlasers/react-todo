import { isDate, parse, parseISO } from 'date-fns'
import * as Dt from 'fp-ts/Date'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'

import {
    ISODate, maybeCodec, MaybeDateString, MaybeString, PersistantModel, Project, Todo
} from './'

function testCodec<I, O, A>(codec: C.Codec<I, O, A>) {
  return (input: any, output: O) => {
    const { decode, encode } = codec
    expect(
      pipe(
        decode(input),
        E.foldW(() => input, encode),
      ),
    ).toEqual(output)
  }
}

it("compares dates properly", () => {
  const date = new Date()
  const date2 = new Date(date.toISOString())
  expect(date).toEqual(date2)
})

describe("maybeCodec", () => {
  describe("Date", () => {
    const test = testCodec(MaybeDateString)

    it("encodes/decodes current datetime", () => {
      const u = new Date().toISOString()
      test(u, u)
    })

    it("encodes/decodes 1981-10-12", () => {
      const u = new Date("1981-10-12").toISOString()
      test(u, u)
    })

    it("encodes/decodes a number instead of a date", () => {
      const u = 1234
      test(u, null)
    })
  })

  describe("string", () => {
    const test = testCodec(MaybeString)

    it("encodes/decodes 'Hello, World!'", () => {
      const u = "Hello, World!"
      test(u, u)
    })

    it("encodes/decodes 123 to null", () => {
      const u = 123
      test(u, null)
    })
  })
})

describe("PersistantModel", () => {
  const test = testCodec(PersistantModel)

  it("does an empty State", () => {
    const input = {
      projects: [],
      todos: [],
    }

    const encoded = {
      projects: [],
      todos: [],
    }

    const decoded = {
      projects: [],
      todos: [],
    }

    expect(PersistantModel.decode(input)).toEqualRight(decoded)
    expect(PersistantModel.encode(decoded)).toMatchObject(encoded)
  })

  it("does an empty Model with deleteOp", () => {
    const input = {
      projects: [],
      todos: [],
      deleteOp: { doesIt: "matter?" },
    }

    const encoded = {
      projects: [],
      todos: [],
    }

    test(input, encoded)
  })
})

describe("Project", () => {
  const test = testCodec(Project)

  it("decodes/encodes a complete project", () => {
    const u = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "Goodnight, moon.",
      dueDate: "1981-10-12T00:00:00.000Z",
    }

    test(u, u)
  })

  it("decodes/encodes a project with no dueDate", () => {
    const u = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "Goodnight, moon.",
    }

    const a = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "Goodnight, moon.",
      dueDate: null,
    }

    test(u, a)
  })
})

describe("Todo", () => {
  const { decode, encode } = Todo
  const test = testCodec(Todo)

  it("decodes a complete Todo", () => {
    const u = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: "1981-10-12T00:00:00.000Z",
          end: "1981-10-12T00:01:00.000Z",
          duration: 60000,
        },
      ],
      lastWorked: "1981-10-12T00:00:00.000Z",
      totalDuration: 60000,
      taskStartTime: "2021-10-12T00:00:00.000Z",
    }

    test(u, u)
  })

  it("decodes a Todo without taskStartTime", () => {
    const u = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: "1981-10-12T00:00:00.000Z",
          end: "1981-10-12T00:01:00.000Z",
          duration: 60000,
        },
      ],
      lastWorked: "1981-10-12T00:00:00.000Z",
      totalDuration: 60000,
    }

    const encoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: "1981-10-12T00:00:00.000Z",
          end: "1981-10-12T00:01:00.000Z",
          duration: 60000,
        },
      ],
      lastWorked: "1981-10-12T00:00:00.000Z",
      totalDuration: 60000,
      taskStartTime: null,
    }

    test(u, encoded)
  })

  it("decodes a Todo without lastWorked", () => {
    const u = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: "1981-10-12T00:00:00.000Z",
          end: "1981-10-12T00:01:00.000Z",
          duration: 60000,
        },
      ],
      totalDuration: 60000,
      taskStartTime: "2021-10-12T00:00:00.000Z",
    }

    const encoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: "1981-10-12T00:00:00.000Z",
          end: "1981-10-12T00:01:00.000Z",
          duration: 60000,
        },
      ],
      totalDuration: 60000,
      taskStartTime: "2021-10-12T00:00:00.000Z",
      lastWorked: null,
    }

    test(u, encoded)
  })
})
