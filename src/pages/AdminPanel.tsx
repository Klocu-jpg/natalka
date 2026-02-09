import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminBugReports } from "@/hooks/useBugReports";
import { PLANS } from "@/config/plans";
import { ArrowLeft, Users, Heart, DollarSign, Bug, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigate } from "react-router-dom";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nowe", variant: "destructive" },
  in_progress: { label: "W trakcie", variant: "default" },
  resolved: { label: "Rozwiązane", variant: "secondary" },
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { userCount, coupleCount, isLoading: statsLoading } = useAdminStats();
  const { reports, isLoading: reportsLoading, updateStatus } = useAdminBugReports();

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

  // Theoretical monthly revenue: all users × cheapest plan (5 PLN)
  const monthlyPrice = 5;
  const theoreticalRevenue = userCount * monthlyPrice;

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Panel Admina</h1>
      </div>

      {/* Stats */}
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
        <Card className="col-span-2">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{statsLoading ? "..." : `${theoreticalRevenue} zł`}</p>
              <p className="text-xs text-muted-foreground">
                Teoretyczny przychód/mies. ({userCount} × {monthlyPrice} zł)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Bug Reports */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Zgłoszenia błędów ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportsLoading ? (
            <p className="text-sm text-muted-foreground">Ładowanie...</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak zgłoszeń 🎉</p>
          ) : (
            reports.map((report: any) => (
              <div key={report.id} className="p-3 bg-secondary rounded-xl space-y-2">
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
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
