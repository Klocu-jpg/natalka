import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Cookie, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const APP_NAME = "Love App";
const APP_URL = "natalka.lovable.app";
const CONTACT_EMAIL = "kontakt@loveapp.pl";
const LAST_UPDATED = "9 lutego 2026";

const PrivacyPolicy = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h1>Polityka Prywatności</h1>
    <p className="text-muted-foreground">Ostatnia aktualizacja: {LAST_UPDATED}</p>

    <h2>1. Administrator danych</h2>
    <p>
      Administratorem Twoich danych osobowych jest {APP_NAME}, dostępna pod adresem {APP_URL}.
      W sprawach związanych z ochroną danych możesz kontaktować się pod adresem: {CONTACT_EMAIL}.
    </p>

    <h2>2. Jakie dane zbieramy</h2>
    <p>W ramach korzystania z aplikacji przetwarzamy następujące dane:</p>
    <ul>
      <li><strong>Dane konta</strong> — adres e-mail i zaszyfrowane hasło, niezbędne do rejestracji i logowania.</li>
      <li><strong>Dane profilu</strong> — płeć (opcjonalnie), wykorzystywana do personalizacji funkcji aplikacji.</li>
      <li><strong>Dane o parze</strong> — kod zaproszenia i identyfikator pary, służące do łączenia kont partnerów.</li>
      <li><strong>Treści użytkownika</strong> — listy zakupów, zadania, notatki, plany posiłków, przepisy, wydarzenia kalendarzowe, wydatki, cele oszczędnościowe, zdjęcia, odliczania, zaczepki oraz dane cyklu menstruacyjnego (jeśli dotyczy).</li>
      <li><strong>Dane techniczne</strong> — subskrypcje powiadomień push (endpoint, klucze szyfrowania).</li>
    </ul>

    <h2>3. Cel przetwarzania danych</h2>
    <p>Twoje dane przetwarzamy w celu:</p>
    <ul>
      <li>Świadczenia usług aplikacji — zarządzanie kontem, synchronizacja danych między partnerami.</li>
      <li>Personalizacji — dostosowanie widgetów i funkcji do Twoich preferencji.</li>
      <li>Komunikacji — wysyłanie powiadomień push o aktywnościach partnera (za Twoją zgodą).</li>
      <li>Bezpieczeństwa — ochrona konta i zapobieganie nieautoryzowanemu dostępowi.</li>
    </ul>

    <h2>4. Podstawa prawna przetwarzania</h2>
    <ul>
      <li><strong>Art. 6 ust. 1 lit. b) RODO</strong> — przetwarzanie niezbędne do wykonania umowy (świadczenie usług aplikacji).</li>
      <li><strong>Art. 6 ust. 1 lit. a) RODO</strong> — zgoda użytkownika (powiadomienia push, udostępnianie danych cyklu partnerowi).</li>
      <li><strong>Art. 6 ust. 1 lit. f) RODO</strong> — prawnie uzasadniony interes administratora (bezpieczeństwo, analityka).</li>
    </ul>

    <h2>5. Udostępnianie danych</h2>
    <p>
      Twoje dane mogą być udostępniane wyłącznie:
    </p>
    <ul>
      <li>Twojemu połączonemu partnerowi — w zakresie wspólnych list, planów, wydatków i innych współdzielonych treści.</li>
      <li>Dostawcom usług technicznych — hosting (Supabase/Lovable Cloud), przechowywanie plików.</li>
    </ul>
    <p>Nie sprzedajemy, nie wynajmujemy i nie udostępniamy Twoich danych podmiotom trzecim w celach marketingowych.</p>

    <h2>6. Okres przechowywania</h2>
    <p>
      Dane przechowujemy tak długo, jak korzystasz z aplikacji. Po usunięciu konta dane zostaną trwale usunięte
      w ciągu 30 dni, z wyjątkiem danych, które jesteśmy zobowiązani przechowywać na mocy obowiązujących przepisów.
    </p>

    <h2>7. Twoje prawa</h2>
    <p>Masz prawo do:</p>
    <ul>
      <li>Dostępu do swoich danych i uzyskania ich kopii.</li>
      <li>Sprostowania nieprawidłowych danych.</li>
      <li>Usunięcia danych ("prawo do bycia zapomnianym").</li>
      <li>Ograniczenia przetwarzania.</li>
      <li>Przenoszenia danych.</li>
      <li>Wycofania zgody w dowolnym momencie.</li>
      <li>Wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).</li>
    </ul>

    <h2>8. Bezpieczeństwo</h2>
    <p>
      Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony danych, w tym szyfrowanie haseł,
      bezpieczne połączenia HTTPS, polityki dostępu (RLS) na poziomie bazy danych oraz regularne kopie zapasowe.
    </p>

    <h2>9. Kontakt</h2>
    <p>W sprawach dotyczących prywatności skontaktuj się z nami: {CONTACT_EMAIL}.</p>
  </div>
);

