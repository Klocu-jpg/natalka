import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminBugReports } from "@/hooks/useBugReports";
import { useAdminStripeData } from "@/hooks/useAdminStripeData";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAdminGrowth } from "@/hooks/useAdminGrowth";
import { PLANS } from "@/config/plans";
import { ArrowLeft, Users, Heart, TrendingUp, CreditCard, Bug, CheckCircle, Clock, UserCheck, UserX, AlertTriangle, Send, Search, Loader2, Bell, BarChart3, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

type Tab = "overview" | "charts" | "users" | "subscriptions" | "payments" | "bugs" | "push" | "costs";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { userCount, coupleCount, isLoading: statsLoading } = useAdminStats();
  const { reports, isLoading: reportsLoading, updateStatus } = useAdminBugReports();
  const { data: stripeData, isLoading: stripeLoading } = useAdminStripeData();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { userGrowth, coupleGrowth } = useAdminGrowth(60);
  const [tab, setTab] = useState<Tab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushSending, setPushSending] = useState(false);
  const [simUsers, setSimUsers] = useState("1000");
  const [simRecipes, setSimRecipes] = useState("15");
  const [simAvgPrice, setSimAvgPrice] = useState("5");

  // Build a map of subscription status by email
  const subStatusByEmail = useMemo(() => {
    const map = new Map<string, string>();
    if (stripeData?.subscription_details) {
      for (const sub of stripeData.subscription_details) {
        if (sub.customer_email) {
          const existing = map.get(sub.customer_email);
          // Prioritize active > trialing > past_due > canceled
          if (!existing || sub.status === "active" || (sub.status === "trialing" && existing !== "active")) {
            map.set(sub.customer_email, sub.status);
          }
        }
      }
    }
    return map;
  }, [stripeData]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u: any) => u.email?.toLowerCase().includes(q));
  }, [users, userSearch]);

  // Merge growth data for chart
  const chartData = useMemo(() => {
    const userMap = new Map<string, number>();
    const coupleMap = new Map<string, number>();
    userGrowth.data?.forEach((p: any) => userMap.set(p.day, Number(p.count)));
    coupleGrowth.data?.forEach((p: any) => coupleMap.set(p.day, Number(p.count)));
    const allDays = new Set([...userMap.keys(), ...coupleMap.keys()]);
    return Array.from(allDays)
      .sort()
      .map((day) => ({
        day: new Date(day).toLocaleDateString("pl-PL", { day: "2-digit", month: "short" }),
        Użytkownicy: userMap.get(day) || 0,
        Pary: coupleMap.get(day) || 0,
      }));
  }, [userGrowth.data, coupleGrowth.data]);

  const handleBroadcast = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      toast.error("Wypełnij tytuł i treść");
      return;
    }
    setPushSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-broadcast-push", {
        body: { title: pushTitle.trim(), body: pushBody.trim() },
      });
      if (error) throw error;
      toast.success(`Wysłano do ${data.sent}/${data.total} urządzeń${data.cleaned ? ` (wyczyszczono ${data.cleaned})` : ""}`);
      setPushTitle("");
      setPushBody("");
    } catch {
      toast.error("Nie udało się wysłać powiadomień");
    } finally {
      setPushSending(false);
    }
  };

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
    { id: "charts", label: "Wykresy" },
    { id: "costs", label: "Koszty" },
    { id: "users", label: "Użytkownicy" },
    { id: "subscriptions", label: "Subskrypcje" },
    { id: "payments", label: "Płatności" },
    { id: "push", label: "Push" },
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

      {/* Tab navigation - scrollable */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap text-xs font-medium py-2 px-3 rounded-lg transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-4">
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

      {/* CHARTS */}
      {tab === "charts" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Wzrost użytkowników i par (ostatnie 60 dni)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userGrowth.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Brak danych</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCouples" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--coral, 0 80% 65%))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--coral, 0 80% 65%))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="Użytkownicy" stroke="hsl(var(--primary))" fill="url(#colorUsers)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Pary" stroke="hsl(var(--coral, 0 80% 65%))" fill="url(#colorCouples)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Subscription chart from Stripe data */}
          {stripeData && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Podsumowanie subskrypcji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Aktywne", value: stripeData.subscriptions.active, color: "text-emerald-500" },
                    { label: "Trial", value: stripeData.subscriptions.trialing, color: "text-blue-500" },
                    { label: "Zaległe", value: stripeData.subscriptions.past_due, color: "text-destructive" },
                    { label: "Anulowane", value: stripeData.subscriptions.canceled, color: "text-muted-foreground" },
                  ].map((item) => (
                    <div key={item.label} className="p-3 bg-secondary rounded-lg">
                      <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj po emailu..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Brak użytkowników</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{filteredUsers.length} użytkowników</p>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {filteredUsers.map((user: any) => {
                  const subStatus = subStatusByEmail.get(user.email);
                  return (
                    <Card key={user.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString("pl-PL", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        {subStatus ? (
                          <Badge variant={SUB_STATUS_MAP[subStatus]?.variant || "outline"} className="text-[10px] ml-2">
                            {SUB_STATUS_MAP[subStatus]?.label || subStatus}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] ml-2 opacity-50">
                            Brak sub.
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* SUBSCRIPTIONS */}
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

      {/* PAYMENTS */}
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

      {/* PUSH BROADCAST */}
      {tab === "push" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Wyślij powiadomienie do wszystkich
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Tytuł powiadomienia..."
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
              />
              <Textarea
                placeholder="Treść powiadomienia..."
                value={pushBody}
                onChange={(e) => setPushBody(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleBroadcast}
                disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
                className="w-full"
              >
                {pushSending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Wyślij do wszystkich
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Powiadomienie zostanie wysłane do wszystkich urządzeń z aktywną subskrypcją push.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* COSTS */}
      {tab === "costs" && (
        <div className="space-y-4">
          {/* Current costs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Aktualne koszty ({userCount} użytkowników)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const activeUsers = userCount || 0;
                const aiCost = activeUsers * 15 * (200 * 0.15 + 500 * 0.60) / 1_000_000;
                const emailCost = activeUsers * 3 * 0.001;
                const totalCost = aiCost + emailCost;
                const mrrPln = (stripeData?.mrr || 0) / 100;
                const costPln = totalCost * 4.2;
                const profit = mrrPln - costPln;
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">🤖 AI</p>
                        <p className="text-lg font-bold">${aiCost.toFixed(3)}</p>
                        <p className="text-[10px] text-muted-foreground">~{(aiCost * 4.2).toFixed(2)} PLN</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">📧 Maile</p>
                        <p className="text-lg font-bold">${emailCost.toFixed(3)}</p>
                        <p className="text-[10px] text-muted-foreground">~{(emailCost * 4.2).toFixed(2)} PLN</p>
                      </div>
                    </div>
                    <Card className="border-primary/20">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">MRR</p>
                            <p className="text-lg font-bold">{mrrPln.toFixed(2)} PLN</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Koszty</p>
                            <p className="text-lg font-bold">~{costPln.toFixed(2)} PLN</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Zysk</p>
                            <p className={`text-lg font-bold ${profit >= 0 ? "text-emerald-500" : "text-destructive"}`}>{profit.toFixed(2)} PLN</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Simulator */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">🧮 Symulator kosztów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Użytkownicy</label>
                  <Input type="number" value={simUsers} onChange={(e) => setSimUsers(e.target.value)} className="h-9" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Przepisy/user</label>
                  <Input type="number" value={simRecipes} onChange={(e) => setSimRecipes(e.target.value)} className="h-9" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Avg cena PLN</label>
                  <Input type="number" value={simAvgPrice} onChange={(e) => setSimAvgPrice(e.target.value)} className="h-9" />
                </div>
              </div>
              {(() => {
                const users = Math.max(0, parseInt(simUsers) || 0);
                const recipes = Math.max(0, parseInt(simRecipes) || 0);
                const avgPrice = Math.max(0, parseFloat(simAvgPrice) || 0);
                const aiCost = users * recipes * (200 * 0.15 + 500 * 0.60) / 1_000_000;
                const emailCost = users * 3 * 0.001;
                const totalCostPln = (aiCost + emailCost) * 4.2;
                const revenue = users * avgPrice;
                const stripeFees = users * (avgPrice * 0.015 + 0.50);
                const netRevenue = revenue - stripeFees - totalCostPln;
                const margin = revenue > 0 ? (netRevenue / revenue) * 100 : 0;
                const perUser = users > 0 ? (totalCostPln + stripeFees) / users : 0;
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">🤖 AI</p>
                        <p className="text-lg font-bold">{(aiCost * 4.2).toFixed(2)} PLN</p>
                        <p className="text-[10px] text-muted-foreground">${aiCost.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">📧 Maile</p>
                        <p className="text-lg font-bold">{(emailCost * 4.2).toFixed(2)} PLN</p>
                        <p className="text-[10px] text-muted-foreground">${emailCost.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">💳 Stripe</p>
                        <p className="text-lg font-bold">{stripeFees.toFixed(2)} PLN</p>
                        <p className="text-[10px] text-muted-foreground">1.5% + 0.50 PLN/tx</p>
                      </div>
                      <div className="p-3 bg-secondary rounded-lg">
                        <p className="text-xs text-muted-foreground">👤 Koszt/user</p>
                        <p className="text-lg font-bold">{perUser.toFixed(2)} PLN</p>
                        <p className="text-[10px] text-muted-foreground">AI + maile + Stripe</p>
                      </div>
                    </div>
                    <Card className="border-primary/20">
                      <CardContent className="p-3">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <p className="text-[10px] text-muted-foreground">Przychód</p>
                            <p className="text-sm font-bold">{revenue.toFixed(0)} PLN</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Koszty</p>
                            <p className="text-sm font-bold">{(totalCostPln + stripeFees).toFixed(0)} PLN</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Zysk netto</p>
                            <p className={`text-sm font-bold ${netRevenue >= 0 ? "text-emerald-500" : "text-destructive"}`}>{netRevenue.toFixed(0)} PLN</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Marża</p>
                            <p className={`text-sm font-bold ${margin >= 0 ? "text-emerald-500" : "text-destructive"}`}>{margin.toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">📊 Szczegóły kalkulacji:</p>
                <p>• AI (Gemini 2.5 Flash): $0.15/1M input + $0.60/1M output</p>
                <p>• ~200 tokenów wejście + ~500 wyjście na przepis</p>
                <p>• Maile auth: ~$0.001/mail</p>
                <p>• Push: darmowe • Stripe: 1.5% + 0.50 PLN/tx</p>
                <p>• Kurs USD/PLN: ~4.20</p>
                <p>• Użycie Lovable AI: Settings → Workspace → Usage</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BUGS */}
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
