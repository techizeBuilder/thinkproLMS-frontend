import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MoreHorizontal, Edit, Trash2, KeyRound, Power, PowerOff } from "lucide-react"
import { Link } from "react-router-dom"

interface MobileActionsProps {
  editUrl?: string
  onEdit?: () => void
  onDelete?: () => void
  onResetPassword?: () => void
  onToggleStatus?: () => void
  isActive?: boolean
  isSystemAdmin?: boolean
  deleteLoading?: boolean
  toggleLoading?: boolean
}

export function MobileActions({
  editUrl,
  onEdit,
  onDelete,
  onResetPassword,
  onToggleStatus,
  isActive,
  isSystemAdmin,
  deleteLoading,
  toggleLoading
}: MobileActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Desktop: Show individual buttons */}
      <div className="hidden sm:flex gap-2">
        {onResetPassword && (
          <Button
            variant="outline"
            size="icon"
            onClick={onResetPassword}
            title="Reset Password"
          >
            <KeyRound className="h-4 w-4" />
          </Button>
        )}
        {onToggleStatus && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleStatus}
            disabled={toggleLoading}
            className={isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
            title={isActive ? "Deactivate" : "Activate"}
          >
            {toggleLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : isActive ? (
              <PowerOff className="h-4 w-4" />
            ) : (
              <Power className="h-4 w-4" />
            )}
          </Button>
        )}
        {editUrl && (
          <Link to={editUrl}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        )}
        {onEdit && (
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && !isSystemAdmin && (
          <Button
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-700"
            onClick={onDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}
        {isSystemAdmin && (
          <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            Protected
          </span>
        )}
      </div>

      {/* Mobile: Show popover menu */}
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              {onResetPassword && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetPassword}
                  className="w-full justify-start"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
              )}
              {onToggleStatus && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleStatus}
                  disabled={toggleLoading}
                  className="w-full justify-start"
                >
                  {toggleLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : isActive ? (
                    <PowerOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Power className="mr-2 h-4 w-4" />
                  )}
                  {isActive ? "Deactivate" : "Activate"}
                </Button>
              )}
              {editUrl && (
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link to={editUrl}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="w-full justify-start"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && !isSystemAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={deleteLoading}
                  className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                >
                  {deleteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
