// src/pages/settings/Settings.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./settings.css";

import taskflowLogo from "../../assets/icons/taskflow.svg";
import { SETTINGS_KEY, USER_KEY, applyDensityFromSettings, safeParseJSON } from "../dashboard/taskUtils";

export default function Settings() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    const parsed = safeParseJSON(raw, null);
    if (!parsed) return null;

    const name = String(parsed?.name || "User").trim();
    const email = String(parsed?.email || "").trim();
    return { name, email };
  }, []);

  useEffect(() => {
    if (!user) navigate("/", { replace: true, state: { skipSplash: true } });
  }, [user, navigate]);

  if (!user) return null;

  const [settings, setSettings] = useState(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? safeParseJSON(raw, null) : null;

    return {
      idioma: String(parsed?.idioma || "pt-BR"),
      densidade: String(parsed?.densidade || "confortavel"), // confortavel | compacta
      atalhos: Boolean(parsed?.atalhos ?? true),
    };
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    // Aplica densidade em tempo real no CSS global, sem precisar recarregar.
    document.documentElement.dataset.density = settings.densidade;
  }, [settings]);

  useEffect(() => {
    // Garante que ao entrar na página, a densidade atual esteja aplicada.
    applyDensityFromSettings();
  }, []);

  function handleBack() {
    navigate("/dashboard");
  }

  function handleSaveHint() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function handleLogout() {
    localStorage.removeItem(USER_KEY);
    navigate("/", { replace: true, state: { skipSplash: true } });
  }

  return (
    <div className="settings-page">
      <header className="settings-topbar">
        <button className="settings-brand" type="button" onClick={handleBack}>
          <img className="settings-logo" src={taskflowLogo} alt="TaskFlow logo" />
          <div className="settings-brand-name" aria-label="TaskFlow">
            <span className="task">Task</span>
            <span className="flow">Flow</span>
          </div>
        </button>

        <div className="settings-actions">
          <button className="settings-top-btn" type="button" onClick={handleBack}>
            Voltar
          </button>

          <button className="settings-top-btn danger" type="button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <main className="settings-content">
        <div className="settings-hero">
          <h1 className="settings-title">Configurações</h1>
          <p className="settings-subtitle">Preferências do app para a sua conta ({user.name}).</p>
        </div>

        <section className="settings-card">
          <div className="settings-card-head">
            <div className="settings-card-title">Preferências</div>
            {saved && <div className="settings-saved">Salvo ✓</div>}
          </div>

          <div className="settings-form">
            <div className="settings-row">
              <div className="settings-field">
                <label>Idioma</label>
                <select
                  className="settings-select"
                  value={settings.idioma}
                  onChange={(e) => {
                    setSettings((s) => ({ ...s, idioma: e.target.value }));
                    handleSaveHint();
                  }}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              <div className="settings-field">
                <label>Densidade</label>
                <select
                  className="settings-select"
                  value={settings.densidade}
                  onChange={(e) => {
                    setSettings((s) => ({ ...s, densidade: e.target.value }));
                    handleSaveHint();
                  }}
                >
                  <option value="confortavel">Confortável</option>
                  <option value="compacta">Compacta</option>
                </select>
                <div className="settings-hint">
                  Compacta deixa cards e listas mais “fechados” e rápidos de ler.
                </div>
              </div>
            </div>

            <div className="settings-switch">
              <div className="settings-switch-text">
                <div className="settings-switch-title">Atalhos do teclado</div>
                <div className="settings-switch-sub">
                  Mantém habilitado recursos de produtividade (planejado).
                </div>
              </div>

              <button
                type="button"
                className={settings.atalhos ? "toggle on" : "toggle"}
                onClick={() => {
                  setSettings((s) => ({ ...s, atalhos: !s.atalhos }));
                  handleSaveHint();
                }}
                aria-pressed={settings.atalhos}
              >
                <span className="knob" />
              </button>
            </div>

            <div className="settings-footer">
              <button className="settings-btn" type="button" onClick={handleBack}>
                Voltar
              </button>

              <button className="settings-btn primary" type="button" onClick={handleSaveHint}>
                Ok
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
