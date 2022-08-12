import { Project, Todo } from './'

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
  it("decodes a complete Todo", () => {
    const encoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "He was a dark and stormy knight...",
      taskTime: {
        start: "1981-10-12T00:00:00.000Z",
        end: "1981-10-12T00:01:00.000Z",
        duration: 60000,
      },
      lastWorked: "1981-10-12T00:00:00.000Z",
      totalDuration: 60000,
      taskStartTime: "2021-10-12T00:00:00.000Z",
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "He was a dark and stormy knight...",
      taskTime: {
        start: new Date("1981-10-12T00:00:00.000Z"),
        end: new Date("1981-10-12T00:01:00.000Z"),
        duration: 60000,
      },
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
      description: "He was a dark and stormy knight...",
      taskTime: {
        start: "1981-10-12T00:00:00.000Z",
        end: "1981-10-12T00:01:00.000Z",
        duration: 60000,
      },
      lastWorked: "1981-10-12T00:00:00.000Z",
      totalDuration: 60000,
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "He was a dark and stormy knight...",
      taskTime: {
        start: new Date("1981-10-12T00:00:00.000Z"),
        end: new Date("1981-10-12T00:01:00.000Z"),
        duration: 60000,
      },
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
      description: "He was a dark and stormy knight...",
      taskTime: {
        start: "1981-10-12T00:00:00.000Z",
        end: "1981-10-12T00:01:00.000Z",
        duration: 60000,
      },
      totalDuration: 60000,
      taskStartTime: "2021-10-12T00:00:00.000Z",
    }
    const decoded = {
      id: "V1StGXR8_Z5jdHi6B-myT",
      projectId: "V1StGXR8_Z5jdHi6B-myT",
      title: "Hello, World!",
      description: "He was a dark and stormy knight...",
      taskTime: {
        start: new Date("1981-10-12T00:00:00.000Z"),
        end: new Date("1981-10-12T00:01:00.000Z"),
        duration: 60000,
      },
      totalDuration: 60000,
      taskStartTime: new Date("2021-10-12T00:00:00.000Z"),
    }

    expect(Todo.decode(encoded)).toEqualRight(decoded)
    expect(Todo.encode(decoded)).toMatchObject(encoded)
  })
})
