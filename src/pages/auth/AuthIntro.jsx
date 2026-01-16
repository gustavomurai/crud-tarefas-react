import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import "./auth.css";
import "./authIntro.css";

import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";

import taskflowLogo from "../../assets/icons/taskflow.svg";

const SPLASH_SEEN_KEY = "taskflow_splash_seen_session";

// Detecta tipo de navegação (reload vs navegação normal).
function getNavType() {
  try {
    const nav = performance.getEntriesByType("navigation")?.[0];
    return nav?.type || "navigate";
  } catch {
    return "navigate";
  }
}

export default function AuthIntro() {
  const location = useLocation();

  const skipSplash = Boolean(location.state?.skipSplash);
  const forceSplash = Boolean(location.state?.forceSplash);

  const [tab, setTab] = useState("login");

  const navType = useMemo(() => getNavType(), []);
  const isReload = navType === "reload";

  const [stage, setStage] = useState(() => {
    if (skipSplash) return "auth";
    if (forceSplash) return "splash";
    if (isReload) return "splash";

    const alreadySeen = sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
    return alreadySeen ? "auth" : "splash";
  });

  const shouldAnimate = useMemo(() => stage === "splash", [stage]);

  useEffect(() => {
    if (!shouldAnimate) return;

    const t1 = setTimeout(() => setStage("morph"), 3000);
    const t2 = setTimeout(() => {
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
      setStage("auth");
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shouldAnimate]);

  return (
    <div className="intro-bg">
      <div className={`intro-card ${stage}`}>
        <div className="intro-header">
          <div className="intro-brand">
            <img className="intro-logo" src={taskflowLogo} alt="TaskFlow logo" />

            <div className="intro-title">
              <span className="intro-task">Task</span>
              <span className="intro-flow">Flow</span>
            </div>
          </div>

          <div className="intro-subtitle">Desenvolvido por Gustavo Murai</div>
        </div>

        <div className="intro-auth">
          <div className="auth-tabs">
            <button
              type="button"
              className={`tab ${tab === "login" ? "active" : ""}`}
              onClick={() => setTab("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={`tab ${tab === "signup" ? "active" : ""}`}
              onClick={() => setTab("signup")}
            >
              Cadastro
            </button>

            <div className="tab-underline">
              <div className={`tab-indicator ${tab}`} />
            </div>
          </div>

          <div className="auth-body">
            <LoginForm tab={tab} setTab={setTab} />
            <div className="v-divider" />
            <SignupForm tab={tab} setTab={setTab} />
          </div>
        </div>
      </div>

      {/* Pílula fixa (sempre visível nessa tela) */}
      <div className="intro-footer show">
        Projeto desenvolvido por <strong>Gustavo Murai</strong>
      </div>
    </div>
  );
}
