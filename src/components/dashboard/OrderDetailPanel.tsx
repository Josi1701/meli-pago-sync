import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle2, Search, AlertTriangle, Clock, Lock, XCircle, RotateCcw, Scale, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Order, FinancialStatus, ReconciliationStatus } from "@/pages/Dashboard";

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
}

const financialStatusConfig: Record<FinancialStatus, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  badgeColor: string;
}> = {
  released: {
    icon: CheckCircle2,
    label: "Liberado",
    color: "text-success",
    badgeColor: "bg-success/10 text-success border-success",
  },
  pending_release: {
    icon: Clock,
    label: "A liberar",
    color: "text-warning",
    badgeColor: "bg-warning/10 text-warning border-warning",
  },
  retained: {
    icon: Lock,
    label: "Retido",
    color: "text-orange-500",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500",
  },
  refunded: {
    icon: RotateCcw,
    label: "Devolvido",
    color: "text-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelado",
    color: "text-muted-foreground",
    badgeColor: "bg-muted text-muted-foreground border-muted-foreground",
  },
};

const reconciliationStatusConfig: Record<ReconciliationStatus, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  badgeColor: string;
}> = {
  reconciled: {
    icon: CheckCircle2,
    label: "Conferido",
    color: "text-success",
    badgeColor: "bg-success/10 text-success border-success",
  },
  difference_detected: {
    icon: AlertTriangle,
    label: "Diferença detectada",
    color: "text-warning",
    badgeColor: "bg-warning/10 text-warning border-warning",
  },
  not_reconciled: {
    icon: XCircle,
    label: "Não conferido",
    color: "text-danger",
    badgeColor: "bg-danger/10 text-danger border-danger",
  },
  in_progress: {
    icon: Clock,
    label: "Em conferência",
    color: "text-blue-500",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500",
  },
};

const OrderDetailPanel = ({ order, onClose }: OrderDetailPanelProps) => {
  if (!order) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Selecione um pedido para ver os detalhes
        </p>
      </Card>
    );
  }

  const FinancialIcon = financialStatusConfig[order.financialStatus].icon;
  const ReconciliationIcon = reconciliationStatusConfig[order.reconciliationStatus].icon;
  const isRefunded = order.financialStatus === "refunded";
  const isCancelled = order.financialStatus === "cancelled";

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Detalhes do Pedido</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {order.id}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Separator />

      {/* Two Status Sections */}
      <div className="space-y-4">
        {/* Financial Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            1️⃣ Movimento financeiro
          </h4>
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("gap-1.5", financialStatusConfig[order.financialStatus].badgeColor)}>
                <FinancialIcon className="w-4 h-4" />
                {financialStatusConfig[order.financialStatus].label}
              </Badge>
            </div>
            {order.releaseDate && order.financialStatus === "pending_release" && (
              <p className="text-xs text-muted-foreground">
                Previsto para: {new Date(order.releaseDate).toLocaleDateString('pt-BR')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Origem: {order.channel}
            </p>
          </div>
        </div>

        {/* Reconciliation Status */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            2️⃣ Conciliação
          </h4>
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("gap-1.5", reconciliationStatusConfig[order.reconciliationStatus].badgeColor)}>
                <ReconciliationIcon className="w-4 h-4" />
                {reconciliationStatusConfig[order.reconciliationStatus].label}
              </Badge>
            </div>
            {order.reconciliationStatus === "reconciled" && (
              <p className="text-xs text-success">
                Conferido automaticamente
              </p>
            )}
            {order.reconciliationStatus === "difference_detected" && order.difference !== 0 && (
              <p className="text-xs text-warning">
                Diferença de R$ {Math.abs(order.difference).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Identification */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Identificação</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pedido</span>
            <span className="font-medium text-foreground">{order.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Data</span>
            <span className="font-medium text-foreground">
              {new Date(order.date).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Produto</span>
            <span className="font-medium text-foreground">{order.product}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Canal</span>
            <span className="font-medium text-foreground">{order.channel}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Financial Summary */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Resumo Financeiro</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor vendido</span>
            <span className={cn(
              "font-medium",
              (isRefunded || isCancelled) ? "line-through text-muted-foreground" : "text-foreground"
            )}>
              R$ {order.soldValue.toFixed(2)}
            </span>
          </div>

          {order.fees && order.fees.length > 0 && (
            <div className="space-y-1 pl-4 border-l-2 border-muted">
              {order.fees.map((fee, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {fee.name} ({fee.percentage}% - {fee.origin})
                  </span>
                  <span className="text-danger">
                    - R$ {fee.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {order.refund && (
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-success">
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Reembolso</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor devolvido</span>
                <span className="font-medium text-success">
                  💸 R$ {order.refund.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Data</span>
                <span className="text-foreground">
                  {new Date(order.refund.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm pt-2 border-t">
            <span className="text-muted-foreground">Valor recebido</span>
            <span className={cn(
              "font-medium",
              isRefunded && "line-through text-muted-foreground"
            )}>
              {order.receivedValue > 0 
                ? `R$ ${order.receivedValue.toFixed(2)}`
                : "Não recebido"}
            </span>
          </div>

          {order.difference !== 0 && (
            <div className="flex justify-between text-sm font-medium pt-2 border-t">
              <span className="text-foreground">Diferença</span>
              <span className={cn(
                order.difference < 0 ? "text-danger" : "text-success"
              )}>
                {order.difference > 0 ? '+' : ''}R$ {order.difference.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {order.explanation && (
        <>
          <Separator />
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">Explicação automática</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {order.explanation}
            </p>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Ações disponíveis</h4>
        <div className="space-y-2">
          <Button variant="outline" className="w-full gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Aceitar diferença
          </Button>
          <Button variant="outline" className="w-full gap-2">
            <Search className="w-4 h-4" />
            Ver pedidos semelhantes
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OrderDetailPanel;
