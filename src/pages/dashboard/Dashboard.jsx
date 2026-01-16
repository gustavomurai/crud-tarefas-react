import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

import taskflowLogo from "../../assets/icons/taskflow.svg";

import Toolbar from "./components/Toolbar";
import TaskFormModal from "./components/TaskFormModal";
import TaskDrawer from "./components/TaskDrawer";

import {
  STORAGE_KEY,
  USER_KEY,
  applyDensityFromSettings,
  computeStatus,
  formatBR,
  generateId,
  getTodayISO,
  migrateTask,
  priorityBadgeType,
  statusBadgeType,
  toDate,
} from "./taskUtils";

const seedTasks = [
  {
    id: generateId(),
    title: "Q3 Marketing Strategy Report",
    description: "Finalize the report for the quarterly meeting.",
    dueDate: getTodayISO(),
    completed: false,
    createdAt: Date.now(),
    responsible: "User",
    statusManual: "Pendente",
    priority: "Média",
    tags: ["trabalho"],
  },
  {
    id: generateId(),
    title: "Client Presentation Deck",
    description: "Review and refine slides for the upcoming pitch.",
    dueDate: getTodayISO(),
    completed: false,
    createdAt: Date.now(),
    responsible: "User",
    statusManual: "Em andamento",
    priority: "Alta",
    tags: ["urgente", "cliente"],
  },
  {
    id: generateId(),
    title: "Team Weekly Sync",
    description: "Prepare agenda and update project status.",
    dueDate: getTodayISO(),
    completed: false,
    createdAt: Date.now(),
    responsible: "User",
    statusManual: "Pendente",
    priority: "Baixa",
    tags: [],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Aplica densidade do Settings (compacta/confortável) no CSS global.
  useEffect(() => {
    applyDensityFromSettings();
  }, []);

  /*
    Usuário do login/cadastro (localStorage)
    - Nunca dar return antes dos hooks para não quebrar regras de hooks.
  */
  const user = useMemo(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);

      const name = String(parsed?.name || "User").trim();
      const email = String(parsed?.email || "").trim();

      const initials =
        name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0].toUpperCase())
          .join("") || "U";

      return { name, initials, email };
    } catch {
      return null;
    }
  }, []);

  // Tasks (persistência)
  const [tasks, setTasks] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(migrateTask);
      } catch {
        return seedTasks.map(migrateTask);
      }
    }
    return seedTasks.map(migrateTask);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Menu do perfil
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setMenuOpen(false);
    }

    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  // Modais / Drawer
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTask, setDrawerTask] = useState(null);

  // Confirmação de exclusão (3s)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Busca + filtros
  const [search, setSearch] = useState("");
  const [filterResponsible, setFilterResponsible] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [sortBy, setSortBy] = useState("created_desc");

  // Paginação
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  // Redirect se abrir /dashboard sem user
  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true, state: { skipSplash: true } });
    }
  }, [user, navigate]);

  function handleLogout() {
    localStorage.removeItem(USER_KEY);
    setMenuOpen(false);
    navigate("/", { replace: true, state: { forceSplash: true } });
  }

  // Responsáveis disponíveis
  const responsibleOptions = useMemo(() => {
    const set = new Set();
    if (user?.name) set.add(user.name);

    tasks.forEach((t) => {
      if (t.responsible) set.add(String(t.responsible));
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tasks, user?.name]);

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;

    const inProgress = tasks.filter((t) => {
      const st = computeStatus(t);
      return !t.completed && st === "Em andamento";
    }).length;

    const overdue = tasks.filter((t) => computeStatus(t) === "Atrasada").length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  function normalizeSearchText(v) {
    return String(v || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  const filteredSortedTasks = useMemo(() => {
    let list = [...tasks];

    // Busca global (título, descrição, responsável, tags)
    const q = normalizeSearchText(search.trim());
    if (q) {
      list = list.filter((t) => {
        const hay = [
          t.title,
          t.description,
          t.responsible,
          Array.isArray(t.tags) ? t.tags.join(" ") : "",
        ].join(" ");
        return normalizeSearchText(hay).includes(q);
      });
    }

    if (filterResponsible !== "Todos") {
      list = list.filter((t) => String(t.responsible || "").trim() === filterResponsible);
    }

    if (filterStatus !== "Todos") {
      list = list.filter((t) => computeStatus(t) === filterStatus);
    }

    // Ordenação
    list.sort((a, b) => {
      if (sortBy === "created_desc") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === "created_asc") return (a.createdAt || 0) - (b.createdAt || 0);

      if (sortBy === "due_asc") {
        const ad = a.dueDate ? toDate(a.dueDate)?.getTime() : Number.MAX_SAFE_INTEGER;
        const bd = b.dueDate ? toDate(b.dueDate)?.getTime() : Number.MAX_SAFE_INTEGER;
        return (ad || Number.MAX_SAFE_INTEGER) - (bd || Number.MAX_SAFE_INTEGER);
      }

      if (sortBy === "due_desc") {
        const ad = a.dueDate ? toDate(a.dueDate)?.getTime() : -1;
        const bd = b.dueDate ? toDate(b.dueDate)?.getTime() : -1;
        return (bd || -1) - (ad || -1);
      }

      if (sortBy === "title_asc") {
        return String(a.title || "").localeCompare(String(b.title || ""));
      }

      if (sortBy === "priority_desc") {
        const score = (p) => (p === "Alta" ? 3 : p === "Média" ? 2 : 1);
        return score(b.priority) - score(a.priority);
      }

      return 0;
    });

    return list;
  }, [tasks, search, filterResponsible, filterStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedTasks.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [search, filterResponsible, filterStatus, sortBy]);

  const pagedTasks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSortedTasks.slice(start, start + PAGE_SIZE);
  }, [filteredSortedTasks, page]);

  // CRUD
  function handleNewTask() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function handleEdit(task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function handleOpenDetails(task) {
    setDrawerTask(task);
    setDrawerOpen(true);
  }

  function handleSaveTask(formData) {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
                responsible: formData.responsible,
                statusManual: formData.statusManual,
                priority: formData.priority,
                tags: formData.tags,
                // Se escolher “Concluída” no modal, marca como concluída.
                completed: formData.statusManual === "Concluída" ? true : t.completed,
              }
            : t
        )
      );
    } else {
      const isDone = formData.statusManual === "Concluída";

      const newTask = migrateTask({
        id: generateId(),
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        completed: isDone,
        createdAt: Date.now(),
        responsible: formData.responsible,
        statusManual: isDone ? "Pendente" : formData.statusManual,
        priority: formData.priority,
        tags: formData.tags,
      });

      setTasks((prev) => [newTask, ...prev]);
    }

    setFormOpen(false);
    setEditingTask(null);
  }

  function toggleComplete(taskId) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              statusManual: t.statusManual || "Pendente",
            }
          : t
      )
    );
  }

  function requestDelete(taskId) {
    setConfirmDeleteId(taskId);

    window.setTimeout(() => {
      setConfirmDeleteId((current) => (current === taskId ? null : current));
    }, 3000);
  }

  function confirmDelete(taskId) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setConfirmDeleteId(null);

    const newTotalPages = Math.max(1, Math.ceil((filteredSortedTasks.length - 1) / PAGE_SIZE));
    setPage((p) => Math.min(p, newTotalPages));
  }

  function getBadges(task) {
    const statusText = computeStatus(task);
    return {
      status: { text: statusText, type: statusBadgeType(statusText) },
      priority: { text: task.priority || "Média", type: priorityBadgeType(task.priority) },
    };
  }

  function handlePreset(which) {
    // Presets mexem em busca/filtro de forma previsível (sem quebrar o resto).
    if (which === "all") {
      setSearch("");
      setFilterStatus("Todos");
      return;
    }
    if (which === "today") {
      // “Hoje” => filtra pela data de vencimento (via busca simplificada no ISO)
      setSearch(getTodayISO());
      setFilterStatus("Todos");
      return;
    }
    if (which === "overdue") {
      setSearch("");
      setFilterStatus("Atrasada");
      return;
    }
    if (which === "done") {
      setSearch("");
      setFilterStatus("Concluída");
      return;
    }
  }

  // Depois de TODOS os hooks
  if (!user) return null;

  const drawerConfirming = confirmDeleteId && drawerTask?.id === confirmDeleteId;

  return (
    <div className="dash-page">
      {/* TOP BAR */}
      <header className="dash-topbar">
        <div className="dash-brand">
          <img className="dash-brand-logo" src={taskflowLogo} alt="TaskFlow logo" />
          <div className="dash-brand-name" aria-label="TaskFlow">
            <span className="task">Task</span>
            <span className="flow">Flow</span>
          </div>
        </div>

        <div className="dash-user" ref={menuRef}>
          <button
            type="button"
            className="dash-user-btn"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className="dash-user-avatar" aria-hidden="true">
              {user.initials}
            </div>
            <div className="dash-user-name">{user.name}</div>
            <div className="dash-user-chevron" aria-hidden="true">
              ▾
            </div>
          </button>

          {menuOpen && (
            <div className="dash-menu" role="menu" aria-label="Menu do perfil">
              <div className="dash-menu-head">
                <div className="dash-menu-title">{user.name}</div>
                <div className="dash-menu-sub">{user.email || "Sem e-mail"}</div>
              </div>

              <div className="dash-menu-actions">
                <button
                  type="button"
                  className="dash-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  Perfil <span style={{ opacity: 0.6 }}>↗</span>
                </button>

                <button
                  type="button"
                  className="dash-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/configuracoes");
                  }}
                >
                  Configurações <span style={{ opacity: 0.6 }}>⚙</span>
                </button>

                <button type="button" className="dash-menu-item danger" onClick={handleLogout}>
                  Sair <span style={{ opacity: 0.6 }}>⎋</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="dash-content">
        <div className="dash-hero">
          <h1 className="dash-title">Bem-vindo de volta, {user.name}</h1>
          <p className="dash-subtitle">Uma visão geral das suas tarefas, com busca e prioridade.</p>
        </div>

        {/* STATS */}
        <section className="dash-stats">
          <div className="stat-card accent">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Tarefas totais</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Concluídas</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">Em andamento</div>
          </div>

          <div className="stat-card danger">
            <div className="stat-number">{stats.overdue}</div>
            <div className="stat-label">Atrasadas</div>
          </div>
        </section>

        {/* LISTA */}
        <section className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-title">Tarefas</div>

            <button className="new-task" onClick={handleNewTask} type="button">
              <span className="plus" aria-hidden="true">
                +
              </span>
              Nova tarefa
            </button>
          </div>

          {/* TOOLBAR nova (busca + presets + filtros) */}
          <Toolbar
            search={search}
            setSearch={setSearch}
            filterResponsible={filterResponsible}
            setFilterResponsible={setFilterResponsible}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            responsibleOptions={responsibleOptions}
            onPreset={handlePreset}
          />

          {/* LISTA */}
          <div className="task-list">
            {pagedTasks.length === 0 ? (
              <div className="empty">Nenhuma tarefa encontrada com esses filtros.</div>
            ) : (
              pagedTasks.map((task) => {
                const badges = getBadges(task);
                const isConfirming = confirmDeleteId === task.id;

                return (
                  <div key={task.id} className={task.completed ? "task-row done" : "task-row"}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id)}
                      />
                      <span className="check-ui" />
                    </label>

                    <div className="task-main">
                      <div className="task-title">{task.title}</div>
                      <div className="task-desc">{task.description}</div>

                      <div className="task-meta">
                        <span className={`badge ${badges.status.type}`}>{badges.status.text}</span>

                        <span className={`badge ${badges.priority.type}`}>
                          Prioridade: {badges.priority.text}
                        </span>

                        <span className="badge neutral" style={{ opacity: 0.95 }}>
                          Resp.: {task.responsible || "—"}
                        </span>

                        {task.tags?.slice(0, 3)?.map((t) => (
                          <span key={t} className="badge neutral">
                            #{t}
                          </span>
                        ))}

                        <span className="due">
                          Criada:{" "}
                          {task.createdAt
                            ? formatBR(new Date(task.createdAt).toISOString().slice(0, 10))
                            : "—"}
                        </span>

                        <span className="due">Venc.: {task.dueDate ? formatBR(task.dueDate) : "—"}</span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button className="ghost" type="button" onClick={() => handleOpenDetails(task)}>
                        Detalhes
                      </button>

                      <button className="ghost" type="button" onClick={() => handleEdit(task)}>
                        Editar
                      </button>

                      <button
                        type="button"
                        className={isConfirming ? "ghost confirm" : "ghost danger"}
                        onClick={() => (isConfirming ? confirmDelete(task.id) : requestDelete(task.id))}
                        title={isConfirming ? "Clique novamente para confirmar" : "Excluir tarefa"}
                      >
                        {isConfirming ? "Confirmar" : "Excluir"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PAGINAÇÃO */}
          <div className="pagination">
            <div className="pagination-info">
              Página {page} de {totalPages} • Mostrando {pagedTasks.length} de {filteredSortedTasks.length}
            </div>

            <div className="pagination-actions">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(1)} type="button">
                «
              </button>

              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                ‹
              </button>

              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                ›
              </button>

              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                type="button"
              >
                »
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Criar/Editar (organizado) */}
      {formOpen && (
        <TaskFormModal
          userName={user.name}
          responsibleOptions={responsibleOptions}
          initialData={editingTask}
          onClose={() => {
            setFormOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {/* Drawer de Detalhes (mais moderno que modal) */}
      <TaskDrawer
        open={drawerOpen}
        task={drawerTask}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerTask(null);
        }}
        onEdit={() => {
          if (!drawerTask) return;
          setDrawerOpen(false);
          setEditingTask(drawerTask);
          setFormOpen(true);
        }}
        onDelete={() => {
          if (!drawerTask) return;
          requestDelete(drawerTask.id);
        }}
        isConfirming={Boolean(drawerConfirming)}
        onConfirmDelete={() => {
          if (!drawerTask) return;
          confirmDelete(drawerTask.id);
          setDrawerOpen(false);
          setDrawerTask(null);
        }}
      />

      {/* PÍLULA FIXA */}
      <div className="dash-footer-pill">
        Projeto desenvolvido por <strong>Gustavo Murai</strong>
      </div>
    </div>
  );
}
