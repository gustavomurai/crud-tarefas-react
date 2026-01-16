// src/pages/dashboard/taskUtils.js

// Tudo aqui é utilitário puro: não depende de React.
// Mantém o Dashboard limpo e facilita manutenção.

export const STORAGE_KEY = "taskflow_tasks_v2";
export const USER_KEY = "taskflow_user_v1";
export const SETTINGS_KEY = "taskflow_settings_v1";

export function generateId() {
  return String(Date.now()) + "-" + String(Math.floor(Math.random() * 100000));
}

export function getTodayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function toDate(dateISO) {
  const [y, m, d] = String(dateISO || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function formatBR(dateISO) {
  if (!dateISO) return "—";
  const [y, m, d] = String(dateISO).split("-").map(Number);
  if (!y || !m || !d) return String(dateISO);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

/*
  Status do projeto:
  - Pendente
  - Em andamento
  - Concluída
  - Atrasada (automático quando vencida e não concluída)
*/
export function computeStatus(task) {
  if (task.completed) return "Concluída";

  if (task.dueDate) {
    const today = toDate(getTodayISO());
    const due = toDate(task.dueDate);
    if (today && due && due < today) return "Atrasada";
  }

  return task.statusManual || "Pendente";
}

export function statusBadgeType(statusText) {
  if (statusText === "Concluída") return "done";
  if (statusText === "Atrasada") return "danger";
  if (statusText === "Em andamento") return "info";
  return "neutral";
}

/* Prioridade (novo) */
export function normalizePriority(p) {
  const v = String(p || "Média");
  if (v === "Alta" || v === "Média" || v === "Baixa") return v;
  return "Média";
}
export function priorityBadgeType(priority) {
  if (priority === "Alta") return "danger";
  if (priority === "Média") return "info";
  return "neutral";
}

/* Tags (novo) */
export function normalizeTags(input) {
  // Aceita string "tag1, tag2" ou array.
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(",");
  const cleaned = arr
    .map((t) => String(t || "").trim())
    .filter(Boolean)
    .slice(0, 8);

  // Remove duplicadas por case-insensitive
  const seen = new Set();
  const out = [];
  for (const t of cleaned) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export function safeParseJSON(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function applyDensityFromSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  const parsed = raw ? safeParseJSON(raw, null) : null;

  const density = String(parsed?.densidade || "confortavel");
  // Aqui usamos data-attribute pra CSS reagir sem gambiarra.
  document.documentElement.dataset.density = density;
}

export function migrateTask(task) {
  // Garante que tarefas antigas continuem funcionando.
  const t = { ...task };

  t.title = String(t.title || "").trim();
  t.description = String(t.description || "");
  t.dueDate = t.dueDate ? String(t.dueDate) : "";
  t.responsible = String(t.responsible || "User");
  t.statusManual = String(t.statusManual || "Pendente");
  t.completed = Boolean(t.completed);

  t.priority = normalizePriority(t.priority);
  t.tags = normalizeTags(t.tags);

  // createdAt pode faltar em tasks antigas
  t.createdAt = Number.isFinite(t.createdAt) ? t.createdAt : Date.now();

  return t;
}
