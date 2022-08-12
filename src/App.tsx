// import reactLogo from './assets/react.svg'
import './App.scss'

import { differenceInDays, format } from 'date-fns'
import { guard } from 'fp-ts-std/Function'
import * as A from 'fp-ts/Array'
import { flow, pipe } from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
//-- TODO
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import { ButtonHTMLAttributes, useEffect, useReducer, useRef, useState } from 'react'
import { FiClock, FiPlay, FiSquare, FiTrash2, FiX } from 'react-icons/fi'
import Modal from 'react-modal'

import {
    getDateValue, getProjectTodos, isMatchProjectId, newProject, newTodo, removeTodo,
    replaceProject, replaceTodo, sortByTitle, startTodoTimer, todoCancelTimer, todoStopTimer
} from './helpers'
import { ID, Project, Todo } from './types'

Modal.setAppElement("#root")

// export type Project = {
//   id: string
//   title: string
//   description: string
//   dueDate: string | null
// }

//-- components

export type CustomOnChange<T> = {
  onChange?: (value: T) => void
}

export type WithDispatch = {
  dispatch: React.Dispatch<Msg>
}

// export type Todo = {
//   id: string
//   title: string
//   projectId: string
//   taskTime: {
//     start: Date
//     end: Date
//     duration: number
//   }[]
//   lastWorked?: Date
//   totalDuration: number
//   taskStartTime?: Date
// }

export type TodoCardProps = {
  onDelete?: (todo: Todo) => void
  onTimerStart?: (id: ID) => void
  onTimerStop?: (id: ID) => void
  onTimerCancel?: (id: ID) => void
}

export const TodoCard: React.FC<
  CustomOnChange<Todo> & TodoCardProps & { todo: Todo }
> = ({
  onChange,
  onDelete,
  onTimerStart,
  onTimerStop,
  onTimerCancel,
  todo,
}) => {
  return (
    <div className="todo-card">
      <TextInput
        type="text"
        value={todo.title}
        onChange={(title) => onChange && onChange({ ...todo, title })}
      />
      <div>
        <button onClick={() => onDelete?.(todo)}>
          <FiTrash2 />
        </button>
        {todo.taskStartTime && (
          <button onClick={() => onTimerCancel?.(todo.id)}>
            <FiX />
          </button>
        )}
        <button
          onClick={() =>
            todo.taskStartTime
              ? onTimerStop?.(todo.id)
              : onTimerStart?.(todo.id)
          }
        >
          {todo.taskStartTime ? <FiSquare /> : <FiPlay />}
        </button>
      </div>
    </div>
  )
}

export const DueDatePicker: React.FC<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> &
    CustomOnChange<string> & { value: string | null }
> = (props) => {
  const { children, onChange, value, ...attrs } = props

  // might want to combine maybeDaysLeft and buttonClassName into one pipe
  // but leaving here for now because i might also want the number of days left
  const maybeDaysLeft = pipe(
    O.fromNullable(value),
    O.map((date) => differenceInDays(new Date(date), new Date(getDateValue()))),
  )

  const buttonClassName = pipe(
    maybeDaysLeft,
    O.map(
      guard<number, string>([
        [(n) => n <= 1, () => "warn"],
        [(n) => n <= 7, () => "chill"],
      ])(() => ""),
    ),
    O.getOrElse(() => ""),
  )

  const buttonStyle: React.CSSProperties = { position: "relative" }

  const inputStyle: React.CSSProperties = {
    opacity: 0,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    zIndex: 9999999,
  }

  return (
    <button {...attrs} className={buttonClassName} style={buttonStyle}>
      <input
        required
        value={value ?? ""}
        type="date"
        onChange={(e) => onChange?.(e.target.value)}
        style={inputStyle}
      />
      <FiClock /> <span>{value && format(new Date(value), "MMM d")}</span>
    </button>
  )
}

export type TextInputProps = {
  onChange?: (text: string) => void
}

/**
 * Text <input/> that selects text `onFocus` and calls `onChange` on blur
 *
 * blurs on `Escape` or `Enter` keys
 */
export const TextInput: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & TextInputProps
> = (props) => {
  const [text, setText] = useState(
    typeof props.value === "string" ? props.value : "",
  )

  const { onChange, ...attrs } = props

  useEffect(() => {
    setText(typeof props.value === "string" ? props.value : text)
  }, [props.value])

  return (
    <input
      {...attrs}
      type="text"
      // ref={ref}
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) =>
        (e.key === "Escape" || e.key === "Enter") && e.currentTarget.blur()
      }
      onInput={(e) => setText(e.currentTarget.value)}
      onBlur={(e) => props.onChange && props.onChange(text)}
      value={text}
    />
  )
}

