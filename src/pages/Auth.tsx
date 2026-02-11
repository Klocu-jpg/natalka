import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Mail, Lock, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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