import { useState } from "react";
import { Wallet, Plus, Trash2, Loader2, TrendingDown, CalendarIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useExpenses } from "@/hooks/useExpenses";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const ExpenseTracker = () => {
  const { expenses, categories, isLoading, addExpense, deleteExpense, totalThisMonth, byCategory } = useExpenses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category_id: "other",
    date: new Date(),
  });

  const handleAddExpense = async () => {
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Wpisz prawidłową kwotę");
      return;
    }
    if (!newExpense.description.trim()) {
      toast.error("Wpisz opis wydatku");
      return;
    }

    try {
      await addExpense.mutateAsync({
        amount,
        description: newExpense.description,
        category_id: newExpense.category_id,
        date: format(newExpense.date, "yyyy-MM-dd"),
      });
      setNewExpense({ amount: "", description: "", category_id: "other", date: new Date() });
      setDialogOpen(false);
      toast.success("Wydatek dodany! 💸");
    } catch {
      toast.error("Nie udało się dodać wydatku");
    }
  };

  const chartData = byCategory.map(cat => ({
    name: cat.name,
    value: cat.total,
    color: cat.color,
  }));

  return (
    <WidgetWrapper
      title="Wydatki"
      icon={<Wallet className="w-5 h-5 text-accent-foreground" />}
      iconBg="bg-coral"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="coral" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Dodaj wydatek</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kwota (PLN)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="rounded-xl text-lg font-semibold"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Opis</label>
                <Input
                  placeholder="Na co wydałeś/aś?"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategoria</label>
                <Select
                  value={newExpense.category_id}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category_id: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newExpense.date, "d MMMM yyyy", { locale: pl })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newExpense.date}
                      onSelect={(date) => date && setNewExpense({ ...newExpense, date })}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button onClick={handleAddExpense} className="w-full" disabled={addExpense.isPending}>
                {addExpense.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Dodaj wydatek"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Monthly total */}
      <div className="bg-coral-light rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <TrendingDown className="w-4 h-4" />
          <span>W tym miesiącu</span>
        </div>
        <p className="text-2xl font-heading font-bold">
          {totalThisMonth.toFixed(2)} <span className="text-base font-normal">PLN</span>
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-coral" />
        </div>
      ) : (
        <>
          {/* Pie chart */}
          {chartData.length > 0 && (
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(2)} PLN`, '']}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                    }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent expenses */}
          <div className="space-y-2">
            {expenses.slice(0, 5).map(expense => {
              const category = categories.find(c => c.id === expense.category_id);
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 p-3 bg-secondary rounded-xl group"
                >
                  <span className="text-lg">{category?.icon || "📦"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(expense.date), "d MMM", { locale: pl })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    -{Number(expense.amount).toFixed(2)} zł
                  </p>
                  <button
                    onClick={() => deleteExpense.mutate(expense.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {expenses.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">
              Brak wydatków. Dodaj pierwszy! 💰
            </p>
          )}
        </>
      )}
    </WidgetWrapper>
  );
};

export default ExpenseTracker;
