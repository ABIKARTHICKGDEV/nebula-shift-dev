import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";

const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      <div className="font-display text-xs uppercase tracking-[0.3em]">Loading…</div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
