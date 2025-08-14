import api from "@/lib/api"
import { setAuthTokens, clearAuthTokens } from "@/lib/auth"

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  access: string
  refresh: string
}

interface UserProfile {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  is_company: boolean
}

export const AuthService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<LoginResponse>("/auth/token/", data)
    setAuthTokens(response.data.access, response.data.refresh)
    return response.data
  },

  logout: async () => {
    try {
      await api.post("/auth/logout/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clearAuthTokens()
    }
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<{ access: string }>("/auth/refresh/", { refresh: refreshToken })
    return response.data
  },

  getProfile: async () => {
    // API: GET /api/v1/profile/ возвращает массив профилей текущего пользователя
    const { data } = await api.get<UserProfile[] | UserProfile>("/profile/")
    const profile = Array.isArray(data) ? data[0] : data
    return profile as UserProfile
  },

  updateProfile: async (data: Partial<UserProfile> & { id?: string }) => {
    if (!data.id) {
      const current = await AuthService.getProfile()
      data.id = (current as any).id
    }
    const response = await api.put<UserProfile>(`/profile/${data.id}/`, data)
    return response.data
  }
}
