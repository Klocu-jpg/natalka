import { Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { ReactNode } from "react";

interface DraggableWidgetProps {
  id: string;
  index: number;
  children: ReactNode;
}

const DraggableWidget = ({ id, index, children }: DraggableWidgetProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
          className={`group ${snapshot.isDragging ? "z-50" : ""}`}
        >
          <div 
            className={`
              relative transition-all duration-200
              ${snapshot.isDragging ? "scale-[1.02] shadow-2xl" : ""}
            `}
          >
            {/* Drag handle - inside the card at top right */}
            <div
              {...provided.dragHandleProps}
              className="absolute top-3 right-3 opacity-30 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-secondary/80 z-20"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {children}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableWidget;
