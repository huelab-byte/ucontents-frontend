export interface User {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Suspended"
  isSystem: boolean
  createdAt: string
  lastLogin?: string
}
