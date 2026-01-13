import Header from "@/components/Header";
import ShoppingList from "@/components/ShoppingList";
import TaskList from "@/components/TaskList";
import MiniCalendar from "@/components/MiniCalendar";
import DateIdeas from "@/components/DateIdeas";
import SharedNotes from "@/components/SharedNotes";
import ExpenseTracker from "@/components/ExpenseTracker";
import DaysCounter from "@/components/DaysCounter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1 */}
          <div className="space-y-6">
            <DaysCounter />
            <ShoppingList />
            <DateIdeas />
          </div>
          
          {/* Column 2 */}
          <div className="space-y-6">
            <TaskList />
            <SharedNotes />
            <ExpenseTracker />
          </div>
          
          {/* Column 3 */}
          <div className="space-y-6 md:col-span-2 lg:col-span-1">
            <MiniCalendar />
          </div>
        </div>
      </main>

      {/* Decorative footer */}
      <footer className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Zbudowane z 💕 dla Was
        </p>
      </footer>
    </div>
  );
};

export default Index;