const TermsOfService = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h1>Regulamin</h1>
    <p className="text-muted-foreground">Ostatnia aktualizacja: {LAST_UPDATED}</p>

    <h2>1. Postanowienia ogólne</h2>
    <p>
      Niniejszy regulamin określa zasady korzystania z aplikacji {APP_NAME} dostępnej pod adresem {APP_URL}.
      Korzystanie z aplikacji oznacza akceptację niniejszego regulaminu.
    </p>

    <h2>2. Definicje</h2>
    <ul>
      <li><strong>Aplikacja</strong> — serwis internetowy {APP_NAME} dostępny jako progresywna aplikacja webowa (PWA).</li>
      <li><strong>Użytkownik</strong> — osoba fizyczna korzystająca z aplikacji po utworzeniu konta.</li>
      <li><strong>Para</strong> — dwóch użytkowników połączonych kodem zaproszenia w ramach aplikacji.</li>
    </ul>

    <h2>3. Rejestracja i konto</h2>
    <ul>
      <li>Do korzystania z aplikacji wymagane jest utworzenie konta za pomocą adresu e-mail i hasła.</li>
      <li>Użytkownik zobowiązuje się podać prawdziwy adres e-mail.</li>
      <li>Użytkownik odpowiada za poufność swojego hasła.</li>
      <li>Jedno konto może być przypisane wyłącznie do jednej pary.</li>
    </ul>

    <h2>4. Zasady korzystania</h2>
    <p>Użytkownik zobowiązuje się do:</p>
    <ul>
      <li>Korzystania z aplikacji zgodnie z jej przeznaczeniem.</li>
      <li>Niepodejmowania działań mogących zakłócić działanie aplikacji.</li>
      <li>Nieumieszczania treści niezgodnych z prawem lub naruszających prawa osób trzecich.</li>
      <li>Niestosowania aplikacji w celach komercyjnych bez zgody administratora.</li>
    </ul>

    <h2>5. Funkcje aplikacji</h2>
    <p>Aplikacja udostępnia m.in. następujące funkcje:</p>
    <ul>
      <li>Wspólne listy zakupów i zadań.</li>
      <li>Planowanie posiłków z generowaniem przepisów.</li>
      <li>Śledzenie wydatków i celów oszczędnościowych.</li>
      <li>Kalendarz wydarzeń i odliczanie do ważnych dat.</li>
      <li>Albumy zdjęć i notatki.</li>
      <li>Powiadomienia push o aktywnościach partnera.</li>
      <li>Śledzenie cyklu menstruacyjnego (funkcja opcjonalna).</li>
    </ul>

    <h2>6. Treści użytkownika</h2>
    <p>
      Użytkownik zachowuje pełne prawa do treści, które umieszcza w aplikacji.
      Administrator nie rości sobie praw do tych treści, ale zastrzega sobie prawo do ich usunięcia
      w przypadku naruszenia regulaminu.
    </p>

    <h2>7. Dostępność usługi</h2>
    <p>
      Administrator dokłada starań, aby aplikacja była dostępna nieprzerwanie, jednak nie gwarantuje
      jej ciągłej dostępności. Przerwy mogą wynikać z prac konserwacyjnych lub awarii.
    </p>

    <h2>8. Odpowiedzialność</h2>
    <ul>
      <li>Aplikacja jest udostępniana w stanie "takim, jakim jest" (as is).</li>
      <li>Administrator nie ponosi odpowiedzialności za utratę danych wynikającą z działania użytkownika.</li>
      <li>Administrator nie odpowiada za treści umieszczane przez użytkowników.</li>
    </ul>

    <h2>9. Usunięcie konta</h2>
    <p>
      Użytkownik może w dowolnym momencie zażądać usunięcia konta, kontaktując się pod adresem {CONTACT_EMAIL}.
      Usunięcie konta skutkuje trwałym usunięciem wszystkich danych użytkownika.
    </p>

    <h2>10. Zmiany regulaminu</h2>
    <p>
      Administrator zastrzega sobie prawo do zmiany regulaminu. O istotnych zmianach użytkownicy
      zostaną poinformowani za pośrednictwem aplikacji.
    </p>

    <h2>11. Kontakt</h2>
    <p>Pytania dotyczące regulaminu: {CONTACT_EMAIL}.</p>
  </div>
);

