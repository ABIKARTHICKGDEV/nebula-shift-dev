import * as React from "react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { portfolio } from "@/data/portfolio";
import type { ViewerRole } from "@/data/portfolio";
import { SectionHead } from "./projects";
import { getGithubStats } from "@/lib/github";
import { emailConfig, isEmailConfigured } from "@/config/email";
import { asset } from "@/lib/asset";

type LucideIcon = React.ComponentType<{ className?: string }>;
const lucide = Icons as unknown as Record<string, LucideIcon>;

export function About() {
  return (
    <section id="about" className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead eyebrow="About" title="The Player Behind The Code" />
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
            {portfolio.about.bio}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {portfolio.about.education.map((e) => (
              <div key={e.degree} className="rounded-xl border border-white/8 bg-white/5 p-3">
                <div className="font-display text-sm font-semibold text-foreground">{e.degree}</div>
                <div className="text-xs text-muted-foreground">{e.school}</div>
                {e.detail ? <div className="mt-1 text-xs text-primary">{e.detail}</div> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="glass grid grid-cols-2 gap-3 rounded-2xl p-5">
          {portfolio.stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
      <div className="font-display text-3xl font-bold text-gradient">
        {value}
        {suffix ?? ""}
      </div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

export function CurrentlyBuilding() {
  const c = portfolio.currentlyBuilding;
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="glass-strong relative overflow-hidden rounded-3xl p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-accent">
              <Icons.Construction className="h-3 w-3" /> Currently Building
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{c.title}</h2>
            <p className="text-sm font-medium text-foreground/80">{c.subtitle}</p>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">{c.description}</p>

            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.status}</span>
                <span className="font-display font-semibold text-primary">{c.progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_18px_-2px] shadow-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export function Showcase() {
  return (
    <section id="showcase" className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead
        eyebrow="Game Showcase"
        title="Play It In The Browser"
        sub="Embedded itch.io builds, gameplay clips, and screenshots. No download needed."
      />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {portfolio.projects
          .filter((p) => p.links.itch)
          .slice(0, 4)
          .map((p) => (
            <div key={p.id} className="glass overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-white/10 p-3">
                <div>
                  <div className="font-display text-sm font-semibold">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.category}</div>
                </div>
                <a
                  href={p.links.itch}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white/10"
                >
                  <Icons.ExternalLink className="h-3.5 w-3.5" /> itch.io
                </a>
              </div>
              <LazyItchEmbed url={p.links.itchEmbedUrl} title={p.title} fallbackUrl={p.links.itch!} />
            </div>
          ))}
      </div>
    </section>
  );
}

function LazyItchEmbed({
  url,
  title,
  fallbackUrl,
}: {
  url?: string;
  title: string;
  fallbackUrl: string;
}) {
  const [load, setLoad] = useState(false);
  if (!url) {
    return (
      <div className="relative aspect-video">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <Icons.Gamepad2 className="h-10 w-10 text-primary" />
          <div className="font-display text-sm font-semibold">{title}</div>
          <div className="px-6 text-xs text-muted-foreground">
            Add an itch.io embed URL in <code>portfolio.ts</code> to play here.
          </div>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Open on itch.io <Icons.ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="scanlines" />
      </div>
    );
  }
  return (
    <div className="relative aspect-video bg-black">
      {load ? (
        <iframe
          src={url}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; gamepad"
          loading="lazy"
        />
      ) : (
        <button
          onClick={() => setLoad(true)}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/50 transition group-hover:scale-110">
            <Icons.Play className="h-7 w-7" />
          </div>
        </button>
      )}
    </div>
  );
}

export function Skills({ role }: { role: ViewerRole }) {
  const ordered = [...portfolio.skillGroups].sort(
    (a, b) =>
      (role.skillsPriority.indexOf(a.id) === -1 ? 99 : role.skillsPriority.indexOf(a.id)) -
      (role.skillsPriority.indexOf(b.id) === -1 ? 99 : role.skillsPriority.indexOf(b.id)),
  );
  return (
    <section id="skills" className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead eyebrow="Skills" title="The Toolkit" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ordered.map((g) => {
          const Icon = lucide[g.icon] ?? Icons.Sparkles;
          return (
            <div key={g.id} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary neon-border">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-semibold">{g.title}</h3>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <span
                    key={s.name}
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-foreground/90"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Learning() {
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead eyebrow="Learning Journey" title="Always In Development" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {portfolio.learningJourney.map((l) => {
          const Icon = lucide[l.icon] ?? Icons.BookOpen;
          return (
            <div key={l.title} className="glass rounded-2xl p-4">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent neon-border">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 font-display text-sm font-semibold">{l.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{l.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead eyebrow="Process" title="From Concept To Release" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {portfolio.process.map((p, i) => {
          const Icon = lucide[p.icon] ?? Icons.Circle;
          return (
            <div key={p.label} className="glass relative rounded-xl p-3">
              <div className="absolute right-2 top-2 font-display text-[10px] text-muted-foreground">
                0{i + 1}
              </div>
              <Icon className="h-5 w-5 text-primary" />
              <div className="mt-2 font-display text-sm font-semibold">{p.label}</div>
              <div className="text-[11px] text-muted-foreground">{p.description}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function GithubBlock() {
  const q = useQuery({
    queryKey: ["github", portfolio.github.username],
    queryFn: () => getGithubStats(portfolio.github.username),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
  return (
    <section id="github" className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead eyebrow="GitHub" title={`@${portfolio.github.username}`} />
      <div className="mt-6 glass rounded-2xl p-5">
        {q.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading GitHub activity…</div>
        ) : q.data?.ok ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Public Repos" value={String(q.data.publicRepos)} />
              <Stat label="Followers" value={String(q.data.followers)} />
              <Stat label="Total Stars" value={String(q.data.stars)} />
              <Stat label="Recent" value={String(q.data.recent.length)} />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {q.data.recent.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-display text-sm font-semibold">{r.name}</div>
                    <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Icons.Star className="h-3 w-3" /> {r.stars}
                    </div>
                  </div>
                  {r.description ? (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {r.description}
                    </div>
                  ) : null}
                  {r.language ? (
                    <div className="mt-2 inline-flex rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                      {r.language}
                    </div>
                  ) : null}
                </a>
              ))}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Live GitHub data unavailable right now. Visit{" "}
            <a
              className="text-primary underline"
              href={`https://github.com/${portfolio.github.username}`}
            >
              github.com/{portfolio.github.username}
            </a>
            .
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
      <div className="font-display text-2xl font-bold text-gradient">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

export function CareerInterests() {
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead eyebrow="Career Interests" title="Open To Build" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {portfolio.careerInterests.map((c) => {
          const Icon = lucide[c.icon] ?? Icons.Briefcase;
          return (
            <div key={c.title} className="glass rounded-2xl p-4">
              <Icon className="h-5 w-5 text-primary" />
              <div className="mt-2 font-display text-sm font-semibold">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.description}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Contact (EmailJS) ──────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().trim().min(1, "Required").max(80, "Too long"),
  email: z.string().trim().email("Invalid email").max(160),
  subject: z.string().trim().min(1, "Required").max(120, "Too long"),
  message: z.string().trim().min(1, "Required").max(2000, "Too long"),
});
type ContactValues = z.infer<typeof contactSchema>;

export function Contact() {
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactValues) {
    setSending(true);
    try {
      if (isEmailConfigured()) {
        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          {
            name: values.name,
            email: values.email,
            subject: values.subject,
            message: values.message,
            to_email: portfolio.profile.email,
          },
          { publicKey: emailConfig.publicKey },
        );
        toast.success("Message sent — thanks for reaching out!");
        reset();
      } else {
        // Fallback: open the user's mail client when EmailJS isn't configured.
        const subject = encodeURIComponent(values.subject || `Portfolio Contact — ${values.name}`);
        const body = encodeURIComponent(
          `${values.message}\n\n— ${values.name} (${values.email})`,
        );
        window.location.href = `mailto:${portfolio.profile.email}?subject=${subject}&body=${body}`;
        toast.message("Opening your mail client…");
        reset();
      }
    } catch (err) {
      console.error("[contact] send failed", err);
      toast.error("Couldn't send right now. Please email me directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="mx-auto mt-24 max-w-6xl px-4">
      <SectionHead eyebrow="Contact" title="Let's Build Something Playable" />
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-3 rounded-2xl p-5" noValidate>
          {import.meta.env.DEV && !isEmailConfigured() ? (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-[11px] text-amber-200">
              EmailJS not configured — form will fall back to <code>mailto:</code>. Set
              <code className="mx-1">VITE_EMAIL_*</code>in <code>.env.local</code>.
            </div>
          ) : null}

          <Field label="Name" error={errors.name?.message} {...register("name")} />
          <Field label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Field label="Subject" error={errors.subject?.message} {...register("subject")} />
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Message
            </label>
            <textarea
              rows={5}
              maxLength={2000}
              {...register("message")}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {errors.message ? (
              <p className="mt-1 text-[11px] text-destructive">{errors.message.message}</p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? (
              <>
                <Icons.Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                <Icons.Send className="h-4 w-4" /> Send Message
              </>
            )}
          </button>
        </form>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="font-display text-xs uppercase tracking-[0.25em] text-primary">
              Direct
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <a
                className="flex items-center gap-2 hover:text-primary"
                href={`mailto:${portfolio.profile.email}`}
              >
                <Icons.Mail className="h-4 w-4" /> {portfolio.profile.email}
              </a>
              <a
                className="flex items-center gap-2 hover:text-primary"
                href={portfolio.profile.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <Icons.Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a
                className="flex items-center gap-2 hover:text-primary"
                href={portfolio.profile.github}
                target="_blank"
                rel="noreferrer"
              >
                <Icons.Github className="h-4 w-4" /> GitHub
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icons.MapPin className="h-4 w-4" /> {portfolio.profile.location}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="font-display text-xs uppercase tracking-[0.25em] text-primary">
              Resume Variants
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["unity", "Unity Resume"],
                  ["unreal", "Unreal Resume"],
                  ["gameplay", "Gameplay Resume"],
                  ["software", "Software Resume"],
                ] as const
              ).map(([k, label]) => (
                <a
                  key={k}
                  href={asset(portfolio.resumes[k])}
                  download
                  className="inline-flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                >
                  {label}
                  <Icons.Download className="h-3.5 w-3.5 text-primary" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
const Field = React.forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, type = "text", ...rest },
  ref,
) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        ref={ref}
        type={type}
        {...rest}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary"
      />
      {error ? <p className="mt-1 text-[11px] text-destructive">{error}</p> : null}
    </div>
  );
});

export function Footer() {
  return (
    <footer className="mx-auto mt-24 max-w-6xl px-4 pb-10">
      <div className="glass flex flex-col items-center justify-between gap-3 rounded-2xl p-4 sm:flex-row">
        <div className="font-display text-xs uppercase tracking-[0.25em] text-muted-foreground">
          © {new Date().getFullYear()} {portfolio.profile.name}
        </div>
        <div className="text-xs text-muted-foreground">
          Built with React + Vite. Deployed on GitHub Pages.
        </div>
      </div>
    </footer>
  );
}

export function LoadingScreen() {
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(100, (elapsed / 900) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 200);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (done) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="w-[280px] text-center">
        <div className="font-display text-xs uppercase tracking-[0.3em] text-primary">
          Initializing Game World…
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_18px_-2px] shadow-primary"
            style={{ width: `${progress}%`, transition: "width 80ms linear" }}
          />
        </div>
        <div className="mt-2 font-display text-[10px] tracking-widest text-muted-foreground">
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
}
