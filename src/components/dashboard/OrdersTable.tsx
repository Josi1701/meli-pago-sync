import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Clock, Lock, Eye, XCircle, RotateCcw, Scale, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderSituation } from "@/pages/Dashboard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrdersTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: string;
}

const statusConfig = {
  ok: {
    icon: CheckCircle2,
    label: "OK",
    color: "text-success",
    bgColor: "bg-success-light",
  },
  difference: {
    icon: AlertTriangle,
    label: "Diferença",
    color: "text-warning",
    bgColor: "bg-warning-light",
  },
  pending: {
    icon: Clock,
    label: "A liberar",
    color: "text-neutral",
    bgColor: "bg-neutral-light",
  },
  retained: {
    icon: Lock,
    label: "Retido",
    color: "text-danger",
    bgColor: "bg-danger-light",
  },
};

const situationConfig: Record<OrderSituation, {
  icon: typeof XCircle;
  label: string;
  tooltip: string;
  color: string;
}> = {
  active: {
    icon: CheckCircle2,
    label: "Ativa",
    tooltip: "Venda ativa",
    color: "text-muted-foreground",
  },
  cancelled_before_payment: {
    icon: XCircle,
    label: "Cancelada",
    tooltip: "Venda cancelada antes do pagamento.",
    color: "text-muted-foreground",
  },
  refunded: {
    icon: RotateCcw,
    label: "Devolvida",
    tooltip: "O cliente devolveu o produto, valor reembolsado.",
    color: "text-success",
  },
  partial_refund: {
    icon: RotateCcw,
    label: "Devolução parcial",
    tooltip: "Parte do pedido foi devolvida.",
    color: "text-warning",
  },
  in_dispute: {
    icon: Scale,
    label: "Em disputa",
    tooltip: "O valor está retido enquanto o Mercado Livre analisa a disputa.",
    color: "text-warning",
  },
  chargeback: {
    icon: CreditCard,
    label: "Chargeback",
    tooltip: "Pagamento estornado pelo emissor do cartão.",
    color: "text-danger",
  },
};

const OrdersTable = ({ orders, onSelectOrder, selectedOrderId }: OrdersTableProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="text-lg font-semibold text-foreground">Lista de Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          {orders.length} pedidos encontrados
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30 border-b sticky top-0">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Pedido</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Data</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Produto</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Situação</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Vendido</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Recebido</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Diferença</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              const isSelected = order.id === selectedOrderId;
              const situation = order.situation || "active";
              const SituationIcon = situationConfig[situation].icon;
              const isRefunded = situation === "refunded" || situation === "partial_refund";
              const isCancelled = situation === "cancelled_before_payment";
              
              return (
                <tr 
                  key={order.id} 
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50 cursor-pointer",
                    isSelected && "bg-primary/5"
                  )}
                  onClick={() => onSelectOrder(order)}
                >
                  <td className="p-4">
                    <span className="font-mono text-sm font-medium text-foreground">
                      {order.id}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-sm text-foreground">
                    {order.product}
                  </td>
                  <td className="p-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            {situation !== "active" && (
                              <SituationIcon className={cn("w-5 h-5", situationConfig[situation].color)} />
                            )}
                          </div>
                        </TooltipTrigger>
                        {situation !== "active" && (
                          <TooltipContent>
                            <p>{situationConfig[situation].tooltip}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="p-4 text-right text-sm font-medium">
                    <span className={cn(
                      "text-foreground",
                      (isRefunded || isCancelled) && "line-through text-muted-foreground"
                    )}>
                      R$ {order.soldValue.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm font-medium">
                    <div className="space-y-1">
                      <span className={cn(
                        "text-foreground",
                        isRefunded && "line-through text-muted-foreground"
                      )}>
                        {order.receivedValue > 0 
                          ? `R$ ${order.receivedValue.toFixed(2)}`
                          : "—"}
                      </span>
                      {order.refund && (
                        <div className="text-xs text-success">
                          💸 R$ {order.refund.amount.toFixed(2)} devolvidos
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={cn(
                    "p-4 text-right text-sm font-medium",
                    order.difference < 0 ? "text-danger" : order.difference > 0 ? "text-success" : "text-muted-foreground"
                  )}>
                    {order.difference !== 0 
                      ? `${order.difference > 0 ? '+' : ''}R$ ${order.difference.toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        statusConfig[order.status].bgColor
                      )}>
                        <StatusIcon className={cn("w-3.5 h-3.5", statusConfig[order.status].color)} />
                        <span className={statusConfig[order.status].color}>
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order);
                        }}
                        className="gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default OrdersTable;