const RodoClause = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h1>Klauzula informacyjna RODO</h1>
    <p className="text-muted-foreground">Ostatnia aktualizacja: {LAST_UPDATED}</p>

    <p>
      Zgodnie z art. 13 ust. 1 i 2 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679
      z dnia 27 kwietnia 2016 r. (RODO), informujemy:
    </p>

    <h2>1. Administrator danych</h2>
    <p>Administratorem Twoich danych osobowych jest {APP_NAME}, kontakt: {CONTACT_EMAIL}.</p>

    <h2>2. Cele i podstawy przetwarzania</h2>
    <table>
      <thead>
        <tr>
          <th>Cel przetwarzania</th>
          <th>Podstawa prawna</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Rejestracja i obsługa konta</td>
          <td>Art. 6 ust. 1 lit. b) — wykonanie umowy</td>
        </tr>
        <tr>
          <td>Synchronizacja danych w parze</td>
          <td>Art. 6 ust. 1 lit. b) — wykonanie umowy</td>
        </tr>
        <tr>
          <td>Powiadomienia push</td>
          <td>Art. 6 ust. 1 lit. a) — zgoda</td>
        </tr>
        <tr>
          <td>Udostępnianie danych cyklu</td>
          <td>Art. 6 ust. 1 lit. a) — zgoda</td>
        </tr>
        <tr>
          <td>Bezpieczeństwo aplikacji</td>
          <td>Art. 6 ust. 1 lit. f) — uzasadniony interes</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Odbiorcy danych</h2>
    <ul>
      <li>Połączony partner (w zakresie współdzielonych treści).</li>
      <li>Dostawcy infrastruktury technicznej (hosting, baza danych).</li>
    </ul>

    <h2>4. Przekazywanie danych do państw trzecich</h2>
    <p>
      Dane mogą być przetwarzane na serwerach zlokalizowanych w Unii Europejskiej lub w państwach
      zapewniających odpowiedni poziom ochrony danych (decyzja adekwatności Komisji Europejskiej)
      bądź na podstawie standardowych klauzul umownych.
    </p>

    <h2>5. Okres przechowywania</h2>
    <ul>
      <li>Dane konta — do momentu usunięcia konta przez użytkownika.</li>
      <li>Treści użytkownika — do momentu usunięcia przez użytkownika lub usunięcia konta.</li>
      <li>Logi techniczne — do 90 dni.</li>
    </ul>

    <h2>6. Twoje prawa</h2>
    <p>Przysługuje Ci prawo do:</p>
    <ul>
      <li>Dostępu do danych (art. 15 RODO).</li>
      <li>Sprostowania danych (art. 16 RODO).</li>
      <li>Usunięcia danych (art. 17 RODO).</li>
      <li>Ograniczenia przetwarzania (art. 18 RODO).</li>
      <li>Przenoszenia danych (art. 20 RODO).</li>
      <li>Sprzeciwu wobec przetwarzania (art. 21 RODO).</li>
      <li>Wycofania zgody w dowolnym momencie (art. 7 ust. 3 RODO).</li>
      <li>Wniesienia skargi do organu nadzorczego — Prezesa UODO, ul. Stawki 2, 00-193 Warszawa.</li>
    </ul>

    <h2>7. Dobrowolność podania danych</h2>
    <p>
      Podanie adresu e-mail i hasła jest niezbędne do utworzenia konta i korzystania z aplikacji.
      Podanie pozostałych danych (płeć, dane cyklu) jest dobrowolne.
    </p>

    <h2>8. Zautomatyzowane podejmowanie decyzji</h2>
    <p>
      W ramach aplikacji nie stosujemy zautomatyzowanego podejmowania decyzji ani profilowania
      w rozumieniu art. 22 RODO.
    </p>
  </div>
);

