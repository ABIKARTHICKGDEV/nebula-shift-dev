import { useEffect, useState, useCallback } from "react";
import { portfolio, type ViewerRole } from "@/data/portfolio";

const KEY = "portfolio.viewerRoleId";

export function useViewerRole(): [ViewerRole, (id: string) => void] {
  const [id, setId] = useState<string>(portfolio.viewerRoles[0]!.id);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && portfolio.viewerRoles.some((r) => r.id === saved)) setId(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const update = useCallback((next: string) => {
    setId(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const role = portfolio.viewerRoles.find((r) => r.id === id) ?? portfolio.viewerRoles[0]!;
  return [role, update];
}
