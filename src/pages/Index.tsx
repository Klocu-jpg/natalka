import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import Header from "@/components/Header";
import ShoppingList from "@/components/ShoppingList";
import TaskList from "@/components/TaskList";
import MiniCalendar from "@/components/MiniCalendar";
import DateIdeas from "@/components/DateIdeas";
import SharedNotes from "@/components/SharedNotes";
import ExpenseTracker from "@/components/ExpenseTracker";
import DaysCounter from "@/components/DaysCounter";
import DraggableWidget from "@/components/DraggableWidget";
import { useWidgetOrder } from "@/hooks/useWidgetOrder";

const WIDGET_COMPONENTS: Record<string, React.FC> = {
  DaysCounter,
  ShoppingList,
  DateIdeas,
  TaskList,
  SharedNotes,
  ExpenseTracker,
  MiniCalendar,
};

const Index = () => {
  const { widgets, reorderWidgets } = useWidgetOrder();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    
    reorderWidgets(result.source.index, result.destination.index);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="widgets">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min"
              >
                {widgets.map((widget, index) => {
                  const Component = WIDGET_COMPONENTS[widget.component];
                  if (!Component) return null;
                  
                  return (
                    <DraggableWidget key={widget.id} id={widget.id} index={index}>
                      <Component />
                    </DraggableWidget>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
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
