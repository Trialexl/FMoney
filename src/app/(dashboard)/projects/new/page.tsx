"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ProjectForm from "@/components/shared/project-form"
import { ProjectService, Project } from "@/services/project-service"

function Inner() {
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get("duplicate")
  const [duplicateEntity, setDuplicateEntity] = useState<Project | null>(null)

  useEffect(() => {
    const loadDuplicate = async () => {
      if (!duplicateId) return
      try {
        const entity = await ProjectService.getProject(duplicateId)
        setDuplicateEntity(entity)
      } catch (e) {
        console.error("Failed to load project for duplication", e)
      }
    }
    loadDuplicate()
  }, [duplicateId])
  return <ProjectForm project={duplicateEntity || undefined} />
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
