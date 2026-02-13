import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Mail, Lock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [settingNewPassword, setSettingNewPassword] = useState(false);
  const { signIn, signUp, signOut, resetPassword, updatePassword, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: {
        prompt: "select_account",
      },
    });
    if (error) {
      toast.error("Nie udało się zalogować przez Google");
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Hasło musi mieć minimum 6 znaków");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Hasła nie są identyczne");
      return;
    }
    setSettingNewPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error("Nie udało się ustawić nowego hasła: " + error.message);
      } else {
        toast.success("Hasło zostało zmienione! Zaloguj się nowym hasłem.");
        clearPasswordRecovery();
        await signOut();
        setNewPassword("");
        setConfirmNewPassword("");
        setIsLogin(true);
      }
    } finally {
      setSettingNewPassword(false);
    }
  };

  // Show set new password form (after clicking reset link in email)
  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-safe pb-safe">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8 animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-12 h-12 sm:w-10 sm:h-10 text-primary animate-heart-beat" fill="currentColor" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
              Love App
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Ustaw nowe hasło
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nowe hasło</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 rounded-xl border-2 focus:border-primary h-12 text-base"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Powtórz nowe hasło</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="pl-10 rounded-xl border-2 focus:border-primary h-12 text-base"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={settingNewPassword}>
                {settingNewPassword ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Ustaw nowe hasło"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.pick({ email: true }).safeParse({ email: forgotEmail });
    if (!validation.success) {
      toast.error("Podaj prawidłowy adres email");
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await resetPassword(forgotEmail);
      if (error) {
        toast.error("Nie udało się wysłać linku resetującego");
      } else {
        setResetSent(true);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error("Hasła nie są identyczne");
      return;
    }

    if (!isLogin && !accepted) {
      toast.error("Musisz zaakceptować regulamin i politykę prywatności");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Nieprawidłowy email lub hasło");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Potwierdź swój email przed zalogowaniem");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Zalogowano!");
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Ten email jest już zarejestrowany");
          } else {
            toast.error(error.message);
          }
        } else {
          setShowEmailConfirmation(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Show password reset confirmation
  if (resetSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-safe pb-safe">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl shadow-card p-8 animate-slide-up">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">Sprawdź swoją skrzynkę!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Wysłaliśmy link do resetowania hasła na <span className="font-medium text-foreground">{forgotEmail}</span>. 
              Kliknij w link, aby ustawić nowe hasło.
            </p>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => {
                setResetSent(false);
                setShowForgotPassword(false);
                setForgotEmail("");
              }}
            >
              Wróć do logowania
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-safe pb-safe">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8 animate-slide-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="w-12 h-12 sm:w-10 sm:h-10 text-primary animate-heart-beat" fill="currentColor" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
              Love App
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Resetuj swoje hasło
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="twoj@email.pl"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 rounded-xl border-2 focus:border-primary h-12 text-base"
                    required
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base" disabled={forgotLoading}>
                {forgotLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Wyślij link resetowania"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotEmail("");
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-4 inline-touch"
              >
                Wróć do logowania
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show email confirmation screen after signup
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-safe pb-safe">
        <div className="w-full max-w-md text-center">
          <div className="bg-card rounded-2xl shadow-card p-8 animate-slide-up">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-bold mb-2">Sprawdź swoją skrzynkę!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Wysłaliśmy link potwierdzający na <span className="font-medium text-foreground">{email}</span>. 
              Kliknij w link, aby aktywować konto i przejść do aplikacji.
            </p>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => {
                setShowEmailConfirmation(false);
                setIsLogin(true);
                setPassword("");
                setConfirmPassword("");
              }}
            >
              Wróć do logowania
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-safe pb-safe">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 sm:w-10 sm:h-10 text-primary animate-heart-beat" fill="currentColor" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
            Love App
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {isLogin ? "Witaj z powrotem!" : "Stwórz wspólne konto"}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="twoj@email.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-xl border-2 focus:border-primary h-12 text-base"
                  required
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hasło</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-xl border-2 focus:border-primary h-12 text-base"
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Powtórz hasło</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 rounded-xl border-2 focus:border-primary h-12 text-base"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-3 p-3 bg-secondary rounded-xl">
                <Checkbox
                  id="accept-terms"
                  checked={accepted}
                  onCheckedChange={(v) => setAccepted(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="accept-terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  Akceptuję{" "}
                  <Link to="/prawne/regulamin" className="text-primary underline underline-offset-2">regulamin</Link>
                  {" "}oraz{" "}
                  <Link to="/prawne/polityka-prywatnosci" className="text-primary underline underline-offset-2">politykę prywatności</Link>
                </label>
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Zapomniałem hasła
                </button>
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base" disabled={loading || (!isLogin && !accepted)}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Zaloguj się"
              ) : (
                "Zarejestruj się"
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">lub</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base gap-2"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Kontynuuj z Google
          </Button>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setConfirmPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-4 inline-touch"
            >
              {isLogin ? (
                <>Nie masz konta? <span className="text-primary font-medium">Zarejestruj się</span></>
              ) : (
                <>Masz już konto? <span className="text-primary font-medium">Zaloguj się</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;