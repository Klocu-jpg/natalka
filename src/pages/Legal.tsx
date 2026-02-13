import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Cookie, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APP_NAME = "Love App";
const APP_URL = "loversapp.lovable.app";
const CONTACT_EMAIL = "kontakt@loveapp.pl";
const LAST_UPDATED = "13 lutego 2026";
const PAYMENT_PROVIDER = "Stripe, Inc.";

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
          <><strong>Dane płatności</strong> — informacje o subskrypcji (plan, status, data zakończenia). Dane karty płatniczej są przetwarzane wyłącznie przez {PAYMENT_PROVIDER} i nie są przechowywane przez {APP_NAME}.</>,
          <><strong>Dane techniczne</strong> — subskrypcje powiadomień push, dane o przeglądarce i urządzeniu w zakresie niezbędnym do działania aplikacji.</>,
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="3. Cel przetwarzania danych">
        <BulletList items={[
          "Świadczenie usług — zarządzanie kontem, synchronizacja danych między partnerami.",
          "Obsługa płatności — przetwarzanie subskrypcji, wystawianie rachunków, zarządzanie okresem próbnym.",
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
            ["Art. 6 ust. 1 lit. b) RODO", "Wykonanie umowy — świadczenie usług aplikacji, obsługa subskrypcji"],
            ["Art. 6 ust. 1 lit. a) RODO", "Zgoda — powiadomienia push, udostępnianie danych cyklu"],
            ["Art. 6 ust. 1 lit. c) RODO", "Obowiązek prawny — przechowywanie danych transakcyjnych wymaganych przez prawo podatkowe"],
            ["Art. 6 ust. 1 lit. f) RODO", "Uzasadniony interes — bezpieczeństwo, zapobieganie nadużyciom"],
          ]}
        />
      </Section>
    </Card>

    <Card>
      <Section title="5. Udostępnianie danych">
        <BulletList items={[
          "Twojemu połączonemu partnerowi — współdzielone treści w ramach pary.",
          <>Operatorowi płatności — {PAYMENT_PROVIDER} (polityka prywatności: stripe.com/privacy) w zakresie niezbędnym do realizacji płatności.</>,
          "Dostawcom usług technicznych — hosting, baza danych, przechowywanie plików.",
        ]} />
        <p className="font-medium text-foreground text-xs mt-2">
          Nie sprzedajemy ani nie udostępniamy danych podmiotom trzecim w celach marketingowych.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="6. Przekazywanie danych poza EOG">
        <p>
          Dane mogą być przekazywane do podmiotów mających siedzibę poza Europejskim Obszarem Gospodarczym
          (np. {PAYMENT_PROVIDER} z siedzibą w USA). W takim przypadku stosujemy odpowiednie zabezpieczenia:
          standardowe klauzule umowne zatwierdzone przez Komisję Europejską lub decyzje o adekwatności
          poziomu ochrony danych.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="7. Okres przechowywania">
        <InfoTable
          headers={["Dane", "Okres"]}
          rows={[
            ["Dane konta i profilu", "Do usunięcia konta + 30 dni na trwałe usunięcie"],
            ["Treści użytkownika", "Do usunięcia przez użytkownika lub usunięcia konta"],
            ["Dane transakcji płatniczych", "5 lat od końca roku podatkowego (obowiązek prawny)"],
            ["Logi techniczne", "Do 90 dni"],
          ]}
        />
      </Section>
    </Card>

    <Card>
      <Section title="8. Twoje prawa">
        <BulletList items={[
          "Dostęp do swoich danych i uzyskanie ich kopii.",
          "Sprostowanie nieprawidłowych danych.",
          "Usunięcie danych (\"prawo do bycia zapomnianym\").",
          "Ograniczenie przetwarzania.",
          "Przenoszenie danych w formacie nadającym się do odczytu maszynowego.",
          "Sprzeciw wobec przetwarzania opartego na uzasadnionym interesie.",
          "Wycofanie zgody w dowolnym momencie (bez wpływu na wcześniejsze przetwarzanie).",
          "Wniesienie skargi do Prezesa UODO (ul. Stawki 2, 00-193 Warszawa).",
        ]} />
        <p className="text-xs mt-2">
          Aby skorzystać z powyższych praw, skontaktuj się z nami: {CONTACT_EMAIL}.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="9. Bezpieczeństwo">
        <p>
          Stosujemy szyfrowanie haseł (bcrypt), połączenia HTTPS/TLS, polityki dostępu (RLS) na poziomie bazy danych,
          szyfrowanie danych w spoczynku oraz regularne kopie zapasowe. Dane płatnicze (numery kart) nigdy nie przechodzą
          przez nasze serwery — są obsługiwane bezpośrednio przez {PAYMENT_PROVIDER} zgodnie ze standardem PCI DSS.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="10. Zmiany polityki prywatności">
        <p>
          Zastrzegamy sobie prawo do zmiany niniejszej polityki. O istotnych zmianach poinformujemy 
          użytkowników za pośrednictwem aplikacji lub e-mail z co najmniej 14-dniowym wyprzedzeniem.
          Dalsze korzystanie z aplikacji po wejściu zmian oznacza ich akceptację.
        </p>
      </Section>
    </Card>

    <Card className="bg-secondary/50 border-primary/20">
      <Section title="11. Kontakt">
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
        <BulletList items={[
          <>Regulamin określa zasady korzystania z aplikacji {APP_NAME} dostępnej pod adresem {APP_URL}.</>,
          "Korzystanie z aplikacji oznacza akceptację niniejszego regulaminu w całości.",
          <>Usługodawcą jest {APP_NAME}. Kontakt: {CONTACT_EMAIL}.</>,
          "Regulamin stanowi umowę o świadczenie usług drogą elektroniczną w rozumieniu ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="2. Definicje">
        <BulletList items={[
          <><strong>Aplikacja</strong> — serwis {APP_NAME} dostępny jako progresywna aplikacja webowa (PWA).</>,
          <><strong>Użytkownik</strong> — osoba fizyczna korzystająca z aplikacji po utworzeniu konta.</>,
          <><strong>Konsument</strong> — użytkownik będący osobą fizyczną dokonującą czynności prawnej niezwiązanej bezpośrednio z działalnością gospodarczą lub zawodową.</>,
          <><strong>Para</strong> — dwóch użytkowników połączonych kodem zaproszenia.</>,
          <><strong>Subskrypcja</strong> — odpłatna usługa dostępu do funkcji aplikacji na czas określony.</>,
          <><strong>Okres próbny</strong> — bezpłatny 14-dniowy okres testowania pełnej funkcjonalności aplikacji.</>,
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="3. Rejestracja i konto">
        <BulletList items={[
          "Do korzystania wymagane jest konto (e-mail + hasło).",
          "Użytkownik zobowiązuje się podać prawdziwy adres e-mail i potwierdzić go za pomocą linku weryfikacyjnego.",
          "Użytkownik odpowiada za poufność hasła i wszelkie działania wykonane na jego koncie.",
          "Jedno konto może być przypisane do jednej pary.",
          "Użytkownik musi mieć ukończone 16 lat.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="4. Subskrypcja i płatności">
        <BulletList items={[
          "Dostęp do funkcji aplikacji wymaga aktywnej subskrypcji.",
          "Każda subskrypcja rozpoczyna się od 14-dniowego bezpłatnego okresu próbnego.",
          "Po zakończeniu okresu próbnego subskrypcja jest automatycznie odnawiana, a opłata pobierana zgodnie z wybranym planem.",
          <>Płatności obsługiwane są przez {PAYMENT_PROVIDER}. {APP_NAME} nie przechowuje danych kart płatniczych.</>,
          "Akceptowane metody płatności: karta płatnicza, Google Pay. Dostępność metod może się różnić w zależności od regionu.",
        ]} />

        <p className="font-medium text-foreground text-xs mt-3">Dostępne plany indywidualne:</p>
        <InfoTable
          headers={["Plan", "Cena", "Cykl rozliczeniowy"]}
          rows={[
            ["Miesięczny", "5 zł", "Co miesiąc"],
            ["Półroczny", "25 zł", "Co 6 miesięcy"],
            ["Roczny", "50 zł", "Co rok"],
          ]}
        />

        <p className="font-medium text-foreground text-xs mt-3">Plany dla par (dostęp dla dwóch osób):</p>
        <InfoTable
          headers={["Plan", "Cena", "Cykl rozliczeniowy"]}
          rows={[
            ["Miesięczny", "8 zł", "Co miesiąc"],
            ["Półroczny", "40 zł", "Co 6 miesięcy"],
            ["Roczny", "80 zł", "Co rok"],
          ]}
        />

        <p className="text-xs mt-2">
          Ceny podane są w złotych polskich (PLN) i zawierają podatek VAT (jeśli dotyczy). 
          Usługodawca zastrzega sobie prawo do zmiany cen z 30-dniowym wyprzedzeniem — zmiana nie dotyczy 
          już opłaconych okresów subskrypcji.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="5. Prawo odstąpienia od umowy">
        <BulletList items={[
          "Konsument ma prawo odstąpić od umowy subskrypcji w terminie 14 dni od jej zawarcia bez podania przyczyny.",
          "Aby skorzystać z prawa odstąpienia, należy złożyć oświadczenie drogą mailową na adres: " + CONTACT_EMAIL + ".",
          "W przypadku odstąpienia w trakcie bezpłatnego okresu próbnego nie są pobierane żadne opłaty.",
          "Jeśli konsument wyraził zgodę na rozpoczęcie świadczenia usługi przed upływem terminu odstąpienia i usługa została w pełni wykonana, prawo odstąpienia nie przysługuje (art. 38 pkt 1 ustawy o prawach konsumenta).",
          "W przypadku częściowego wykonania usługi konsument ponosi koszty proporcjonalne do zakresu spełnionego świadczenia.",
          "Zwrot środków następuje w ciągu 14 dni od otrzymania oświadczenia o odstąpieniu, przy użyciu tego samego sposobu płatności.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="6. Anulowanie i zarządzanie subskrypcją">
        <BulletList items={[
          "Użytkownik może anulować subskrypcję w dowolnym momencie za pośrednictwem portalu zarządzania subskrypcją dostępnego w ustawieniach aplikacji.",
          "Anulowanie oznacza, że subskrypcja nie zostanie odnowiona na kolejny okres — dostęp do funkcji pozostaje aktywny do końca opłaconego okresu.",
          "Brak możliwości częściowego zwrotu za niewykorzystaną część bieżącego okresu rozliczeniowego, chyba że przysługuje prawo odstąpienia od umowy.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="7. Zasady korzystania">
        <BulletList items={[
          "Korzystanie z aplikacji zgodnie z jej przeznaczeniem i obowiązującym prawem.",
          "Niepodejmowanie działań zakłócających działanie aplikacji.",
          "Nieumieszczanie treści niezgodnych z prawem, obraźliwych lub naruszających prawa osób trzecich.",
          "Niestosowanie aplikacji w celach komercyjnych bez pisemnej zgody usługodawcy.",
          "Nieudostępnianie konta osobom trzecim.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="8. Funkcje aplikacji">
        <BulletList items={[
          "Wspólne listy zakupów i zadań.",
          "Planowanie posiłków z generowaniem przepisów przez AI.",
          "Śledzenie wydatków i celów oszczędnościowych.",
          "Kalendarz, odliczanie, albumy zdjęć, notatki, zaczepki.",
          "Powiadomienia push o aktywnościach partnera.",
          "Śledzenie cyklu menstruacyjnego (opcjonalne).",
          "Pomysły na randki.",
        ]} />
        <p className="text-xs mt-2">
          Wszystkie plany subskrypcji zapewniają dostęp do pełnej funkcjonalności. 
          Usługodawca zastrzega prawo do dodawania, modyfikowania lub usuwania funkcji z ważnych przyczyn technicznych lub biznesowych.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="9. Treści użytkownika">
        <BulletList items={[
          "Użytkownik zachowuje pełne prawa autorskie do treści, które tworzy w aplikacji.",
          "Użytkownik udziela usługodawcy niewyłącznej, nieodpłatnej licencji na przechowywanie i wyświetlanie treści wyłącznie w celu świadczenia usługi.",
          "Administrator może usunąć treści naruszające regulamin lub obowiązujące prawo po uprzednim powiadomieniu użytkownika.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="10. Reklamacje">
        <BulletList items={[
          "Reklamacje można składać drogą elektroniczną na adres: " + CONTACT_EMAIL + ".",
          "Reklamacja powinna zawierać: opis problemu, adres e-mail konta oraz oczekiwany sposób rozwiązania.",
          "Reklamacje rozpatrujemy w terminie 14 dni od ich otrzymania.",
          "Konsument ma prawo skorzystać z pozasądowych sposobów rozpatrywania reklamacji, w tym platformy ODR (ec.europa.eu/odr).",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="11. Odpowiedzialność">
        <BulletList items={[
          "Usługodawca dokłada wszelkich starań, aby aplikacja działała poprawnie i bez przerw.",
          "Usługodawca nie ponosi odpowiedzialności za przerwy w działaniu wynikające z przyczyn niezależnych (siła wyższa, awarie dostawców zewnętrznych).",
          "Usługodawca nie ponosi odpowiedzialności za utratę danych wynikającą z działania użytkownika.",
          "Odpowiedzialność usługodawcy wobec konsumenta jest ograniczona do wartości opłaconej subskrypcji w okresie, w którym doszło do zdarzenia.",
          "Powyższe ograniczenia nie dotyczą odpowiedzialności wynikającej z bezwzględnie obowiązujących przepisów prawa.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="12. Usunięcie konta">
        <BulletList items={[
          <>Aby usunąć konto, skontaktuj się pod adresem {CONTACT_EMAIL}.</>,
          "Usunięcie konta skutkuje trwałym usunięciem wszystkich danych w ciągu 30 dni.",
          "Usunięcie konta nie zwalnia z obowiązku uiszczenia opłat za bieżący okres subskrypcji.",
          "Przed usunięciem konta zalecamy anulowanie subskrypcji w portalu zarządzania subskrypcją.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="13. Zmiany regulaminu">
        <p>
          Usługodawca zastrzega sobie prawo do zmiany regulaminu z ważnych przyczyn (zmiana przepisów prawa, 
          zmiana funkcjonalności aplikacji). O zmianach użytkownicy zostaną poinformowani z co najmniej 
          14-dniowym wyprzedzeniem. Brak akceptacji zmian uprawnia do rozwiązania umowy.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="14. Prawo właściwe">
        <p>
          Regulamin podlega prawu polskiemu. W sprawach nieuregulowanych stosuje się przepisy Kodeksu cywilnego, 
          ustawy o prawach konsumenta, ustawy o świadczeniu usług drogą elektroniczną oraz RODO.
          Wszelkie spory z konsumentami rozstrzygane będą przez sąd właściwy według przepisów ogólnych.
        </p>
      </Section>
    </Card>

    <Card className="bg-secondary/50 border-primary/20">
      <Section title="15. Kontakt">
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
            ["Obsługa subskrypcji i płatności", "Art. 6 ust. 1 lit. b) — umowa"],
            ["Realizacja obowiązków podatkowych", "Art. 6 ust. 1 lit. c) — obowiązek prawny"],
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
          "Połączony partner (współdzielone treści w ramach pary).",
          <>{PAYMENT_PROVIDER} — operator płatności (przetwarzanie subskrypcji i transakcji).</>,
          "Dostawcy infrastruktury technicznej (hosting, baza danych, przechowywanie plików).",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="4. Przekazywanie danych">
        <p>
          Dane mogą być przekazywane do podmiotów mających siedzibę poza EOG (np. {PAYMENT_PROVIDER} — USA).
          W takim przypadku stosujemy standardowe klauzule umowne zatwierdzone przez Komisję Europejską 
          lub opieramy się na decyzji o adekwatności poziomu ochrony danych (Data Privacy Framework).
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="5. Okres przechowywania">
        <InfoTable
          headers={["Dane", "Okres"]}
          rows={[
            ["Dane konta", "Do usunięcia konta + 30 dni"],
            ["Treści użytkownika", "Do usunięcia przez użytkownika lub usunięcia konta"],
            ["Dane transakcji płatniczych", "5 lat od końca roku podatkowego"],
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
          "Wycofanie zgody (art. 7 ust. 3 RODO) — bez wpływu na zgodność z prawem przetwarzania przed wycofaniem.",
          "Skarga do Prezesa UODO — ul. Stawki 2, 00-193 Warszawa (uodo.gov.pl).",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="7. Dobrowolność podania danych">
        <p>
          E-mail i hasło są niezbędne do korzystania z aplikacji.
          Dane płatnicze są niezbędne do aktywacji subskrypcji.
          Pozostałe dane (płeć, dane cyklu) są dobrowolne.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="8. Zautomatyzowane decyzje">
        <p>
          Nie stosujemy zautomatyzowanego podejmowania decyzji ani profilowania w rozumieniu art. 22 RODO.
          Funkcja generowania przepisów AI nie podejmuje decyzji wywołujących skutki prawne wobec użytkownika.
        </p>
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
            ["Niezbędne", "Uwierzytelnianie i sesja logowania", "Do zamknięcia sesji"],
            ["Funkcjonalne", "Preferencje widgetów, powiadomień, motywu", "Do 1 roku"],
            ["Płatności", "Sesje płatności Stripe (przetwarzane przez Stripe)", "Do zakończenia transakcji"],
            ["Local Storage", "Token uwierzytelniania, preferencje UI, stan PWA, tryb płatności", "Do usunięcia ręcznego"],
          ]}
        />
      </Section>
    </Card>

    <Card>
      <Section title="3. Cookies podmiotów trzecich">
        <BulletList items={[
          "Aplikacja nie wykorzystuje cookies reklamowych ani śledzących.",
          <>{PAYMENT_PROVIDER} może używać własnych cookies w procesie płatności (checkout) — szczegóły: stripe.com/cookie-settings.</>,
          "Jedyne inne cookies zewnętrzne mogą pochodzić od dostawcy hostingu i służą celom technicznym.",
        ]} />
      </Section>
    </Card>

    <Card>
      <Section title="4. Zarządzanie cookies">
        <p>Możesz zarządzać cookies w ustawieniach przeglądarki:</p>
        <BulletList items={[
          "Chrome: Ustawienia → Prywatność i bezpieczeństwo → Pliki cookie",
          "Firefox: Ustawienia → Prywatność i bezpieczeństwo → Ciasteczka",
          "Safari: Preferencje → Prywatność → Zarządzaj danymi witryn",
          "Edge: Ustawienia → Prywatność, wyszukiwanie i usługi → Pliki cookie",
        ]} />
        <p className="text-xs mt-2">
          Wyłączenie cookies niezbędnych może uniemożliwić logowanie i korzystanie z aplikacji.
          Zablokowanie cookies płatniczych uniemożliwi dokonanie płatności.
        </p>
      </Section>
    </Card>

    <Card>
      <Section title="5. Podstawa prawna">
        <BulletList items={[
          "Cookies niezbędne: art. 173 ust. 3 Prawa telekomunikacyjnego — nie wymagają zgody.",
          "Cookies funkcjonalne: art. 6 ust. 1 lit. a) RODO — na podstawie zgody wyrażonej przez kontynuowanie korzystania z aplikacji.",
        ]} />
      </Section>
    </Card>

    <Card className="bg-secondary/50 border-primary/20">
      <Section title="6. Kontakt">
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