import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Routes, Route, BrowserRouter } from "react-router-dom"
import Index from "@/pages/Index"
import NotFound from "@/pages/NotFound"
import { GuestbookProvider } from "@/contexts/GuestbookContext"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GuestbookProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GuestbookProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App