export type ProjectCardProps = {
  project: Project
  todos: Todo[]
  dispatch: React.Dispatch<Msg>
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  todos,
  dispatch,
}) => {
  const textareaEl = useRef<HTMLTextAreaElement>(null)
  const [isCtrlsActive, setIsCtrlsActive] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description)

  function handleChangeDescription(newDescription: string) {
    setDescription(newDescription)
  }

  function handleOnChange() {
    setIsCtrlsActive(false)
    if (!title) {
      return setTitle(project.title)
    }

    dispatch({
      type: "UPDATE_PROJECT",
      payload: {
        ...project,
        title: title ?? project.title,
        description: description ?? project.description,
      },
    })
  }

  useEffect(() => {
    setTitle(project.title)
    setDescription(project.description)
  }, [project])

  return (
    project && (
      <div className="project-card">
        <div className={"header" + (isCtrlsActive ? " active" : "")}>
          <TextInput
            type="text"
            className="project-title"
            value={title}
            onBlur={handleOnChange}
            onChange={(title) => {
              return dispatch({
                type: "UPDATE_PROJECT",
                payload: { ...project, title: title },
              })
            }}
          />
          <nav>
            <DueDatePicker
              value={
                project.dueDate ? format(project.dueDate, "YYYY-MM-dd") : null
              }
              onChange={flow(
                (dueDate) => ({ ...project, dueDate: new Date(dueDate) }),
                msgUpdateProject,
                dispatch,
              )}
            >
              <FiClock />
            </DueDatePicker>
            <button
              title="Delete?"
              onClick={flow(() => msgDeleteProject(project), dispatch)}
            >
              <FiTrash2 />
            </button>
          </nav>
        </div>
        <div className="description">
          <textarea
            ref={textareaEl}
            spellCheck={false}
            placeholder="Enter description, notes, etc., here..."
            value={description}
            onBlur={handleOnChange}
            onKeyDown={(e) =>
              e.key === "Escape" &&
              textareaEl.current &&
              textareaEl.current.blur()
            }
            onInput={(e) => handleChangeDescription(e.currentTarget.value)}
          ></textarea>
        </div>
        <div className="todos-list">
          <h3>Todos</h3>
          <nav>
            <button onClick={flow(() => msgAddTodo(project), dispatch)}>
              Add Task
            </button>
          </nav>
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onChange={flow(msgUpdateTodo, dispatch)}
              onTimerStart={flow(msgTodoTimerStart, dispatch)}
              onTimerStop={flow(msgTodoTimerStop, dispatch)}
              onTimerCancel={flow(msgTodoTimerCancel, dispatch)}
              onDelete={flow(() => msgDeleteTodo(todo), dispatch)}
            />
          ))}
        </div>
      </div>
    )
  )
}

//-- state reducer and stuff

export type Model = {
  projects: Project[]
  todos: Todo[]
  selectedProject: Project | null
  deleteOp?: RemoveMsg
}

export type TODO_TIMER_START = msg<"TODO_TIMER_START", ID>
export type TODO_TIMER_STOP = msg<"TODO_TIMER_STOP", ID>
export type TODO_TIMER_CANCEL = msg<"TODO_TIMER_CANCEL", ID>

export type TodoMsg = TODO_TIMER_START | TODO_TIMER_STOP | TODO_TIMER_CANCEL

export type RemoveMsgProject = { type: "REMOVE_PROJECT"; payload: Project }
export type RemoveMsgTodo = { type: "REMOVE_TODO"; payload: Todo }

export type RemoveMsg = RemoveMsgProject | RemoveMsgTodo

export type msg<T extends string, P extends any> = { type: T; payload: P }

export type ADD_NEW_PROJECT = msg<"ADD_NEW_PROJECT", undefined>
export type UPDATE_PROJECT = msg<"UPDATE_PROJECT", Project>
export type REMOVE_PROJECT = msg<"REMOVE_PROJECT", Project>

export type SELECT_PROJECT = msg<"SELECT_PROJECT", ID>
export type DELETE_SOMETHING = msg<"DELETE_SOMETHING", RemoveMsg | undefined>

export type ADD_TODO = msg<"ADD_TODO", Project>
export type UPDATE_TODO = msg<"UPDATE_TODO", Todo>
export type REMOVE_TODO = msg<"REMOVE_TODO", Todo>

export type Msg =
  | UPDATE_PROJECT
  | DELETE_SOMETHING
  | ADD_NEW_PROJECT
  | SELECT_PROJECT
  | ADD_TODO
  | UPDATE_TODO
  | TodoMsg
  | RemoveMsg

export function msgCreator<T extends Msg>(type: T["type"]) {
  return (payload: T["payload"]) => {
    return { type, payload }
  }
}

const msgAddNewProject = () =>
  msgCreator<ADD_NEW_PROJECT>("ADD_NEW_PROJECT")(undefined)
const msgUpdateProject = msgCreator<UPDATE_PROJECT>("UPDATE_PROJECT")

const msgTodoTimerStart = msgCreator<TODO_TIMER_START>("TODO_TIMER_START")
const msgTodoTimerStop = msgCreator<TODO_TIMER_STOP>("TODO_TIMER_STOP")
const msgTodoTimerCancel = msgCreator<TODO_TIMER_CANCEL>("TODO_TIMER_CANCEL")

const msgSelectProject = msgCreator<SELECT_PROJECT>("SELECT_PROJECT")

const msgAddTodo = msgCreator<ADD_TODO>("ADD_TODO")
const msgUpdateTodo = msgCreator<UPDATE_TODO>("UPDATE_TODO")

