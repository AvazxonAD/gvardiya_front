import { URL as API_URL } from "@/api";
import { useRequest } from "@/hooks/useRequest";
import { formatFileSize, type IVideoLesson } from "@/types/videoLesson";
import { formatDateTime, tt } from "@/utils";
import { Card, EmptyState, Modal, PageHeader, Skeleton } from "@/ui";
import { PlayCircle, Video } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Video darslar — viloyat foydalanuvchisi uchun ko'rish bo'limi.
 *
 * Sahifalash ataylab yo'q: darslar ketma-ket kurs bo'lib, o'quvchi butun
 * ro'yxatni bir ko'rishda ko'rishi kerak. Tartib serverdan `position`
 * bo'yicha keladi — raqamlash shu tartibga tayanadi.
 */
export default function VideoLessons() {
  const request = useRequest();
  const [lessons, setLessons] = useState<IVideoLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<IVideoLesson | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await request.get("/video-lessons");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setLessons(res.data.data);
      }
    } catch (error) {
      console.error("Video darslarni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={tt("Video darslar", "Видеоуроки")}
        description={tt(
          "Dastur bilan ishlashni o'rgatuvchi videolar",
          "Видео, обучающие работе с программой"
        )}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[9.375rem] w-full" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : lessons.length === 0 ? (
        <Card>
          <EmptyState
            icon={Video}
            title={tt("Video darslar hali yuklanmagan", "Видеоуроки ещё не загружены")}
            description={tt(
              "Darslar qo'shilganda shu yerda ko'rinadi.",
              "Уроки появятся здесь после добавления."
            )}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={index}
              onOpen={() => setActive(lesson)}
            />
          ))}
        </div>
      )}

      {/* Pleyer alohida modalda: ro'yxatda bir vaqtda bir nechta video
          yuklanib, kanalni band qilmasligi uchun. */}
      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        size="full"
        title={active?.title}
        description={active?.description || undefined}
      >
        {active && (
          <div className="flex flex-col gap-3">
            <video
              key={active.id}
              src={API_URL + active.file}
              controls
              autoPlay
              controlsList="nodownload"
              className="max-h-[70vh] w-full bg-foreground/90"
            >
              {tt(
                "Brauzeringiz videoni qo'llab-quvvatlamaydi.",
                "Ваш браузер не поддерживает видео."
              )}
            </video>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-muted-foreground">
              <span>{formatFileSize(active.file_size)}</span>
              <span>{formatDateTime(active.created_at)}</span>
              {active.author_fio && <span>{active.author_fio}</span>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function LessonCard({
  lesson,
  index,
  onOpen,
}: {
  lesson: IVideoLesson;
  index: number;
  onOpen: () => void;
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      interactive
      className="group overflow-hidden focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
    >
      <div className="relative flex h-[9.375rem] items-center justify-center overflow-hidden bg-muted">
        {/* `preload="metadata"` — brauzer birinchi kadrni ko'rsatadi, lekin
            butun faylni yuklamaydi. Alohida muqova rasmi shart emas. */}
        <video
          src={API_URL + lesson.file}
          preload="metadata"
          muted
          playsInline
          tabIndex={-1}
          className="h-full w-full object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/25 text-background transition-colors group-hover:bg-foreground/40">
          <PlayCircle className="size-11" strokeWidth={1.5} />
        </span>
        <span className="absolute left-2 top-2 bg-foreground/75 px-2 py-0.5 text-[0.6875rem] font-semibold text-background tabular-nums">
          {index + 1}
        </span>
      </div>

      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-[0.875rem] font-semibold text-foreground">
          {lesson.title}
        </h3>
        {lesson.description && (
          <p className="line-clamp-2 text-[0.75rem] text-muted-foreground">
            {lesson.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap gap-x-3 text-[0.6875rem] text-muted-foreground tabular-nums">
          <span>{formatFileSize(lesson.file_size)}</span>
          <span>{formatDateTime(lesson.created_at)}</span>
        </div>
      </div>
    </Card>
  );
}
