import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileWidgetCardProps {
  title: string;
  icon: ReactNode;
  iconBg?: string;
  children: ReactNode;
  actions?: ReactNode;
}

const MobileWidgetCard = ({ 
  title, 
  icon, 
  iconBg = "gradient-primary", 
  children, 
  actions 
}: MobileWidgetCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <h2 className="text-lg font-heading font-semibold truncate">{title}</h2>
        </div>
        {actions && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default MobileWidgetCard;