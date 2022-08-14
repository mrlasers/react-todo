import { isDate, parse, parseISO } from 'date-fns'
import * as Dt from 'fp-ts/Date'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as D from 'io-ts/Decoder'

import {
  ISODate,
  maybeCodec,
  MaybeDateString,
  MaybeString,
  PersistantModel,
  Project,
  Todo,
} from './'

it("compares dates properly", () => {
  const date = new Date()
  const date2 = new Date(date.toISOString())
  expect(date).toEqual(date2)
})

describe("maybeCodec", () => {
  describe("Date", () => {
    const { decode, encode } = MaybeDateString

    it("encodes/decodes current datetime", () => {
      const u = new Date().toISOString()
      expect(
        pipe(
          decode(u),
          E.foldW(() => u, encode),
        ),
      ).toEqual(u)
    })

    it("encodes/decodes 1981-10-12", () => {
      const u = new Date("1981-10-12").toISOString()
      expect(
        pipe(
          decode(u),
          E.foldW(() => u, encode),
        ),
      ).toEqual(u)
    })

    it("encodes/decodes a number instead of a date", () => {
      const u = 1234
      expect(
        pipe(
          decode(u),
          E.foldW(() => u, encode),
        ),
      ).toEqual(null)
    })
  })

  describe("string", () => {
    const { decode, encode } = MaybeString

    it("encodes/decodes 'Hello, World!'", () => {
      const u = "Hello, World!"
      expect(
        pipe(
          decode(u),
          E.fold(() => u, encode),
        ),
      ).toBe(u)
    })

    it("encodes/decodes 123 to null", () => {
      const u = 123
      expect(
        pipe(
          decode(u),
          E.foldW(() => u, encode),
        ),
      ).toBe(null)
    })
  })
})

describe("MandatoryModel", () => {
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

    const decoded = {
      projects: [],
      todos: [],
    }

    expect(PersistantModel.decode(input)).toEqualRight(decoded)
    expect(PersistantModel.encode(decoded)).toMatchObject(encoded)
  })
})

describe("Project", () => {
  it("decodes/encodes a complete project", () => {
    const encoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "Goodnight, moon.",
      dueDate: "1981-10-12T00:00:00.000Z",
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "Goodnight, moon.",
      dueDate: new Date("1981-10-12"),
    }

    expect(Project.decode(encoded)).toEqualRight(decoded)
    expect(Project.encode(decoded)).toMatchObject(encoded)
  })

  it("decodes/encodes a project with no dueDate", () => {
    const encoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "Goodnight, moon.",
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "Goodnight, moon.",
    }

    expect(Project.decode(encoded)).toEqualRight(decoded)
    expect(Project.encode(decoded)).toMatchObject(encoded)
  })
})

describe("Todo", () => {
  // it("decodes a minimal Todo", () => {
  //   const minimalTodoJson = {
  //     id: "TODO_XR8_Z5jdHi6B-myT",
  //     projectId: "PROJECT_abcdefghijklm",
  //     title: "",
  //   }

  //   const expected: Todo = {
  //     id: "TODO_XR8_Z5jdHi6B-myT",
  //     projectId: "PROJECT_abcdefghijklm",
  //     title: "",
  //     taskTime: [],
  //     totalDuration: 0,
  //   }

  //   expect(Todo.decode(minimalTodoJson)).toEqualRight(expected)
  // })

  it("decodes a complete Todo", () => {
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
      taskStartTime: "2021-10-12T00:00:00.000Z",
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: new Date("1981-10-12T00:00:00.000Z"),
          end: new Date("1981-10-12T00:01:00.000Z"),
          duration: 60000,
        },
      ],
      lastWorked: new Date("1981-10-12T00:00:00.000Z"),
      totalDuration: 60000,
      taskStartTime: new Date("2021-10-12T00:00:00.000Z"),
    }

    expect(Todo.decode(encoded)).toEqualRight(decoded)
    expect(Todo.encode(decoded)).toMatchObject(encoded)
  })

  it("decodes a Todo without taskStartTime", () => {
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
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: new Date("1981-10-12T00:00:00.000Z"),
          end: new Date("1981-10-12T00:01:00.000Z"),
          duration: 60000,
        },
      ],
      lastWorked: new Date("1981-10-12T00:00:00.000Z"),
      totalDuration: 60000,
    }

    expect(Todo.decode(encoded)).toEqualRight(decoded)
    expect(Todo.encode(decoded)).toMatchObject(encoded)
  })

  it("decodes a Todo without lastWorked", () => {
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
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      taskTime: [
        {
          start: new Date("1981-10-12T00:00:00.000Z"),
          end: new Date("1981-10-12T00:01:00.000Z"),
          duration: 60000,
        },
      ],
      totalDuration: 60000,
      taskStartTime: new Date("2021-10-12T00:00:00.000Z"),
    }

    expect(Todo.decode(encoded)).toEqualRight(decoded)
    expect(Todo.encode(decoded)).toMatchObject(encoded)
  })
})
