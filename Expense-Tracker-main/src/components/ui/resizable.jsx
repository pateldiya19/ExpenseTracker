import * as React from "react"
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = React.forwardRef(function ResizablePanelGroup(
  { className, ...props },
  ref
) {
  return (
    <PanelGroup
      ref={ref}
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
})

const ResizablePanel = Panel

const ResizableHandle = React.forwardRef(function ResizableHandle(
  { withHandle, className, ...props },
  ref
) {
  return (
    <PanelResizeHandle
      ref={ref}
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:left-1/2 after:top-1/2 after:h-6 after:w-1 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-border after:opacity-0 hover:after:opacity-100 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-6",
        withHandle &&
          "after:content-[''] after:shadow-[0_0_0_1px_hsl(var(--border))] data-[panel-group-direction=vertical]:py-1 data-[panel-group-direction=horizontal]:px-1",
        className
      )}
      {...props}
    >
      {withHandle ? (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border data-[panel-group-direction=vertical]:h-3 data-[panel-group-direction=vertical]:w-4">
          <div className="h-2.5 w-0.5 rounded-full bg-background" />
        </div>
      ) : null}
    </PanelResizeHandle>
  )
})

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
