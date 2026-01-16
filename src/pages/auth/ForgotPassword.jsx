import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./auth.css";
import "./forgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sent

  const emailValid = useMemo(() => {
    return /\S+@\S+\.\S+/.test(email.trim());
  }, [email]);

  function handleSubmit(e) {
    e.preventDefault();
    setStatus("sent");
  }

  return (
    <div className="fp-bg">
      <div className="fp-card">
        <div className="fp-head">
          <div className="fp-title">Recuperar senha</div>

          {/* Voltar sem splash */}
          <Link className="fp-back" to="/" state={{ skipSplash: true }}>
            Voltar
          </Link>
        </div>

        <p className="fp-desc">
          Digite seu e-mail. (Este projeto é só front-end, então o envio é simulado.)
        </p>

        {status === "sent" ? (
          <div className="fp-success">
            <p style={{ fontWeight: 700, marginBottom: 6 }}>
              Se esse e-mail existir, enviaremos um link de recuperação.
            </p>

            <p style={{ opacity: 0.75, fontSize: 12, marginBottom: 12 }}>
              (Simulação) Você pode voltar para o login.
            </p>

            <Link
              className="primary"
              to="/"
              state={{ skipSplash: true }}
              style={{
                display: "grid",
                placeItems: "center",
                height: 44,
                textDecoration: "none",
                marginTop: 6,
              }}
            >
              Voltar para login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fp-form">
            <label className="field" style={{ gap: 8 }}>
              <span className="label">E-mail</span>
              <input
                className="input"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <button className="primary" type="submit" disabled={!emailValid}>
              Enviar link (simulado)
            </button>

            <p className="fp-tip">
              Dica: sem backend, isso só mostra a mensagem de confirmação.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
