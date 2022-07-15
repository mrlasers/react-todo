export type PartialTask = {
  title: string
  description?: string
  dueDate?: string
  assignedTo?: string
  status?: 'complete' | 'incomplete'
  id?: string
  createdAt?: string
}

export type Task = Required<PartialTask>
