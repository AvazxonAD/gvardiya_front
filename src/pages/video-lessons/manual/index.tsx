import { NavbarPortal } from "@/layout/navbarSlot";
import { getMenuForUser } from "@/layout/menu";
import { isStaffUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Button, Card, Modal, PageBar } from "@/ui";
import { tt } from "@/utils";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpFromLine,
  BarChart3,
  BookMarked,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  FileUp,
  History,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  Shield,
  UserCog,
  UserMinus,
  Users,
  Video,
  Warehouse,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BookButton from "./BookButton";
import { MANUALS, manualAudience, type SectionData } from "./sections";
import type { GuideStep, Shot, Text } from "./types";

type Section = SectionData & { icon: LucideIcon };

const ICONS: Record<string, LucideIcon> = {
  start: Compass,
  dashboard: LayoutDashboard,
  contract: FileText,
  workers: Users,
  batalon: Shield,
  report: BarChart3,
  organisation: Building2,
  prixod: ArrowDownToLine,
  rasxod: ArrowUpFromLine,
  "rasxod-workers": UserMinus,
  "moddiy-baza": Warehouse,
  staff: UserCog,
  logs: History,
  spravochnik: BookMarked,
  // Super-admin qo'llanmasi — menyusidagi belgilar bilan (ADMIN_MENU)
  "admin-start": Compass,
  "admin-dashboard": LayoutDashboard,
  "admin-debt": BarChart3,
  "admin-monitoring": Activity,
  "admin-baza": Landmark,
  "admin-import": FileUp,
  "admin-users": UserCog,
  "admin-logs": History,
  "admin-videos": Video,
  "admin-bxm": BookMarked,
};

const withIcon = (s: SectionData): Section => ({ ...s, icon: ICONS[s.id] ?? FileText });

const t = ([uz, ru]: Text) => tt(uz, ru);

/**
 * Qo'llanma — dastur bo'limlari bo'yicha bosqichma-bosqich yozma
 * ko'rsatma (rasmlar bilan).
 *
 * Ikki alohida qo'llanma (`sections.ts`, MANUALS): super-admin o'zinikini,
 * viloyat foydalanuvchisi viloyatnikini ko'radi. Foydalanuvchida yo'q
 * bo'limlar (masalan, yuristda "Foydalanuvchilar" yoki ruhsat berilmagan
 * menyular) ko'rsatilmaydi — menyu bilan bir xil qoida `getMenuForUser` dan.
 */
