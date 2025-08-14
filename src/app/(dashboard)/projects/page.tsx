"use client"

import { useState, useEffect } from "react"
import { ProjectService, Project } from "@/services/project-service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PlusIcon, Edit2Icon, TrashIcon, SearchIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/formatters"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('name')
  
  const fetchProjects = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await ProjectService.getProjects(activeFilter !== null ? activeFilter : undefined)
      setProjects(data)
    } catch (err: any) {
      setError("Ошибка при загрузке проектов: " + (err.message || "Неизвестная ошибка"))
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchProjects()
  }, [activeFilter])
  
  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот проект?")) {
      try {
        await ProjectService.deleteProject(id)
        setProjects(projects.filter(project => project.id !== id))
      } catch (err: any) {
        setError("Ошибка при удалении проекта: " + (err.message || "Неизвестная ошибка"))
      }
    }
  }
  
  const toggleProjectStatus = async (_project: Project) => {
    // API не поддерживает статус; ничего не делаем
    return
  }
  
  // Filter projects based on search
  const filteredProjects = projects.filter(project => {
    // Filter by search term
    const searchMatch = searchTerm === "" || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return searchMatch
  })
  
  // Sort
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Проекты</h1>
        <Link href="/projects/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" /> Новый проект
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-1">Поиск</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по названию или описанию..."
                  className="pl-9 w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Статус</label>
              <div className="flex gap-2">
                <Button 
                  variant={activeFilter === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(activeFilter === true ? null : true)}
                >
                  Активные
                </Button>
                <Button 
                  variant={activeFilter === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(activeFilter === false ? null : false)}
                >
                  Неактивные
                </Button>
                <Button 
                  variant={activeFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(null)}
                >
                  Все
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Сортировка</label>
              <Select value={sortBy} onValueChange={(v: 'name' | 'created_at') => setSortBy(v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="created_at">По дате создания</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка проектов...</div>
        </div>
      ) : (
        <>
          {sortedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row justify-between items-start space-y-0 gap-2 pb-2">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">Проект</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleProjectStatus(project)}
                        title="Изменение статуса недоступно"
                        disabled
                      >
                        <XCircleIcon className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {/* description отсутствует в API */}
                    <p className="text-xs text-muted-foreground">
                      Создан: {formatDate(project.created_at)}
                    </p>
                  </CardContent>
                    <div className="border-t bg-muted/50 p-3 flex justify-end gap-2">
                    <Link href={`/projects/${project.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit2Icon className="h-4 w-4 mr-1" /> Редактировать
                      </Button>
                    </Link>
                      <Link href={`/projects/new?duplicate=${project.id}`}>
                        <Button variant="outline" size="sm">
                          ⧉ Дублировать
                        </Button>
                      </Link>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" /> Удалить
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Проекты не найдены</p>
              <Link href="/projects/new">
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" /> Создать первый проект
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
