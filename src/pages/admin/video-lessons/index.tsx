import { URL as API_URL } from "@/api";
import DeleteModal from "@/Components/DeleteModal";
import ExportButtons from "@/Components/ExportButtons";
import type { ExportColumn } from "@/lib/tableExport";
import { useRequest } from "@/hooks/useRequest";
import { alertt } from "@/Redux/LanguageSlice";
import { formatFileSize, type IVideoLesson } from "@/types/videoLesson";
import { formatDateTime, tt } from "@/utils";
import {
  Button,
  DataTable,
  EmptyState,
  Field,
  Input,
  ListCard,
  Modal,
  PageHeader,
  Textarea,
  Toolbar,
  ToolbarSpacer,
  type TableColumn,
} from "@/ui";
import { Pencil, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

const exportColumns = (): ExportColumn<IVideoLesson>[] => [
  { header: "№", value: (r) => r.position, width: 6, align: "center" },
  { header: tt("Dars nomi", "Название урока"), value: (r) => r.title },
  { header: tt("Tavsif", "Описание"), value: (r) => r.description || "" },
  { header: tt("Hajmi", "Размер"), value: (r) => formatFileSize(r.file_size), align: "right" },
  { header: tt("Yuklangan", "Загружено"), value: (r) => formatDateTime(r.created_at), align: "center" },
];

/** Bo'sh shakl — "Qo'shish" bosilganda shu holatga qaytadi */
const EMPTY_FORM = { title: "", description: "", position: "" };

/**
 * Video darslarni boshqarish — faqat super-admin uchun.
 *
 * Yuklash `axios` orqali (`useRequest`), `fetch` asosidagi `useApi` orqali
 * emas: videolar yuzlab MB bo'lishi mumkin va `onUploadProgress` bo'lmasa
 * foydalanuvchi bir necha daqiqa qotib qolgan oyna ko'radi.
 */
export default function AdminVideoLessons() {
  const request = useRequest();
  const dispatch = useDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [lessons, setLessons] = useState<IVideoLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IVideoLesson | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState<IVideoLesson | null>(null);

  const notify = (text: string, success = true) =>
    dispatch(alertt({ text, success }));

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

  const openCreate = () => {
    setEditing(null);
    // Yangi dars ro'yxat oxiriga tushsin
    setForm({ ...EMPTY_FORM, position: String(lessons.length + 1) });
    setFile(null);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (lesson: IVideoLesson) => {
    setEditing(lesson);
    setForm({
      title: lesson.title,
      description: lesson.description || "",
      position: String(lesson.position ?? 0),
    });
    setFile(null);
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 2) {
      next.title = tt("Kamida 2 ta belgi", "Минимум 2 символа");
    }
    // Yangi darsda video majburiy, tahrirlashda ixtiyoriy — berilmasa eskisi qoladi
    if (!editing && !file) {
      next.file = tt("Video fayl tanlanmadi", "Видеофайл не выбран");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("description", form.description.trim());
    body.append("position", form.position || "0");
    if (file) body.append("file", file);

    setSaving(true);
    setProgress(0);
    try {
      const config = {
        onUploadProgress: (e: any) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        },
      };
      const res = editing
        ? await request.put(`/video-lessons/${editing.id}`, body, config)
        : await request.post("/video-lessons", body, config);

      if (res.data?.success) {
        notify(
          editing
            ? tt("Muvaffaqiyatli yangilandi", "Успешно обновлено")
            : tt("Muvaffaqiyatli qo'shildi", "Успешно добавлено")
        );
        setFormOpen(false);
        await load();
      } else {
        notify(res.data?.message || tt("Xatolik", "Ошибка"), false);
      }
    } catch (error: any) {
      notify(
        error?.response?.data?.message || tt("Xatolik yuz berdi", "Произошла ошибка"),
        false
      );
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      const res = await request.delete(`/video-lessons/${deleting.id}`);
      if (res.data?.success) {
        notify(tt("Muvaffaqiyatli o'chirildi", "Успешно удалено"));
        await load();
      } else {
        notify(res.data?.message || tt("Xatolik", "Ошибка"), false);
      }
    } catch (error: any) {
      notify(
        error?.response?.data?.message || tt("Xatolik yuz berdi", "Произошла ошибка"),
        false
      );
    } finally {
      setDeleting(null);
    }
  };

  const columns: TableColumn<IVideoLesson>[] = [
    {
      key: "position",
      header: "№",
      width: "60px",
      align: "center",
      cell: (row) => <span className="tabular-nums">{row.position}</span>,
      sortValue: (row) => row.position,
    },
    {
      key: "title",
      header: tt("Dars nomi", "Название урока"),
      cell: (row) => (
        <div className="min-w-0">
          <span className="block truncate font-medium text-foreground">
            {row.title}
          </span>
          {row.description && (
            <span className="block truncate text-[0.75rem] text-muted-foreground">
              {row.description}
            </span>
          )}
        </div>
      ),
      sortValue: (row) => row.title,
    },
    {
      key: "size",
      header: tt("Hajmi", "Размер"),
      width: "110px",
      align: "right",
      hideOnMobile: true,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatFileSize(row.file_size)}
        </span>
      ),
      sortValue: (row) => Number(row.file_size) || 0,
    },
    {
      key: "created",
      header: tt("Yuklangan", "Загружено"),
      width: "165px",
      align: "center",
      hideOnMobile: true,
      cell: (row) => (
        <span className="whitespace-nowrap tabular-nums text-muted-foreground">
          {formatDateTime(row.created_at)}
        </span>
      ),
      sortValue: (row) => row.created_at,
    },
    {
      key: "actions",
      header: "",
      width: "150px",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(API_URL + row.file, "_blank")}
          >
            {tt("Ko'rish", "Смотреть")}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={tt("Tahrirlash", "Редактировать")}
            onClick={() => openEdit(row)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={tt("O'chirish", "Удалить")}
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleting(row)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    // Sarlavha bilan birga ekranga sig'sin — jadval o'zi aylanadi (ListCard)
    <div className="flex flex-col gap-4 lg:max-h-[max(24rem,calc(100dvh_-_6rem))]">
      <PageHeader
        title={tt("Video darslar", "Видеоуроки")}
        description={tt(
          "Viloyat foydalanuvchilari ko'radigan o'quv videolari",
          "Обучающие видео для пользователей области"
        )}
        actions={
          <Button onClick={openCreate}>
            <Plus />
            {tt("Qo'shish", "Добавить")}
          </Button>
        }
      />

      <ListCard
        toolbar={
          <Toolbar>
            <span className="text-[0.8125rem] text-muted-foreground">
              {tt("Jami", "Всего")}:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {lessons.length}
              </span>
            </span>
            <ToolbarSpacer />
            <span className="text-[0.75rem] text-muted-foreground">
              {tt(
                "Tartib № bo'yicha — kichik raqam yuqorida",
                "Порядок по № — меньший номер выше"
              )}
            </span>
            <ExportButtons
              title={tt("Video darslar", "Видеоуроки")}
              columns={exportColumns()}
              fetchRows={async () => lessons}
            />
          </Toolbar>
        }
      >
        <DataTable
          columns={columns}
          rows={lessons}
          keyOf={(row) => row.id}
          loading={loading}
          fixedLayout
          empty={
            <EmptyState
              icon={Video}
              title={tt("Video darslar yo'q", "Видеоуроков нет")}
              description={tt(
                "Birinchi darsni qo'shing.",
                "Добавьте первый урок."
              )}
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus />
                  {tt("Qo'shish", "Добавить")}
                </Button>
              }
            />
          }
        />
      </ListCard>

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        dismissOnOverlay={false}
        size="xl"
        title={
          editing
            ? tt("Darsni tahrirlash", "Редактировать урок")
            : tt("Yangi video dars", "Новый видеоурок")
        }
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setFormOpen(false)}
            >
              {tt("Bekor qilish", "Отмена")}
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving
                ? `${tt("Yuklanmoqda", "Загрузка")} ${progress}%`
                : tt("Saqlash", "Сохранить")}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label={tt("Dars nomi", "Название урока")} error={errors.title} required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={tt("Masalan: Shartnoma yaratish", "Например: Создание договора")}
            />
          </Field>

          <Field label={tt("Tavsif", "Описание")}>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={tt(
                "Darsda nima ko'rsatilgani qisqacha",
                "Кратко о содержании урока"
              )}
            />
          </Field>

          <Field
            label={tt("Tartib raqami", "Порядковый номер")}
            hint={tt(
              "Ro'yxatda shu raqam bo'yicha joylashadi",
              "Определяет позицию в списке"
            )}
          >
            <Input
              type="number"
              min={0}
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-[8.75rem]"
            />
          </Field>

          <Field
            label={tt("Video fayl", "Видеофайл")}
            error={errors.file}
            required={!editing}
            hint={tt(
              "MP4 yoki WEBM, eng ko'pi 1 GB",
              "MP4 или WEBM, максимум 1 ГБ"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-[0.8125rem] text-muted-foreground file:mr-3 file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-[0.8125rem] file:font-medium file:text-foreground hover:file:bg-muted/70"
            />
          </Field>

          {editing && !file && (
            <p className="text-[0.75rem] text-muted-foreground">
              {tt(
                "Yangi fayl tanlanmasa, mavjud video o'zgarmaydi.",
                "Если файл не выбран, текущее видео останется прежним."
              )}
            </p>
          )}

          {saving && (
            <div className="flex flex-col gap-1">
              <div className="h-1.5 w-full overflow-hidden bg-muted">
                <div
                  className="h-full bg-primary transition-[width] duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[0.75rem] text-muted-foreground tabular-nums">
                {progress}%
              </span>
            </div>
          )}
        </div>
      </Modal>

      <DeleteModal
        open={!!deleting}
        closeModal={() => setDeleting(null)}
        deletee={remove}
      />
    </div>
  );
}
