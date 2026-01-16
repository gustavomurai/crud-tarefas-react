// src/pages/dashboard/components/TaskDrawer.jsx
import { computeStatus, formatBR, statusBadgeType, priorityBadgeType } from "../taskUtils";
import "./TaskDrawer.css";

export default function TaskDrawer({
  open,
  task,
  onClose,
  onEdit,
  onDelete,
  isConfirming,
  onConfirmDelete,
}) {
  if (!open || !task) return null;

  const statusText = computeStatus(task);
  const statusType = statusBadgeType(statusText);
  const prioType = priorityBadgeType(task.priority);

  return (
    <div className="tf-drawer-backdrop" role="dialog" aria-modal="true">
      <aside className="tf-drawer">
        <div className="tf-drawer-head">
          <div className="tf-drawer-title">Detalhes</div>

          <button className="tf-icon-btn" type="button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="tf-drawer-body">
          <div className="tf-detail-card">
            <div className="tf-detail-title">{task.title}</div>

            <div className="tf-badges">
              <span className={`tf-badge ${statusType}`}>{statusText}</span>
              <span className={`tf-badge ${prioType}`}>Prioridade: {task.priority}</span>

              {task.tags?.length ? (
                task.tags.map((t) => (
                  <span key={t} className="tf-badge neutral">
                    #{t}
                  </span>
                ))
              ) : (
                <span className="tf-muted">Sem tags</span>
              )}
            </div>

            <div className="tf-detail-grid">
              <div className="tf-k">Responsável</div>
              <div className="tf-v">{task.responsible || "—"}</div>

              <div className="tf-k">Criada em</div>
              <div className="tf-v">
                {task.createdAt ? formatBR(new Date(task.createdAt).toISOString().slice(0, 10)) : "—"}
              </div>

              <div className="tf-k">Data limite</div>
              <div className="tf-v">{task.dueDate ? formatBR(task.dueDate) : "—"}</div>
            </div>

            <div className="tf-detail-desc">
              {task.description?.trim() ? task.description : "Sem descrição."}
            </div>
          </div>
        </div>

        <div className="tf-drawer-footer">
          <button
            type="button"
            className={isConfirming ? "tf-btn danger confirm" : "tf-btn danger"}
            onClick={() => (isConfirming ? onConfirmDelete() : onDelete())}
            title={isConfirming ? "Clique novamente para confirmar" : "Excluir tarefa"}
          >
            {isConfirming ? "Confirmar exclusão" : "Excluir"}
          </button>

          <div className="tf-drawer-footer-right">
            <button type="button" className="tf-btn" onClick={onClose}>
              Fechar
            </button>

            <button type="button" className="tf-btn primary" onClick={onEdit}>
              Editar
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
