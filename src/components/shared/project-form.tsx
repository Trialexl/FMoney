"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ProjectService, Project } from "@/services/project-service"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface ProjectFormProps {
  project?: Project
  isEdit?: boolean
}

export default function ProjectForm({ project, isEdit = false }: ProjectFormProps) {
  const router = useRouter()
  
  // Form fields
  const [name, setName] = useState(project?.name || "")
  const [code, setCode] = useState(project?.code || "")
  
  // UI state
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate required fields
      if (!name) {
        setError("Пожалуйста, укажите название проекта")
        setIsLoading(false)
        return
      }

      const projectData: Partial<Project> = {
        name,
        code: code || undefined,
      }

      if (isEdit && project) {
        await ProjectService.updateProject(project.id, projectData)
      } else {
        await ProjectService.createProject(projectData)
      }
      router.push("/projects")
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        "Ошибка при сохранении проекта. Пожалуйста, проверьте данные и попробуйте снова."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Редактирование проекта" : "Создание проекта"}
      </h1>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="required">Название проекта</Label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Введите название проекта"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Код (необязательно)</Label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            placeholder="Код проекта"
          />
        </div>

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать")}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/projects")}
          >
            Отмена
          </Button>
        </div>
      </form>
      
      <style jsx>{`
        .required:after {
          content: " *";
          color: red;
        }
      `}</style>
    </div>
  )
}