export default function Manual() {
  const navigate = useNavigate();
  const user = useSelector((s: any) => s.auth.user);
  const [params, setParams] = useSearchParams();

  const sections = useMemo(() => {
    const open = new Set(
      getMenuForUser(user)
        .filter((m) => !m.disabled)
        .map((m) => m.path)
    );
    // "Ishni boshlash" — viloyat adminining birinchi sozlashlari (rekvizitlar,
    // quyi tuzilmalar...). Yurist/buxgalter ularni qilmaydi — ko'rsatilmaydi.
    return MANUALS[manualAudience(user)].sections
      .filter((s) => (s.id === "start" ? !isStaffUser(user) : !s.path || open.has(s.path)))
      .map(withIcon);
  }, [user]);

  // Tanlangan bo'lim URL da (`?s=contract`) — havola bilan ulashsa ham,
  // brauzerning "orqaga" tugmasi bilan ham shu bo'lim ochiladi
  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === params.get("s"))
  );
  const active = sections[activeIndex];

  // Xodimga qo'llanmasi bor bo'limlardan birortasi ham ochilmagan bo'lsa
  if (!active) {
    return (
      <PageBar>
        <Button variant="secondary" size="sm" onClick={() => navigate("/video-lessons")}>
          <ArrowLeft />
          {tt("Video darslar", "Видеоуроки")}
        </Button>
        <p className="min-w-0 truncate text-[0.8125rem] text-muted-foreground">
          {tt("Sizga ochilgan bo'limlar uchun qo'llanma yo'q", "Для открытых вам разделов руководства нет")}
        </p>
      </PageBar>
    );
  }

  const { guide } = active;
  const prev = sections[activeIndex - 1];
  const next = sections[activeIndex + 1];

  const open = (id: string) => {
    setParams({ s: id });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex flex-col gap-4">
      <NavbarPortal>
        <nav className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
          <ChevronRight className="size-4 shrink-0" />
          <Link
            to="/video-lessons/manual"
            onClick={() => window.scrollTo({ top: 0 })}
            className="shrink-0 transition-colors hover:text-primary"
          >
            {tt("Qo'llanma", "Руководство")}
          </Link>
          <ChevronRight className="size-4 shrink-0" />
          <span className="truncate text-foreground">{t(active.title)}</span>
        </nav>
      </NavbarPortal>

      {/* Paddingsiz sahifa: sarlavha yuqori paneldagi yo'lda, izoh va
          qaytish tugmasi `PageBar` qatorida */}
      <PageBar>
        <Button variant="secondary" size="sm" onClick={() => navigate("/video-lessons")}>
          <ArrowLeft />
          {tt("Video darslar", "Видеоуроки")}
        </Button>
        <p className="min-w-0 truncate text-[0.8125rem] text-muted-foreground">
          {tt(
            "Dastur bo'limlari va ular bilan ishlash tartibi",
            "Разделы программы и порядок работы с ними"
          )}
        </p>
        {/* Shu qo'llanmaning PDF kitobi (barcha bo'limlar, to'liq rasmlar bilan) */}
        <BookButton className="ml-auto" />
      </PageBar>

      <div className="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        {/* Mundarija. Oyna aylanadi, yuqori panel (`h-14`) esa yopishgan —
            `top` uning balandligini hisobga oladi. */}
        <Card className="p-2 lg:sticky lg:top-[3.5rem]">
          <nav className="flex flex-col">
            {sections.map((s) => {
              const selected = s.id === active.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => open(s.id)}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[0.8125rem] transition-colors",
                    selected
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <s.icon className="size-4 shrink-0" />
                  <span className="truncate">{t(s.title)}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <active.icon className="size-[1.125rem]" />
              </span>
              <h3 className="text-[0.9375rem] font-semibold text-foreground">
                {t(active.title)}
              </h3>
            </div>

            <p className="mt-3 text-[0.8125rem] leading-relaxed text-foreground/90">
              {t(guide.intro)}
            </p>

            {guide.need && <Checklist items={guide.need} />}
          </Card>

          {guide.steps?.map((step, i) => (
            <StepCard key={`${active.id}-${i}`} step={step} index={i} />
          ))}

          {guide.outro && <Callout tone="success">{t(guide.outro)}</Callout>}

          {/* Bo'limlar orasida ketma-ket o'tish */}
          <div className="flex items-center justify-between gap-2">
            {prev ? (
              <Button variant="secondary" size="sm" onClick={() => open(prev.id)}>
                <ArrowLeft />
                {t(prev.title)}
              </Button>
            ) : (
              <span />
            )}
            {next && (
              <Button variant="secondary" size="sm" onClick={() => open(next.id)}>
                {t(next.title)}
                <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── */

/** "Tayyorlab qo'ying" — boshlashdan oldin kerak bo'ladigan ma'lumotlar */
function Checklist({ items }: { items: Text[] }) {
  return (
    <div className="mt-4 rounded-md border border-border bg-muted/40 p-3.5">
      <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {tt("Tayyorlab qo'ying", "Подготовьте")}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[0.8125rem] leading-relaxed text-foreground/90">
            <CheckCircle2 className="mt-[0.1875rem] size-3.5 shrink-0 text-primary" />
            <span>{t(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({ step, index }: { step: GuideStep; index: number }) {
  const List = step.ordered ? "ol" : "ul";

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[0.875rem] font-semibold tabular-nums text-primary-foreground">
          {index + 1}
        </span>
        <h3 className="text-[0.9375rem] font-semibold text-foreground">{t(step.title)}</h3>
      </div>

      <div className="mt-3 flex flex-col gap-3 text-[0.8125rem] leading-relaxed">
        <p className="text-foreground/90">{t(step.body)}</p>

        {step.items && (
          <List className="flex flex-col gap-1.5">
            {step.items.map((item, i) => (
              <li key={i} className="flex gap-2 text-foreground/90">
                {step.ordered ? (
                  <span className="w-4 shrink-0 text-right font-semibold tabular-nums text-primary">
                    {i + 1}.
                  </span>
                ) : (
                  <span className="mt-[0.5rem] size-1.5 shrink-0 rounded-full bg-primary/60" />
                )}
                <span>{t(item)}</span>
              </li>
            ))}
          </List>
        )}

        {step.warn && <Callout tone="warning">{t(step.warn)}</Callout>}
        {step.tip && <Callout tone="info">{t(step.tip)}</Callout>}

        {step.shots && (
          <div className="flex flex-wrap gap-3">
            {step.shots.map((shot) => (
              <ShotFigure key={shot.src} shot={shot} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

const CALLOUTS = {
  info: { icon: Lightbulb, className: "border-primary/20 bg-primary/[0.05] [&>svg]:text-primary" },
  warning: { icon: AlertTriangle, className: "border-warning/30 bg-warning/10 [&>svg]:text-warning" },
  success: { icon: CheckCircle2, className: "border-success/30 bg-success/10 [&>svg]:text-success" },
} as const;

function Callout({
  tone,
  children,
}: {
  tone: keyof typeof CALLOUTS;
  children: React.ReactNode;
}) {
  const { icon: Icon, className } = CALLOUTS[tone];
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-md border px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-foreground/90",
        className
      )}
    >
      <Icon className="mt-[0.1875rem] size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/**
 * Skrinshot — kichik rasm (thumbnail); bosilganda katta oynada ochiladi.
 * Fayl hali qo'yilmagan bo'lsa (yoki yuklanmasa) umuman ko'rinmaydi —
 * bo'sh ramka qolmasin.
 */
function ShotFigure({ shot }: { shot: Shot }) {
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);

  if (failed) return null;

  return (
    <figure className="flex w-full flex-col gap-1.5 sm:w-[15rem]">
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative aspect-[16/10] overflow-hidden rounded-md border border-border bg-muted text-left transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/30"
        title={tt("Kattalashtirish uchun bosing", "Нажмите, чтобы увеличить")}
      >
        <img
          src={shot.src}
          alt={t(shot.caption)}
          loading="lazy"
          onError={() => setFailed(true)}
          className="block h-full w-full object-cover object-left-top"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/0 text-background opacity-0 transition group-hover:bg-foreground/25 group-hover:opacity-100">
          <ZoomIn className="size-6" />
        </span>
      </button>
      <figcaption className="text-[0.75rem] leading-snug text-muted-foreground">
        {t(shot.caption)}
      </figcaption>

      <Modal open={zoom} onClose={() => setZoom(false)} size="full" title={t(shot.caption)}>
        <img src={shot.src} alt={t(shot.caption)} className="block w-full" />
      </Modal>
    </figure>
  );
}
