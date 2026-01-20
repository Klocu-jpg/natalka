import { GripVertical } from "lucide-react";
import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface WidgetWrapperProps {
  title: string;
  icon: ReactNode;
  iconBg?: string;
  children: ReactNode;
  actions?: ReactNode;
}

const WidgetWrapper = ({ title, icon, iconBg = "gradient-primary", children, actions }: WidgetWrapperProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-card rounded-2xl shadow-card p-4 sm:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <h2 className="text-lg sm:text-xl font-heading font-semibold truncate">{title}</h2>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {actions}
          {/* Hide drag handle on mobile */}
          {!isMobile && (
            <div className="drag-handle cursor-grab active:cursor-grabbing p-2 rounded-lg hover:bg-secondary/80 transition-colors">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1 -mr-2 pr-2 sm:-mr-3 sm:pr-3">
        {children}
      </ScrollArea>
    </div>
  );
};

export default WidgetWrapper;