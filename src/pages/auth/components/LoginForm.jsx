import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import eyeOpen from "../../../assets/icons/eye-open.svg";
import eyeClosed from "../../../assets/icons/eye-closed.svg";
import googleIcon from "../../../assets/icons/google.svg";
import githubIcon from "../../../assets/icons/github.svg";

const USER_KEY = "taskflow_user_v1";
const ACCOUNT_KEY = "taskflow_account_v1";

export default function LoginForm({ tab, setTab }) {
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [error, setError] = useState("");

  function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }

    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) {
      setError("Nenhuma conta cadastrada.");
      return;
    }

    let account;
    try {
      account = JSON.parse(raw);
    } catch {
      setError("Erro ao ler cadastro.");
      return;
    }

    if (loginEmail.trim() !== account.email) {
      setError("E-mail não encontrado.");
      return;
    }

    if (loginPassword !== account.password) {
      setError("Senha incorreta.");
      return;
    }

    // Login válido
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        name: account.name,
        email: account.email,
        rememberMe,
      })
    );

    navigate("/dashboard", { replace: true });
  }

  return (
    <section
      className={`col ${tab === "login" ? "focus" : "dim"}`}
      onPointerDownCapture={() => setTab("login")}
      onFocusCapture={() => setTab("login")}
    >
      <form onSubmit={handleLoginSubmit} className="form login-form">
        {error && <span className="helper error-text">{error}</span>}

        <label className="field">
          <span className="label">Email</span>
          <input
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            type="email"
            placeholder="seuemail@exemplo.com"
            className="input"
          />
        </label>

        <label className="field">
          <span className="label">Senha</span>
          <div className="input-wrap">
            <input
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              type={showLoginPass ? "text" : "password"}
              placeholder="••••••••"
              className="input"
            />

            <button
              type="button"
              className="eye"
              onClick={() => setShowLoginPass((v) => !v)}
            >
              <img
                className="eye-icon"
                src={showLoginPass ? eyeOpen : eyeClosed}
                alt=""
              />
            </button>
          </div>
        </label>

        <div className="row">
          <label className="check">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Lembra de mim</span>
          </label>

          <Link to="/forgot-password" className="link">
            Esqueceu a senha?
          </Link>
        </div>

        <button className="primary" type="submit">
          Logar
        </button>

        <div className="after-primary-spacer" />

        <div className="divider">
          <span>ou continue com</span>
        </div>

        <div className="social">
          <button className="outline" type="button">
            <img className="social-icon" src={googleIcon} alt="" />
            Google
          </button>

          <button className="outline" type="button">
            <img className="social-icon" src={githubIcon} alt="" />
            GitHub
          </button>
        </div>
      </form>
    </section>
  );
}