const CookiesPolicy = () => (
  <div className="prose prose-sm max-w-none dark:prose-invert">
    <h1>Polityka cookies</h1>
    <p className="text-muted-foreground">Ostatnia aktualizacja: {LAST_UPDATED}</p>

    <h2>1. Czym są pliki cookies</h2>
    <p>
      Pliki cookies (ciasteczka) to małe pliki tekstowe zapisywane na Twoim urządzeniu
      podczas korzystania ze stron internetowych. Służą do zapamiętywania preferencji
      i zapewnienia prawidłowego działania serwisu.
    </p>

    <h2>2. Jakich cookies używamy</h2>
    <table>
      <thead>
        <tr>
          <th>Rodzaj</th>
          <th>Cel</th>
          <th>Czas przechowywania</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Niezbędne (sesyjne)</td>
          <td>Uwierzytelnianie i utrzymanie sesji logowania</td>
          <td>Do zamknięcia przeglądarki / wygaśnięcia sesji</td>
        </tr>
        <tr>
          <td>Funkcjonalne</td>
          <td>Zapamiętanie preferencji (widoczność widgetów, ustawienia powiadomień, motyw)</td>
          <td>Do 1 roku</td>
        </tr>
        <tr>
          <td>Local Storage</td>
          <td>Przechowywanie tokena uwierzytelniania, preferencji UI, stanu instalacji PWA</td>
          <td>Do usunięcia przez użytkownika</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Cookies podmiotów trzecich</h2>
    <p>
      Aplikacja nie wykorzystuje cookies reklamowych ani śledzących podmiotów trzecich.
      Jedyne cookies zewnętrzne mogą pochodzić od dostawcy infrastruktury (hosting)
      i służą wyłącznie celom technicznym.
    </p>

    <h2>4. Zarządzanie cookies</h2>
    <p>
      Możesz zarządzać cookies za pomocą ustawień przeglądarki. Wyłączenie cookies niezbędnych
      może uniemożliwić prawidłowe działanie aplikacji (np. logowanie).
    </p>
    <p>Instrukcje zarządzania cookies w popularnych przeglądarkach:</p>
    <ul>
      <li>Chrome: Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie</li>
      <li>Firefox: Ustawienia → Prywatność i bezpieczeństwo → Ciasteczka</li>
      <li>Safari: Preferencje → Prywatność → Zarządzaj danymi witryn</li>
    </ul>

    <h2>5. Zmiany polityki cookies</h2>
    <p>
      Zastrzegamy sobie prawo do aktualizacji niniejszej polityki. O zmianach poinformujemy
      poprzez aktualizację daty na początku dokumentu.
    </p>

    <h2>6. Kontakt</h2>
    <p>Pytania dotyczące cookies: {CONTACT_EMAIL}.</p>
  </div>
);

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
      <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-xl border-b border-border/30 pt-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-primary">{page.icon}</span>
            <h1 className="text-lg font-heading font-bold truncate">{page.title}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-6">
        <PageComponent />
      </main>
    </div>
  );
};

export default Legal;
