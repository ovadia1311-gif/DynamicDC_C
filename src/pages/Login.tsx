
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Shield, User, Lock, LogIn, UserPlus } from "lucide-react";
import { useTranslation } from "../i18n/useTranslations";
import { useInspectionStore } from "../store/inspectionStore";
import LanguageToggle from "../components2/shared/LanguageToggle";
import { UserRole } from "../types/inspection";

export default function Login() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();

  const {
    initializeApp,
    getCurrentUser,
    isLoading,
    signUp,
    signIn,
    units,
    loadUnits,
  } = useInspectionStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [unitId, setUnitId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => { loadUnits().catch(() => void 0); }, [loadUnits]);

  useEffect(() => {
    (async () => {
      await initializeApp();
      const u = getCurrentUser();

      if (u) {
        if (u?.role?.trimEnd() === "inspector") navigate.push("/new-form");
        else navigate.push("/management-dashboard");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = () => {
    if (isRegistering) {
      if (!name.trim()) { setError("Name is required"); return false; }
      if (!unitId) { setError("Unit selection is required"); return false; }
    }
    if (!email.trim()) { setError("Email/Username is required"); return false; }
    if (!password) { setError("Password is required"); return false; }
    if (password.length < 3) { setError("Password must be at least 3 characters"); return false; }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      const u = useInspectionStore.getState().getCurrentUser();
      if (u?.role?.trimEnd() === "inspector") navigate.push("/new-form");
      else navigate.push("/management-dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid username or password";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSigningUp(true);
    setError(null);
    try {
      await signUp(email, password, name, unitId);
      const u = useInspectionStore.getState().getCurrentUser();
      if (u?.role.trimEnd() === 'inspector') navigate.push("/new-form");
      else navigate.push("/management-dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setIsSigningUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}>
              <LanguageToggle />
            </div>
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {isRegistering ? t.login.registerTitle : t.login.title}
            </h2>
            <p className="text-gray-600 text-lg">
              {isRegistering ? t.login.registerSubtitle : t.login.subtitle}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className={`text-sm text-red-700 ${isRTL ? "text-right" : "text-left"}`}>{error}</p>
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-8">
            {isRegistering && (
              <div>
                <label htmlFor="name" className={`block text-base font-semibold text-gray-700 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                  {t.login.nameLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? "right-0 pr-4" : "left-0 pl-4"} flex items-center pointer-events-none`}>
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`block w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isRTL ? "text-right" : "text-left"}`}
                    placeholder={t.login.namePlaceholder}
                    minLength={1}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className={`block text-base font-semibold text-gray-700 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                {t.login.emailLabel}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? "right-0 pr-4" : "left-0 pl-4"} flex items-center pointer-events-none`}>
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isRTL ? "text-right" : "text-left"}`}
                  placeholder={t.login.emailPlaceholder}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-base font-semibold text-gray-700 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                {t.login.passwordLabel}
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRTL ? "right-0 pr-4" : "left-0 pl-4"} flex items-center pointer-events-none`}>
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={3}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full ${isRTL ? "pr-12 pl-4" : "pl-12 pr-4"} py-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isRTL ? "text-right" : "text-left"}`}
                  placeholder={t.login.passwordPlaceholder}
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="unit" className={`block text-base font-semibold text-gray-700 mb-3 ${isRTL ? "text-right" : "text-left"}`}>
                  {t.login.unitLabel}
                </label>
                <select
                  id="unit"
                  name="unit"
                  required
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className={`block w-full py-4 px-4 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${isRTL ? "text-right" : "text-left"}`}
                >
                  <option value="">{t.login.selectUnit}</option>
                  {units.map((unit) => (
                    <option key={(unit as any).id} value={(unit as any).id}>
                      {(unit as any).name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isSigningUp}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl active:scale-95"
            >
              {(isSubmitting || isSigningUp) ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  {isRegistering ? t.login.signingUp : t.login.signingIn}
                </>
              ) : (
                <>
                  {isRegistering
                    ? <UserPlus className={`h-6 w-6 ${isRTL ? "ml-3" : "mr-3"} flex-shrink-0`} />
                    : <LogIn className={`h-6 w-6 ${isRTL ? "ml-3" : "mr-3"} flex-shrink-0`} />}
                  {isRegistering ? t.login.signUp : t.login.signIn}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
                setEmail("");
                setPassword("");
                setName("");
                setUnitId("");
              }}
              className="text-blue-600 hover:text-blue-800 text-base font-semibold transition-colors duration-200"
            >
              {isRegistering ? t.login.backToLogin : t.login.createAccount}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">{t.login.systemTitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
