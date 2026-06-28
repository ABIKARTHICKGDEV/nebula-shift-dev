// Client-side GitHub stats fetcher. Hits the public REST API directly
// (no auth, subject to 60 req/hr/IP unauthenticated rate limit).

export interface GithubRepo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  updated: string | undefined;
}

export type GithubStats =
  | {
      ok: true;
      login: string;
      name: string | null;
      avatar: string;
      followers: number;
      publicRepos: number;
      stars: number;
      recent: GithubRepo[];
    }
  | { ok: false };

export async function getGithubStats(username: string): Promise<GithubStats> {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        headers: { Accept: "application/vnd.github+json" },
      }),
      fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers: { Accept: "application/vnd.github+json" } },
      ),
    ]);
    if (!userRes.ok) return { ok: false };
    const user = await userRes.json();
    const repos = reposRes.ok ? await reposRes.json() : [];
    const stars = Array.isArray(repos)
      ? repos.reduce(
          (sum: number, r: { stargazers_count?: number }) =>
            sum + (r.stargazers_count ?? 0),
          0,
        )
      : 0;
    const recent: GithubRepo[] = Array.isArray(repos)
      ? repos.slice(0, 6).map((r: {
          name: string;
          html_url: string;
          description: string | null;
          language: string | null;
          stargazers_count?: number;
          updated_at?: string;
        }) => ({
          name: r.name,
          url: r.html_url,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count ?? 0,
          updated: r.updated_at,
        }))
      : [];
    return {
      ok: true,
      login: user.login as string,
      name: (user.name as string | null) ?? null,
      avatar: user.avatar_url as string,
      followers: user.followers as number,
      publicRepos: user.public_repos as number,
      stars,
      recent,
    };
  } catch {
    return { ok: false };
  }
}
