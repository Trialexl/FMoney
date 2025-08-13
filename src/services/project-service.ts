import api from "@/lib/api"

export interface Project {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  deleted: boolean
  is_active: boolean
}

export const ProjectService = {
  getProjects: async (isActive?: boolean) => {
    const params = isActive !== undefined ? { is_active: isActive } : {}
    const response = await api.get<Project[]>("/projects/", { params })
    return response.data
  },

  getProject: async (id: string) => {
    const response = await api.get<Project>(`/projects/${id}/`)
    return response.data
  },

  createProject: async (data: Partial<Project>) => {
    const response = await api.post<Project>("/projects/", data)
    return response.data
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    const response = await api.put<Project>(`/projects/${id}/`, data)
    return response.data
  },

  deleteProject: async (id: string) => {
    await api.delete(`/projects/${id}/`)
  }
}
