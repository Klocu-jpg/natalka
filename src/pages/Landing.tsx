import { Heart, ShoppingCart, Calendar, UtensilsCrossed, Camera, PiggyBank, MessageCircleHeart, ListTodo, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: UtensilsCrossed, title: "Planer obiadów", desc: "Wspólnie planujcie posiłki na cały tydzień" },
  { icon: ShoppingCart, title: "Lista zakupów", desc: "Dodawajcie produkty w czasie rzeczywistym" },
  { icon: Calendar, title: "Wspólny kalendarz", desc: "Wszystkie ważne daty w jednym miejscu" },
  { icon: Camera, title: "Albumy zdjęć", desc: "Przechowujcie wspomnienia razem" },
  { icon: PiggyBank, title: "Cele oszczędnościowe", desc: "Odkładajcie na wspólne marzenia" },
  { icon: MessageCircleHeart, title: "Zaczepki", desc: "Wysyłajcie sobie słodkie wiadomości" },
  { icon: ListTodo, title: "Wspólne zadania", desc: "Dzielcie się obowiązkami" },
  { icon: Sparkles, title: "Pomysły na randki", desc: "Nigdy nie zabraknie inspiracji" },
];

const FAQ = [
  { q: "Czy mogę wypróbować za darmo?", a: "Tak! Oferujemy 7-dniowy darmowy okres próbny. Nie pobieramy opłat do końca okresu próbnego." },
  { q: "Jak połączyć się z partnerem?", a: "Po rejestracji otrzymasz unikalny kod zaproszenia. Wystarczy, że partner wpisze go w aplikacji." },
  { q: "Czy mogę anulować subskrypcję?", a: "Oczywiście! Możesz anulować w dowolnym momencie z poziomu ustawień." },
  { q: "Czy moje dane są bezpieczne?", a: "Tak. Wszystkie dane są szyfrowane i chronione. Szczegóły znajdziesz w naszej polityce prywatności." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 gradient-soft opacity-60" />
        <div className="relative mx-auto max-w-3xl text-center space-y-6">
          <div className="flex justify-center">
            <Heart className="w-16 h-16 text-primary animate-heart-beat" fill="currentColor" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary to-coral bg-clip-text text-transparent">
              Love App
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Wszystko, czego potrzebuje Wasza relacja — w jednej pięknej aplikacji. Planujcie, oszczędzajcie i twórzcie wspomnienia razem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-base">
              Rozpocznij za darmo <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              Zobacz cennik
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">7 dni za darmo · Bez karty kredytowej</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-4">
            Wszystko dla Waszej relacji
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Zarządzajcie wspólnym życiem łatwo i przyjemnie
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-md">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-4">
            Prosty cennik
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Jedna cena, wszystkie funkcje
          </p>

          <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border-2 border-primary">
            <div className="text-center space-y-2 mb-6">
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
                7 dni za darmo
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-heading font-bold">5 zł</span>
                <span className="text-muted-foreground">/ miesiąc</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Wszystkie widgety i funkcje",
                "Planer obiadów z AI",
                "Wspólne albumy zdjęć",
                "Cele oszczędnościowe",
                "Powiadomienia push",
                "Synchronizacja z partnerem",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full" size="lg" onClick={() => navigate("/auth")}>
              Wypróbuj za darmo
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Anuluj w dowolnym momencie
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-8">
            Najczęściej zadawane pytania
          </h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-card rounded-2xl p-5 shadow-card">
                <h3 className="font-heading font-semibold mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" fill="currentColor" />
            <span>Love App</span>
          </div>
          <div className="flex gap-4">
            <a href="/prawne/regulamin" className="hover:text-primary transition-colors">Regulamin</a>
            <a href="/prawne/polityka-prywatnosci" className="hover:text-primary transition-colors">Prywatność</a>
            <a href="/prawne/rodo" className="hover:text-primary transition-colors">RODO</a>
            <a href="/prawne/cookies" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
