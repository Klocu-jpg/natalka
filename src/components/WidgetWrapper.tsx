import { GripVertical } from "lucide-react";
import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WidgetWrapperProps {
  title: string;
  icon: ReactNode;
  iconBg?: string;
  children: ReactNode;
  actions?: ReactNode;
}

const WidgetWrapper = ({ title, icon, iconBg = "gradient-primary", children, actions }: WidgetWrapperProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
            {icon}
          </div>
          <h2 className="text-xl font-heading font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-secondary/80 transition-colors">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 -mr-3 pr-3">
        {children}
      </ScrollArea>
    </div>
  );
};

export default WidgetWrapper;
