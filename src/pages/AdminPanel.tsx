import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminBugReports } from "@/hooks/useBugReports";
import { useAdminStripeData } from "@/hooks/useAdminStripeData";
import { PLANS } from "@/config/plans";
import { ArrowLeft, Users, Heart, DollarSign, Bug, CheckCircle, Clock, CreditCard, TrendingUp, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigate } from "react-router-dom";
import { useState } from "react";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nowe", variant: "destructive" },
  in_progress: { label: "W trakcie", variant: "default" },
  resolved: { label: "Rozwiązane", variant: "secondary" },
};

const SUB_STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Aktywna", variant: "default" },
  trialing: { label: "Trial", variant: "outline" },
  past_due: { label: "Zaległa", variant: "destructive" },
  canceled: { label: "Anulowana", variant: "secondary" },
};

const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric" });
const formatAmount = (amount: number, currency: string) => `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;

type Tab = "overview" | "subscriptions" | "payments" | "bugs";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { userCount, coupleCount, isLoading: statsLoading } = useAdminStats();
  const { reports, isLoading: reportsLoading, updateStatus } = useAdminBugReports();
  const { data: stripeData, isLoading: stripeLoading } = useAdminStripeData();
  const [tab, setTab] = useState<Tab>("overview");

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Ładowanie...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Przegląd" },
    { id: "subscriptions", label: "Subskrypcje" },
    { id: "payments", label: "Płatności" },
    { id: "bugs", label: "Błędy" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 max-w-3xl mx-auto space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Panel Admina</h1>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : userCount}</p>
                  <p className="text-xs text-muted-foreground">Użytkownicy</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : coupleCount}</p>
                  <p className="text-xs text-muted-foreground">Pary</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stripeLoading ? "..." : stripeData ? formatAmount(stripeData.mrr, "pln") : "0"}
                  </p>
                  <p className="text-xs text-muted-foreground">MRR</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stripeLoading ? "..." : stripeData?.customers_count ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Klienci Stripe</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription breakdown */}
          {stripeData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status subskrypcji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded-lg">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium">{stripeData.subscriptions.active} aktywnych</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{stripeData.subscriptions.trialing} trial</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium">{stripeData.subscriptions.past_due} zaległych</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <UserX className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{stripeData.subscriptions.canceled} anulowanych</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plans overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Plany cenowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PLANS.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">{plan.name}</span>
                  <span className="text-sm text-muted-foreground">{plan.price} {plan.period}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="space-y-3">
          {stripeLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Ładowanie...</p>
          ) : !stripeData?.subscription_details?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Brak subskrypcji</p>
          ) : (
            stripeData.subscription_details.map((sub: any) => (
              <Card key={sub.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[60%]">
                      {sub.customer_email || sub.customer_id}
                    </span>
                    <Badge variant={SUB_STATUS_MAP[sub.status]?.variant || "outline"}>
                      {SUB_STATUS_MAP[sub.status]?.label || sub.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatAmount(sub.plan_amount, "pln")} / {sub.plan_interval_count > 1 ? `${sub.plan_interval_count} ` : ""}{sub.plan_interval === "month" ? "mies." : sub.plan_interval === "year" ? "rok" : sub.plan_interval}
                    </span>
                    <span>
                      {sub.status === "canceled"
                        ? `Anulowana`
                        : sub.trial_end && sub.status === "trialing"
                        ? `Trial do ${formatDate(sub.trial_end)}`
                        : `Do ${formatDate(sub.current_period_end)}`}
                    </span>
                  </div>
                  {sub.cancel_at_period_end && sub.status === "active" && (
                    <p className="text-xs text-destructive">Anuluje się na koniec okresu</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "payments" && (
        <div className="space-y-3">
          {stripeLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Ładowanie...</p>
          ) : !stripeData?.recent_payments?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Brak płatności</p>
          ) : (
            stripeData.recent_payments.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.customer_email || "Brak emaila"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(p.created)}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-bold">{formatAmount(p.amount, p.currency)}</p>
                      <Badge
                        variant={p.paid ? "default" : p.refunded ? "secondary" : "destructive"}
                        className="text-[10px] mt-0.5"
                      >
                        {p.refunded ? "Zwrot" : p.paid ? "Opłacona" : "Nieopłacona"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "bugs" && (
        <div className="space-y-3">
          {reportsLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Ładowanie...</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Brak zgłoszeń 🎉</p>
          ) : (
            reports.map((report: any) => (
              <Card key={report.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{report.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(report.created_at).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                    <Badge variant={STATUS_MAP[report.status]?.variant || "outline"}>
                      {STATUS_MAP[report.status]?.label || report.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {report.status !== "in_progress" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => updateStatus.mutate({ id: report.id, status: "in_progress" })}
                      >
                        <Clock className="w-3 h-3 mr-1" /> W trakcie
                      </Button>
                    )}
                    {report.status !== "resolved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => updateStatus.mutate({ id: report.id, status: "resolved" })}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Rozwiązane
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
