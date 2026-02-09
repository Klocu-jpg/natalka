import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Cookie, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APP_NAME = "Love App";
const APP_URL = "natalka.lovable.app";
const CONTACT_EMAIL = "kontakt@loveapp.pl";
const LAST_UPDATED = "9 lutego 2026";

/* ── Reusable styled components for legal content ── */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-base font-heading font-bold text-foreground">{title}</h2>
    <div className="text-sm leading-relaxed text-muted-foreground space-y-2">{children}</div>
  </section>
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-card rounded-2xl border border-border/50 p-4 shadow-sm", className)}>
    {children}
  </div>
);

const BulletList = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="space-y-2 pl-1">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const InfoTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="rounded-xl border border-border/50 overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-secondary/70">
          {headers.map((h, i) => (
            <th key={i} className="text-left p-3 font-medium text-foreground text-xs">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
            {row.map((cell, j) => (
              <td key={j} className="p-3 text-muted-foreground text-xs leading-relaxed">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center pb-2">
    <h1 className="text-xl font-heading font-bold text-foreground">{title}</h1>
    <p className="text-xs text-muted-foreground mt-1">Aktualizacja: {subtitle}</p>
  </div>
);

/* ── Privacy Policy ── */

const PrivacyPolicy = () => (
  <div className="space-y-5">
    <PageHeader title="Polityka Prywatności" subtitle={LAST_UPDATED} />

    <Card>
      <Section title="1. Administrator danych">
        <p>
          Administratorem Twoich danych osobowych jest {APP_NAME}, dostępna pod adresem {APP_URL}.
          Kontakt: {CONTACT_EMAIL}.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="2. Jakie dane zbieramy">
        <BulletList items={[
          <><strong>Dane konta</strong> — adres e-mail i zaszyfrowane hasło.</>,
          <><strong>Dane profilu</strong> — płeć (opcjonalnie), do personalizacji funkcji.</>,
          <><strong>Dane o parze</strong> — kod zaproszenia i identyfikator pary.</>,
          <><strong>Treści użytkownika</strong> — listy zakupów, zadania, notatki, plany posiłków, przepisy, wydarzenia, wydatki, cele oszczędnościowe, zdjęcia, odliczania, zaczepki, dane cyklu.</>,
          <><strong>Dane techniczne</strong> — subskrypcje powiadomień push.</>,
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="3. Cel przetwarzania danych">
        <BulletList items={[
          "Świadczenie usług — zarządzanie kontem, synchronizacja danych między partnerami.",
          "Personalizacja — dostosowanie widgetów i funkcji do preferencji.",
          "Komunikacja — powiadomienia push o aktywnościach partnera (za Twoją zgodą).",
          "Bezpieczeństwo — ochrona konta i zapobieganie nieautoryzowanemu dostępowi.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="4. Podstawa prawna">
        <InfoTable
          headers={["Podstawa", "Zakres"]}
          rows={[
            ["Art. 6 ust. 1 lit. b) RODO", "Wykonanie umowy — świadczenie usług aplikacji"],
            ["Art. 6 ust. 1 lit. a) RODO", "Zgoda — powiadomienia push, udostępnianie danych cyklu"],
            ["Art. 6 ust. 1 lit. f) RODO", "Uzasadniony interes — bezpieczeństwo, analityka"],
          ]}
        />
      </Section>
    </Card>

    <Card>
      <Section title="5. Udostępnianie danych">
        <BulletList items={[
          "Twojemu połączonemu partnerowi — współdzielone treści.",
          "Dostawcom usług technicznych — hosting i przechowywanie plików.",
        ]} />
        <p className="font-medium text-foreground text-xs mt-2">
          Nie sprzedajemy ani nie udostępniamy danych podmiotom trzecim w celach marketingowych.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="6. Okres przechowywania">
        <p>
          Dane przechowujemy tak długo, jak korzystasz z aplikacji. Po usunięciu konta dane zostaną
          trwale usunięte w ciągu 30 dni.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="7. Twoje prawa">
        <BulletList items={[
          "Dostęp do swoich danych i uzyskanie ich kopii.",
          "Sprostowanie nieprawidłowych danych.",
          "Usunięcie danych (\"prawo do bycia zapomnianym\").",
          "Ograniczenie przetwarzania.",
          "Przenoszenie danych.",
          "Wycofanie zgody w dowolnym momencie.",
          "Wniesienie skargi do Prezesa UODO.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="8. Bezpieczeństwo">
        <p>
          Stosujemy szyfrowanie haseł, połączenia HTTPS, polityki dostępu (RLS) na poziomie bazy danych
          oraz regularne kopie zapasowe.
        </p>
      </Section>
    </Card>

    <Card className="bg-secondary/50 border-primary/20">
      <Section title="9. Kontakt">
        <p>W sprawach dotyczących prywatności: <strong>{CONTACT_EMAIL}</strong></p>
      </Section>
    </Card>
  </div>
);

/* ── Terms of Service ── */

const TermsOfService = () => (
  <div className="space-y-5">
    <PageHeader title="Regulamin" subtitle={LAST_UPDATED} />

    <Card>
      <Section title="1. Postanowienia ogólne">
        <p>
          Regulamin określa zasady korzystania z aplikacji {APP_NAME} ({APP_URL}).
          Korzystanie z aplikacji oznacza akceptację regulaminu.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="2. Definicje">
        <BulletList items={[
          <><strong>Aplikacja</strong> — serwis {APP_NAME} dostępny jako progresywna aplikacja webowa (PWA).</>,
          <><strong>Użytkownik</strong> — osoba korzystająca z aplikacji po utworzeniu konta.</>,
          <><strong>Para</strong> — dwóch użytkowników połączonych kodem zaproszenia.</>,
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="3. Rejestracja i konto">
        <BulletList items={[
          "Do korzystania wymagane jest konto (e-mail + hasło).",
          "Użytkownik zobowiązuje się podać prawdziwy adres e-mail.",
          "Użytkownik odpowiada za poufność hasła.",
          "Jedno konto może być przypisane do jednej pary.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="4. Zasady korzystania">
        <BulletList items={[
          "Korzystanie z aplikacji zgodnie z jej przeznaczeniem.",
          "Niepodejmowanie działań zakłócających działanie aplikacji.",
          "Nieumieszczanie treści niezgodnych z prawem.",
          "Niestosowanie aplikacji w celach komercyjnych bez zgody.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="5. Funkcje aplikacji">
        <BulletList items={[
          "Wspólne listy zakupów i zadań.",
          "Planowanie posiłków z generowaniem przepisów.",
          "Śledzenie wydatków i celów oszczędnościowych.",
          "Kalendarz, odliczanie, albumy zdjęć, notatki.",
          "Powiadomienia push o aktywnościach partnera.",
          "Śledzenie cyklu menstruacyjnego (opcjonalne).",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="6. Treści użytkownika">
        <p>
          Użytkownik zachowuje pełne prawa do swoich treści. Administrator może usunąć treści
          naruszające regulamin.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="7. Dostępność i odpowiedzialność">
        <BulletList items={[
          "Aplikacja udostępniana \"takim, jakim jest\" (as is).",
          "Administrator nie gwarantuje ciągłej dostępności.",
          "Administrator nie ponosi odpowiedzialności za utratę danych wynikającą z działania użytkownika.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="8. Usunięcie konta">
        <p>
          Kontakt pod adresem {CONTACT_EMAIL}. Usunięcie konta skutkuje trwałym usunięciem
          wszystkich danych.
        </p>
      </Section>
    </Card>

    <Card className="bg-secondary/50 border-primary/20">
      <Section title="9. Kontakt">
        <p>Pytania dotyczące regulaminu: <strong>{CONTACT_EMAIL}</strong></p>
      </Section>
    </Card>
  </div>
);

/* ── RODO Clause ── */

const RodoClause = () => (
  <div className="space-y-5">
    <PageHeader title="Klauzula informacyjna RODO" subtitle={LAST_UPDATED} />

    <Card className="bg-primary/5 border-primary/20">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Zgodnie z art. 13 ust. 1 i 2 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679
        z dnia 27 kwietnia 2016 r. (RODO), informujemy:
      </p>
    </Card>

    <Card>
      <Section title="1. Administrator danych">
        <p>Administrator: {APP_NAME}, kontakt: {CONTACT_EMAIL}.</p>
      </Section>
    </Card>

    <Card>
      <Section title="2. Cele i podstawy przetwarzania">
        <InfoTable
          headers={["Cel", "Podstawa prawna"]}
          rows={[
            ["Rejestracja i obsługa konta", "Art. 6 ust. 1 lit. b) — umowa"],
            ["Synchronizacja danych w parze", "Art. 6 ust. 1 lit. b) — umowa"],
            ["Powiadomienia push", "Art. 6 ust. 1 lit. a) — zgoda"],
            ["Udostępnianie danych cyklu", "Art. 6 ust. 1 lit. a) — zgoda"],
            ["Bezpieczeństwo aplikacji", "Art. 6 ust. 1 lit. f) — uzasadniony interes"],
          ]}
        />
      </Section>
    </Card>

    <Card>
      <Section title="3. Odbiorcy danych">
        <BulletList items={[
          "Połączony partner (współdzielone treści).",
          "Dostawcy infrastruktury technicznej (hosting, baza danych).",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="4. Przekazywanie danych">
        <p>
          Dane mogą być przetwarzane w UE lub w państwach z odpowiednim poziomem ochrony
          (decyzja adekwatności KE lub standardowe klauzule umowne).
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="5. Okres przechowywania">
        <InfoTable
          headers={["Dane", "Okres"]}
          rows={[
            ["Dane konta", "Do usunięcia konta"],
            ["Treści użytkownika", "Do usunięcia przez użytkownika"],
            ["Logi techniczne", "Do 90 dni"],
          ]}
        />
      </Section>
    </Card>

    <Card>
      <Section title="6. Twoje prawa">
        <BulletList items={[
          "Dostęp do danych (art. 15 RODO).",
          "Sprostowanie danych (art. 16 RODO).",
          "Usunięcie danych (art. 17 RODO).",
          "Ograniczenie przetwarzania (art. 18 RODO).",
          "Przenoszenie danych (art. 20 RODO).",
          "Sprzeciw wobec przetwarzania (art. 21 RODO).",
          "Wycofanie zgody (art. 7 ust. 3 RODO).",
          "Skarga do PUODO — ul. Stawki 2, 00-193 Warszawa.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="7. Dobrowolność podania danych">
        <p>
          E-mail i hasło są niezbędne do korzystania z aplikacji.
          Pozostałe dane (płeć, dane cyklu) są dobrowolne.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="8. Zautomatyzowane decyzje">
        <p>Nie stosujemy zautomatyzowanego podejmowania decyzji ani profilowania (art. 22 RODO).</p>
      </Section>
    </Card>
  </div>
);

/* ── Cookies Policy ── */

const CookiesPolicy = () => (
  <div className="space-y-5">
    <PageHeader title="Polityka Cookies" subtitle={LAST_UPDATED} />

    <Card>
      <Section title="1. Czym są pliki cookies">
        <p>
          Pliki cookies to małe pliki tekstowe zapisywane na Twoim urządzeniu.
          Służą do zapamiętywania preferencji i zapewnienia prawidłowego działania aplikacji.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="2. Jakich cookies używamy">
        <InfoTable
          headers={["Rodzaj", "Cel", "Czas"]}
          rows={[
            ["Niezbędne", "Uwierzytelnianie i sesja logowania", "Do zamknięcia przeglądarki"],
            ["Funkcjonalne", "Preferencje widgetów, powiadomień, motywu", "Do 1 roku"],
            ["Local Storage", "Token uwierzytelniania, preferencje UI, stan PWA", "Do usunięcia ręcznego"],
          ]}
        />
      </Section>
    </Card>

    <Card>
      <Section title="3. Cookies podmiotów trzecich">
        <p>
          Aplikacja nie wykorzystuje cookies reklamowych ani śledzących.
          Jedyne cookies zewnętrzne mogą pochodzić od dostawcy hostingu i służą celom technicznym.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="4. Zarządzanie cookies">
        <p>Możesz zarządzać cookies w ustawieniach przeglądarki:</p>
        <BulletList items={[
          "Chrome: Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie",
          "Firefox: Ustawienia → Prywatność i bezpieczeństwo → Ciasteczka",
          "Safari: Preferencje → Prywatność → Zarządzaj danymi witryn",
        ]} />
        <p className="text-xs mt-2">Wyłączenie cookies niezbędnych może uniemożliwić logowanie.</p>
      </Section>
    </Card>

    <Card className="bg-secondary/50 border-primary/20">
      <Section title="5. Kontakt">
        <p>Pytania dotyczące cookies: <strong>{CONTACT_EMAIL}</strong></p>
      </Section>
    </Card>
  </div>
);

/* ── Page registry ── */

const LEGAL_PAGES: Record<string, { title: string; icon: React.ReactNode; component: React.FC }> = {
  "polityka-prywatnosci": {
    title: "Polityka Prywatności",
    icon: <Shield className="w-5 h-5" />,
    component: PrivacyPolicy,
  },
  "regulamin": {
    title: "Regulamin",
    icon: <FileText className="w-5 h-5" />,
    component: TermsOfService,
  },
  "rodo": {
    title: "Klauzula RODO",
    icon: <Scale className="w-5 h-5" />,
    component: RodoClause,
  },
  "cookies": {
    title: "Polityka Cookies",
    icon: <Cookie className="w-5 h-5" />,
    component: CookiesPolicy,
  },
};

/* ── Main layout ── */

const Legal = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const page = slug ? LEGAL_PAGES[slug] : null;

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nie znaleziono strony</p>
          <Button onClick={() => navigate(-1)}>Wróć</Button>
        </div>
      </div>
    );
  }

  const PageComponent = page.component;

  return (
    <div className="min-h-screen bg-background pt-safe pb-safe">
      <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-xl border-b border-border/30 pt-safe shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 shrink-0 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-primary">{page.icon}</span>
            <h1 className="text-lg font-heading font-bold truncate">{page.title}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-6 pb-16">
        <PageComponent />
      </main>
    </div>
  );
};

export default Legal;
