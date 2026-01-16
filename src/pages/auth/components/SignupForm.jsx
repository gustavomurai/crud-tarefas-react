import { useMemo, useState } from "react";

import eyeOpen from "../../../assets/icons/eye-open.svg";
import eyeClosed from "../../../assets/icons/eye-closed.svg";

const ACCOUNT_KEY = "taskflow_account_v1";

export default function SignupForm({ tab, setTab }) {
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const signupPasswordMismatch = useMemo(() => {
    if (!signupConfirm) return false;
    return signupPassword !== signupConfirm;
  }, [signupPassword, signupConfirm]);

  function handleSignupSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Informe seu nome completo.");
      return;
    }

    if (!signupEmail.trim()) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (signupPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (signupPasswordMismatch) {
      setError("As senhas não conferem.");
      return;
    }

    localStorage.setItem(
      ACCOUNT_KEY,
      JSON.stringify({
        name: fullName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        createdAt: Date.now(),
      })
    );

    setSuccess("Usuário cadastrado com sucesso. Faça login.");
  }

  return (
    <section
      className={`col ${tab === "signup" ? "focus" : "dim"}`}
      onPointerDownCapture={() => setTab("signup")}
      onFocusCapture={() => setTab("signup")}
    >
      <form onSubmit={handleSignupSubmit} className="form">
        {error && <span className="helper error-text">{error}</span>}
        {success && <span className="helper success-text">{success}</span>}

        <label className="field">
          <span className="label">Nome Completo</span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            placeholder="Seu nome"
            className="input"
          />
        </label>

        <label className="field">
          <span className="label">E-mail</span>
          <input
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
            type="email"
            placeholder="seuemail@exemplo.com"
            className="input"
          />
        </label>

        <label className="field">
          <span className="label">Senha</span>
          <div className="input-wrap">
            <input
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              type={showSignupPass ? "text" : "password"}
              placeholder="••••••••"
              className="input"
            />

            <button
              type="button"
              className="eye"
              onClick={() => setShowSignupPass((v) => !v)}
            >
              <img
                className="eye-icon"
                src={showSignupPass ? eyeOpen : eyeClosed}
                alt=""
              />
            </button>
          </div>
        </label>

        <label className="field">
          <span className="label">Confirma senha</span>
          <div className="input-wrap">
            <input
              value={signupConfirm}
              onChange={(e) => setSignupConfirm(e.target.value)}
              type={showSignupConfirm ? "text" : "password"}
              placeholder="••••••••"
              className={`input ${signupPasswordMismatch ? "error" : ""}`}
            />

            <button
              type="button"
              className="eye"
              onClick={() => setShowSignupConfirm((v) => !v)}
            >
              <img
                className="eye-icon"
                src={showSignupConfirm ? eyeOpen : eyeClosed}
                alt=""
              />
            </button>
          </div>

          {signupPasswordMismatch && (
            <span className="helper error-text">As senhas não conferem.</span>
          )}
        </label>

        <button className="primary" type="submit">
          Criar conta
        </button>
      </form>
    </section>
  );
}
