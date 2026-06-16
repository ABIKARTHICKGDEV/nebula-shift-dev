import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getGithubStats = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ username: z.string() }).parse(data))
  .handler(async ({ data }) => {
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${data.username}`, {
          headers: { Accept: "application/vnd.github+json" },
        }),
        fetch(`https://api.github.com/users/${data.username}/repos?per_page=100&sort=updated`, {
          headers: { Accept: "application/vnd.github+json" },
        }),
      ]);
      if (!userRes.ok) throw new Error("GitHub user fetch failed");
      const user = await userRes.json();
      const repos = reposRes.ok ? await reposRes.json() : [];
      const stars = Array.isArray(repos)
        ? repos.reduce((sum: number, r: { stargazers_count?: number }) => sum + (r.stargazers_count ?? 0), 0)
        : 0;
      const recent = Array.isArray(repos)
        ? repos.slice(0, 6).map((r: { name: string; html_url: string; description?: string | null; language?: string | null; stargazers_count?: number; updated_at?: string }) => ({
            name: r.name,
            url: r.html_url,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count ?? 0,
            updated: r.updated_at,
          }))
        : [];
      return {
        ok: true as const,
        login: user.login as string,
        name: user.name as string | null,
        avatar: user.avatar_url as string,
        followers: user.followers as number,
        publicRepos: user.public_repos as number,
        stars,
        recent,
      };
    } catch {
      return { ok: false as const };
    }
  });
