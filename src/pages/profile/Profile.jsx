import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

import { applyDensityFromSettings } from "../dashboard/taskUtils";

const USER_KEY = "taskflow_user_v1";
const ACCOUNT_KEY = "taskflow_account_v1";

export default function Profile() {
  const navigate = useNavigate();

  useEffect(() => {
    applyDensityFromSettings();
  }, []);

  const user = useMemo(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!user) navigate("/", { replace: true, state: { skipSplash: true } });
  }, [user, navigate]);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) return null;

  function readAccount() {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function writeAccount(next) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(next));
  }

  function writeUser(next) {
    localStorage.setItem(USER_KEY, JSON.stringify(next));
  }

  function handleCancel() {
    navigate("/dashboard", { replace: true });
  }

  function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("O nome não pode ficar vazio.");
      return;
    }

    if (!email.trim()) {
      setError("O e-mail não pode ficar vazio.");
      return;
    }

    const account = readAccount();
    if (!account) {
      setError("Nenhuma conta cadastrada para atualizar.");
      return;
    }

    const wantsPasswordChange = currentPass.trim() || newPass.trim() || confirmPass.trim();

    if (wantsPasswordChange) {
      if (!currentPass) {
        setError("Informe sua senha atual para alterar a senha.");
        return;
      }

      if (currentPass !== account.password) {
        setError("Senha atual incorreta.");
        return;
      }

      if (newPass.length < 6) {
        setError("A nova senha deve ter no mínimo 6 caracteres.");
        return;
      }

      if (newPass !== confirmPass) {
        setError("A confirmação da nova senha não confere.");
        return;
      }
    }

    const nextAccount = {
      ...account,
      name: name.trim(),
      email: email.trim(),
      password: wantsPasswordChange ? newPass : account.password,
      updatedAt: Date.now(),
    };

    writeAccount(nextAccount);

    const nextUser = {
      ...user,
      name: nextAccount.name,
      email: nextAccount.email,
    };

    writeUser(nextUser);

    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");

    setSuccess("Alterações salvas com sucesso.");
  }

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <div className="profile-title-wrap">
          <div className="profile-title">Perfil</div>
          <div className="profile-subtitle">Atualize suas informações de conta.</div>
        </div>

        <button className="profile-back" onClick={handleCancel} type="button">
          Voltar
        </button>
      </header>

      <main className="profile-content">
        <section className="profile-card">
          <div className="profile-card-head">
            <div className="profile-avatar" aria-hidden="true">
              {(name || "U")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0].toUpperCase())
                .join("")}
            </div>

            <div className="profile-head-texts">
              <div className="profile-head-name">{name || "User"}</div>
              <div className="profile-head-email">{email || "—"}</div>
            </div>
          </div>

          <div className="profile-divider" />

          <form className="profile-form" onSubmit={handleSave}>
            {error && <div className="profile-feedback error">{error}</div>}
            {success && <div className="profile-feedback success">{success}</div>}

            <div className="profile-grid">
              <label className="profile-field">
                <span className="profile-label">Nome</span>
                <input
                  className="profile-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">E-mail</span>
                <input
                  className="profile-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                />
              </label>
            </div>

            <div className="profile-section-title">Alterar senha</div>

            <div className="profile-grid">
              <label className="profile-field">
                <span className="profile-label">Senha atual</span>
                <input
                  className="profile-input"
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">Nova senha</span>
                <input
                  className="profile-input"
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                />
              </label>

              <label className="profile-field">
                <span className="profile-label">Confirmar nova senha</span>
                <input
                  className="profile-input"
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="repita a nova senha"
                />
              </label>
            </div>

            <div className="profile-footer">
              <button className="profile-btn" type="button" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="profile-btn primary" type="submit">
                Salvar alterações
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
