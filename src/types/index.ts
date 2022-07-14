export type PartialTask = {
  title: string
  description?: string
  dueDate?: string
  assignedTo?: string
  status?: 'complete' | 'incomplete'
  id?: number
}

export type Task = Required<PartialTask>
