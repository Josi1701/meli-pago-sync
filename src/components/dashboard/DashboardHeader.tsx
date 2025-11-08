import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Clock, Lock, BarChart3, List } from "lucide-react";

interface DashboardHeaderProps {
  onToggleCharts: () => void;
  showCharts: boolean;
}

const DashboardHeader = ({ onToggleCharts, showCharts }: DashboardHeaderProps) => {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Conciliação Automática</h1>
            <p className="text-muted-foreground">
              Última atualização: hoje às 18:00
            </p>
          </div>
          <Button onClick={onToggleCharts} variant="outline" className="gap-2">
            {showCharts ? (
              <>
                <List className="w-4 h-4" />
                Ver pedidos
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                Ver análises
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-success-light border-success-border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">Conciliado</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">87%</p>
              <p className="text-sm text-muted-foreground">R$ 32.000</p>
            </div>
          </Card>

          <Card className="p-4 bg-warning-light border-warning-border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-warning">Com diferença</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">R$ 620</p>
            </div>
          </Card>

          <Card className="p-4 bg-neutral-light border-neutral-border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-neutral" />
              <span className="text-sm font-medium text-neutral">A liberar</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">18</p>
              <p className="text-sm text-muted-foreground">R$ 1.980</p>
            </div>
          </Card>

          <Card className="p-4 bg-danger-light border-danger-border hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-danger" />
              <span className="text-sm font-medium text-danger">Retido</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">R$ 350</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
