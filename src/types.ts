export type Status = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type TaskType = 'feature' | 'user_story' | 'bug'

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  type: TaskType
  labels: string[]
  storyPoints: number | null
  createdAt: string
  updatedAt: string
  dueDate: string | null
}

export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

export type View = 'kanban' | 'list'

export interface FilterState {
  search: string
  priority: Priority | 'all'
  type: TaskType | 'all'
}
