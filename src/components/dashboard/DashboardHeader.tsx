import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DollarSign, AlertTriangle, Clock, Lock, BarChart3, List, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Order } from "@/pages/Dashboard";
import { useMemo } from "react";

interface DashboardHeaderProps {
  onToggleView: () => void;
  currentView: "table" | "charts" | "summary";
  orders: Order[];
  onCardClick?: (filterType: 'financial' | 'reconciliation', value: string) => void;
}

const DashboardHeader = ({ onToggleView, currentView, orders, onCardClick }: DashboardHeaderProps) => {
  const stats = useMemo(() => {
    let releasedValue = 0;
    let releasedCount = 0;
    let pendingValue = 0;
    let pendingCount = 0;
    let retainedValue = 0;
    let retainedCount = 0;
    let refundedValue = 0;
    let refundedCount = 0;
    let cancelledCount = 0;

    let reconciledValue = 0;
    let reconciledCount = 0;
    let differenceValue = 0;
    let differenceCount = 0;
    let notReconciledCount = 0;
    let inProgressCount = 0;

    // Separate calculation for financial and reconciliation bases
    orders.forEach((order) => {
      // Financial Status - all orders
      if (order.financialStatus === "released") {
        releasedCount++;
        releasedValue += order.receivedValue;
      } else if (order.financialStatus === "pending_release") {
        pendingCount++;
        pendingValue += order.soldValue;
      } else if (order.financialStatus === "retained") {
        retainedCount++;
        retainedValue += order.soldValue;
      } else if (order.financialStatus === "refunded") {
        refundedCount++;
        refundedValue += order.refund?.amount || 0;
      } else if (order.financialStatus === "cancelled") {
        cancelledCount++;
      }
    });

    // Reconciliation Status - exclude cancelled orders
    const reconcilableOrders = orders.filter(order => order.financialStatus !== 'cancelled');
    reconcilableOrders.forEach((order) => {
      if (order.reconciliationStatus === "reconciled") {
        reconciledCount++;
        reconciledValue += order.soldValue;
      } else if (order.reconciliationStatus === "difference_detected") {
        differenceCount++;
        differenceValue += Math.abs(order.difference);
      } else if (order.reconciliationStatus === "not_reconciled") {
        notReconciledCount++;
      } else if (order.reconciliationStatus === "in_progress") {
        inProgressCount++;
      }
    });

    const reconcilableTotal = reconcilableOrders.reduce((sum, order) => sum + order.soldValue, 0);
    const reconciledPercentage = reconcilableTotal > 0 
      ? Math.round((reconciledValue / reconcilableTotal) * 100) 
      : 0;

    return {
      financial: {
        released: { count: releasedCount, value: releasedValue },
        pending: { count: pendingCount, value: pendingValue },
        retained: { count: retainedCount, value: retainedValue },
        refunded: { count: refundedCount, value: refundedValue },
        cancelled: { count: cancelledCount },
      },
      reconciliation: {
        reconciled: { count: reconciledCount, value: reconciledValue, percentage: reconciledPercentage },
        difference: { count: differenceCount, value: differenceValue },
        notReconciled: { count: notReconciledCount },
        inProgress: { count: inProgressCount },
      },
    };
  }, [orders]);

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
          <div className="flex gap-2">
            <Button 
              onClick={onToggleView} 
              variant={currentView === "table" ? "default" : "outline"} 
              className="gap-2"
              size="sm"
            >
              <List className="w-4 h-4" />
              Pedidos
            </Button>
            <Button 
              onClick={onToggleView} 
              variant={currentView === "charts" ? "default" : "outline"} 
              className="gap-2"
              size="sm"
            >
              <BarChart3 className="w-4 h-4" />
              Análises
            </Button>
            <Button 
              onClick={onToggleView} 
              variant={currentView === "summary" ? "default" : "outline"} 
              className="gap-2"
              size="sm"
            >
              <FileText className="w-4 h-4" />
              Resumo gerencial
            </Button>
          </div>
        </div>

        {/* Financial Status Cards - Only shown in table view */}
        {currentView === "table" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Status Financeiro
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-success-light border-success-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('financial', 'released')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💸</span>
                      <span className="text-sm font-medium text-success">Liberado</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.financial.released.count}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {stats.financial.released.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Valores já depositados na conta. 
                    <span className="block mt-1 text-primary font-medium">
                      💡 Quer transformar isso em baixa automática no Contas a Receber?
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-warning-light border-warning-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('financial', 'pending_release')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⏳</span>
                      <span className="text-sm font-medium text-warning">A liberar</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.financial.pending.count}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {stats.financial.pending.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Valores aguardando liberação do marketplace. Clique para filtrar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-orange-500/10 border-orange-500/20 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('financial', 'retained')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔒</span>
                      <span className="text-sm font-medium text-orange-500">Retido</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.financial.retained.count}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {stats.financial.retained.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Valores retidos por disputas ou análises. Clique para filtrar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-blue-500/10 border-blue-500/20 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('financial', 'refunded')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🔁</span>
                      <span className="text-sm font-medium text-blue-500">Devolvido</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.financial.refunded.count}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {stats.financial.refunded.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Valores estornados por devoluções. Clique para filtrar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-muted border-muted hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('financial', 'cancelled')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🚫</span>
                      <span className="text-sm font-medium text-muted-foreground">Cancelado</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.financial.cancelled.count}</p>
                      <p className="text-sm text-muted-foreground">Antes do repasse</p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Pedidos cancelados antes do pagamento. Clique para filtrar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        )}

        {/* Reconciliation Status Cards - Only shown in table view */}
        {currentView === "table" && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Status de Conciliação
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-success-light border-success-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('reconciliation', 'reconciled')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm font-medium text-success">Conferido</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.reconciliation.reconciled.percentage}%</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.reconciliation.reconciled.count} pedidos
                      </p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Conferido significa que o Bling já validou o repasse. 
                    <span className="block mt-1 text-primary font-medium">
                      Você pode automatizar essa etapa na Conciliação Financeira.
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-warning-light border-warning-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('reconciliation', 'difference_detected')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      <span className="text-sm font-medium text-warning">Diferença detectada</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.reconciliation.difference.count}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {stats.reconciliation.difference.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Diferenças geralmente vêm de taxa, antecipação ou devolução. Clique para filtrar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-danger-light border-danger-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('reconciliation', 'not_reconciled')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-danger" />
                      <span className="text-sm font-medium text-danger">Não conferido</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.reconciliation.notReconciled.count}</p>
                      <p className="text-sm text-muted-foreground">Sem registro</p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Pedidos pendentes de conferência. Clique para filtrar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card 
                    className="p-4 bg-blue-500/10 border-blue-500/20 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCardClick?.('reconciliation', 'in_progress')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-blue-500">Em conferência</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{stats.reconciliation.inProgress.count}</p>
                      <p className="text-sm text-muted-foreground">Processando</p>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Conferência em andamento. Clique para filtrar.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
