// src/pages/dashboard/components/TaskFormModal.jsx
import { useMemo, useState } from "react";
import { normalizePriority, normalizeTags } from "../taskUtils";
import "./TaskFormModal.css";

export default function TaskFormModal({
  userName,
  responsibleOptions,
  initialData,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? "");
  const [responsible, setResponsible] = useState(initialData?.responsible ?? userName);

  const [statusManual, setStatusManual] = useState(() => {
    if (initialData?.completed) return "Concluída";
    return initialData?.statusManual ?? "Pendente";
  });

  const [priority, setPriority] = useState(normalizePriority(initialData?.priority));
  const [tagsText, setTagsText] = useState(
    Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : ""
  );

  const tags = useMemo(() => normalizeTags(tagsText), [tagsText]);

  const [errors, setErrors] = useState({ title: false, dueDate: false });

  function validate() {
    const nextErrors = {
      title: title.trim().length === 0,
      dueDate: String(dueDate || "").trim().length === 0,
    };
    setErrors(nextErrors);
    return !nextErrors.title && !nextErrors.dueDate;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      responsible,
      statusManual,
      priority,
      tags,
    });
  }

  return (
    <div className="tf-modal-backdrop" role="dialog" aria-modal="true">
      <div className="tf-modal">
        <div className="tf-modal-header">
          <div className="tf-modal-title">{isEditing ? "Editar tarefa" : "Nova tarefa"}</div>

          <button className="tf-icon-btn" type="button" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form className="tf-modal-body" onSubmit={handleSubmit}>
          <div className="tf-field">
            <label>Título</label>
            <input
              className={errors.title ? "tf-input error" : "tf-input"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Revisar apresentação do cliente"
            />
            {errors.title && <div className="tf-error">Título é obrigatório.</div>}
          </div>

          <div className="tf-field">
            <label>Descrição</label>
            <textarea
              className="tf-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que precisa ser feito…"
              rows={4}
            />
          </div>

          <div className="tf-grid-2">
            <div className="tf-field">
              <label>Data de vencimento</label>
              <input
                type="date"
                className={errors.dueDate ? "tf-input error" : "tf-input"}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              {errors.dueDate && <div className="tf-error">Data é obrigatória.</div>}
            </div>

            <div className="tf-field">
              <label>Responsável</label>
              <select
                className="tf-select"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
              >
                {responsibleOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="tf-grid-2">
            <div className="tf-field">
              <label>Status</label>
              <select
                className="tf-select"
                value={statusManual}
                onChange={(e) => setStatusManual(e.target.value)}
              >
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluída">Concluída</option>
              </select>

              <div className="tf-hint">
                “Atrasada” aparece automaticamente quando a tarefa vence e não está concluída.
              </div>
            </div>

            <div className="tf-field">
              <label>Prioridade</label>
              <select className="tf-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
              <div className="tf-hint">Use prioridade para “puxar” o que é mais urgente.</div>
            </div>
          </div>

          <div className="tf-field">
            <label>Tags</label>
            <input
              className="tf-input"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Ex: trabalho, faculdade, urgente"
            />
            <div className="tf-tags-preview">
              {tags.length === 0 ? (
                <span className="tf-hint">Dica: separe por vírgula.</span>
              ) : (
                tags.map((t) => (
                  <span key={t} className="tf-tag">
                    #{t}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="tf-modal-footer">
            <button type="button" className="tf-btn" onClick={onClose}>
              Cancelar
            </button>

            <button type="submit" className="tf-btn primary">
              {isEditing ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
