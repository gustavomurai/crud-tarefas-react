// src/pages/dashboard/components/Toolbar.jsx
import "./Toolbar.css";

export default function Toolbar({
  search,
  setSearch,
  filterResponsible,
  setFilterResponsible,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  responsibleOptions,
  onPreset,
}) {
  return (
    <div className="tf-toolbar">
      <div className="tf-toolbar-row">
        <div className="tf-search">
          <div className="tf-search-icon" aria-hidden="true">
            ⌕
          </div>

          <input
            className="tf-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, descrição, responsável ou tag…"
          />

          {search?.trim() && (
            <button
              className="tf-search-clear"
              type="button"
              onClick={() => setSearch("")}
              aria-label="Limpar busca"
              title="Limpar"
            >
              ✕
            </button>
          )}
        </div>

        <div className="tf-presets">
          <button className="tf-chip" type="button" onClick={() => onPreset("all")}>
            Todas
          </button>
          <button className="tf-chip" type="button" onClick={() => onPreset("today")}>
            Hoje
          </button>
          <button className="tf-chip danger" type="button" onClick={() => onPreset("overdue")}>
            Atrasadas
          </button>
          <button className="tf-chip" type="button" onClick={() => onPreset("done")}>
            Concluídas
          </button>
        </div>
      </div>

      <div className="tf-toolbar-row tf-toolbar-filters">
        <div className="tf-filter">
          <div className="tf-filter-label">Responsável</div>
          <select
            className="tf-select"
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {responsibleOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="tf-filter">
          <div className="tf-filter-label">Status</div>
          <select
            className="tf-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
            <option value="Atrasada">Atrasada</option>
          </select>
        </div>

        <div className="tf-filter">
          <div className="tf-filter-label">Ordenar por</div>
          <select className="tf-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_desc">Criação (mais recente)</option>
            <option value="created_asc">Criação (mais antiga)</option>
            <option value="due_asc">Data limite (mais próxima)</option>
            <option value="due_desc">Data limite (mais distante)</option>
            <option value="title_asc">Título (A–Z)</option>
            <option value="priority_desc">Prioridade (Alta → Baixa)</option>
          </select>
        </div>

        <div />
      </div>
    </div>
  );
}
