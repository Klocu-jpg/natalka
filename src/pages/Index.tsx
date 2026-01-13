import Header from "@/components/Header";
import ShoppingList from "@/components/ShoppingList";
import TaskList from "@/components/TaskList";
import MiniCalendar from "@/components/MiniCalendar";
import DateIdeas from "@/components/DateIdeas";
import SharedNotes from "@/components/SharedNotes";
import CoupleManager from "@/components/CoupleManager";
import ExpenseTracker from "@/components/ExpenseTracker";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <CoupleManager />
            <ShoppingList />
            <DateIdeas />
          </div>
          
          {/* Middle Column */}
          <div className="space-y-6">
            <TaskList />
            <SharedNotes />
            <ExpenseTracker />
          </div>
          
          {/* Right Column */}
          <div className="md:col-span-2 lg:col-span-1">
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
