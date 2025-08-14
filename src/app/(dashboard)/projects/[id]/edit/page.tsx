"use client"

import { useState, useEffect } from "react"
import { ProjectService, Project } from "@/services/project-service"
import ProjectForm from "@/components/shared/project-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function EditProjectPage() {
  const params = useParams()
  const idParam = Array.isArray((params as any)?.id) ? (params as any).id[0] : (params as any)?.id
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!idParam) return
        const data = await ProjectService.getProject(idParam as string)
        setProject(data)
      } catch (err: any) {
        setError("Ошибка при загрузке проекта: " + (err.message || "Неизвестная ошибка"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [idParam])

  if (isLoading) {
    return <div className="text-center py-12">Загрузка...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку проектов
          </Button>
        </Link>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">Проект не найден</div>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Вернуться к списку проектов
          </Button>
        </Link>
      </div>
    )
  }

  return <ProjectForm project={project} isEdit />
}