const msgDeleteSomething = <T extends DELETE_SOMETHING>(
  something?: T["payload"],
) => msgCreator<DELETE_SOMETHING>("DELETE_SOMETHING")(something)

const msgDeleteProject = (project: Project) =>
  msgCreator<DELETE_SOMETHING>("DELETE_SOMETHING")({
    type: "REMOVE_PROJECT",
    payload: project,
  })
const msgDeleteTodo = (todo: Todo) =>
  msgCreator<DELETE_SOMETHING>("DELETE_SOMETHING")({
    type: "REMOVE_TODO",
    payload: todo,
  })

export function updateTodo(model: Model, { type, payload }: Msg): Model {
  switch (type) {
    default:
      return model

    case "ADD_TODO": {
      return {
        ...model,
        todos: [...model.todos, newTodo(payload)],
      }
    }
    case "UPDATE_TODO": {
      return {
        ...model,
        todos: replaceTodo(model.todos, payload),
      }
    }
    case "REMOVE_TODO": {
      return {
        ...model,
        todos: removeTodo(model.todos, payload),
        deleteOp: undefined,
      }
    }
    case "TODO_TIMER_START": {
      return {
        ...model,
        todos: startTodoTimer(model.todos, payload),
      }
    }
    case "TODO_TIMER_STOP": {
      return {
        ...model,
        todos: model.todos.map(todoStopTimer),
      }
    }
    case "TODO_TIMER_CANCEL": {
      return {
        ...model,
        todos: model.todos.map(todoCancelTimer),
      }
    }
  }
}

export function update(model: Model, msg: Msg): Model {
  switch (msg.type) {
    default:
      return updateTodo(model, msg)
    case "DELETE_SOMETHING": {
      return {
        ...model,
        deleteOp: msg.payload,
      }
    }
    case "UPDATE_PROJECT": {
      // we're doing the same thing in the map as we're doing to get selectedProject
      // should probably dry this shit out
      return {
        ...model,
        projects: model.projects.map((thisProject) =>
          thisProject.id === msg.payload.id ? msg.payload : thisProject,
        ),
        selectedProject:
          model.selectedProject?.id === msg.payload.id
            ? msg.payload
            : model.selectedProject,
      }
    }
    case "REMOVE_PROJECT": {
      return pipe(replaceProject(model.projects, msg.payload), (projects) => ({
        ...model,
        projects,
        todos: model.todos.filter(isMatchProjectId(projects[0]?.id)),
        selectedProject: projects[0] ?? null,
        deleteOp: undefined,
      }))
    }
    case "ADD_NEW_PROJECT": {
      return pipe(newProject(), (project) => ({
        ...model,
        projects: [...model.projects, project].sort(sortByTitle),
        selectedProject: project,
      }))
    }
    case "SELECT_PROJECT": {
      return pipe(
        O.fromNullable(
          model.projects.find((project) => project.id === msg.payload),
        ),
        O.map((selectedProject) => ({ ...model, selectedProject })),
        O.getOrElse(() => model),
      )
    }
  }
}

const DeleteModal: React.FC<{
  dispatch: React.Dispatch<Msg>
  deleteMsg: RemoveMsg
}> = ({ dispatch, deleteMsg: deleteAction }) => {
  return (
    <Modal
      isOpen={!!deleteAction}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      onRequestClose={flow(() => msgDeleteSomething(), dispatch)}
      className="Modal"
      overlayClassName="Overlay"
    >
      <h2>
        Delete {deleteAction?.type === "REMOVE_PROJECT" ? "Project" : "Todo???"}{" "}
        <em>{deleteAction?.payload.title}</em>
      </h2>
      <div className="buttons">
        <button
          className="soft-button"
          onClick={flow(() => msgDeleteSomething(), dispatch)}
        >
          Cancel
        </button>
        <button className="soft-button" onClick={() => dispatch(deleteAction)}>
          Confirm
        </button>
      </div>
    </Modal>
  )
}

const initialModel: Model = { projects: [], todos: [], selectedProject: null }

const App = () => {
  const [model, dispatch] = useReducer<(model: Model, msg: Msg) => Model>(
    update,
    initialModel,
  )

  const { projects, selectedProject } = model

  return (
    <>
      {model.deleteOp && (
        <DeleteModal dispatch={dispatch} deleteMsg={model.deleteOp} />
      )}
      <header>
        <nav>
          <h1>Project Tracker</h1>
          <div className="project-controls">
            {!!projects.length && (
              <select
                value={selectedProject?.id}
                onChange={flow(
                  ({ target }) => target.value,
                  msgSelectProject,
                  dispatch,
                )}
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            )}
            <button onClick={flow(msgAddNewProject, dispatch)}>
              New Project
            </button>
          </div>
        </nav>
      </header>
      <main>
        {selectedProject && (
          <ProjectCard
            project={selectedProject}
            todos={getProjectTodos(model.todos, selectedProject.id)}
            dispatch={dispatch}
          />
        )}

        <code>
          <pre>{JSON.stringify(model.todos, null, 2)}</pre>
        </code>
      </main>
    </>
  )
}

export default App
