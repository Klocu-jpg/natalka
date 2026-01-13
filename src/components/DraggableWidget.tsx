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
          className={`relative group ${snapshot.isDragging ? "z-50" : ""}`}
        >
          {/* Drag handle */}
          <div
            {...provided.dragHandleProps}
            className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-secondary z-10"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className={snapshot.isDragging ? "shadow-2xl rounded-2xl" : ""}>
            {children}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableWidget;
