"use client"

import { useState } from "react"
import { CashFlowItemHierarchy, CashFlowItemService } from "@/services/cash-flow-item-service"
import { Button } from "@/components/ui/button"
import { ChevronRightIcon, ChevronDownIcon, EditIcon, TrashIcon, PlusIcon } from "lucide-react"
import Link from "next/link"

interface TreeItemProps {
  item: CashFlowItemHierarchy
  onDelete: () => Promise<void>
  level: number
}

export function TreeItem({ item, onDelete, level }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = item.children && item.children.length > 0

  const handleDelete = async () => {
    if (confirm(`Вы уверены, что хотите удалить статью "${item.name}"?`)) {
      try {
        await CashFlowItemService.deleteCashFlowItem(item.id)
        await onDelete()
      } catch (error) {
        console.error("Ошибка при удалении статьи:", error)
        alert("Не удалось удалить статью. Возможно, она используется в операциях.")
      }
    }
  }

  return (
    <div>
      <div 
        className={`flex items-center py-2 px-2 hover:bg-muted/50 rounded-md ${
          level > 0 ? `ml-${level * 6}` : ""
        }`}
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        {hasChildren ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-6 w-6 mr-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6 mr-2" />
        )}
        
        <span className="flex-grow font-medium">{item.name}</span>
        
        <div className="flex items-center gap-2">
          <Link href={`/cash-flow-items/new?parent=${item.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/cash-flow-items/${item.id}/edit`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <EditIcon className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {item.children!.map(child => (
            <TreeItem
              key={child.id}
              item={child}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
