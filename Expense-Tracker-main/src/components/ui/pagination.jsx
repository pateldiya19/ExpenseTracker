import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)

const PaginationContent = React.forwardRef(function PaginationContent(
  { className, ...props },
  ref
) {
  return (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
})

const PaginationItem = React.forwardRef(function PaginationItem(
  { className, ...props },
  ref
) {
  return <li ref={ref} className={cn("", className)} {...props} />
})

const paginationVariants = ({ isActive, disabled }) =>
  cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
    !isActive && !disabled && "hover:bg-accent hover:text-accent-foreground"
  )

const PaginationLink = ({ className, isActive, size, ...props }) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(paginationVariants({ isActive }), className)}
    {...props}
  />
)

const PaginationPrevious = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)

const PaginationNext = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 items-center justify-center",
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
