import { ReactNode } from "react";

export interface MobileWidgetCardProps {
  title: string;
  icon: ReactNode;
  iconBg?: string;
  children: ReactNode;
  actions?: ReactNode;
  badge?: number;
}

const MobileWidgetCard = ({ 
  title, 
  icon, 
  iconBg = "gradient-primary", 
  children, 
  actions,
  badge,
}: MobileWidgetCardProps) => {
  return (
    <div className="bg-card rounded-2xl shadow-card p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`relative w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {icon}
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
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