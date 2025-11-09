import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, FinancialStatus, ReconciliationStatus } from "@/pages/Dashboard";
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

const financialStatusConfig: Record<FinancialStatus, {
  icon: string;
  label: string;
  tooltip: string;
  color: string;
}> = {
  released: {
    icon: "💸",
    label: "Liberado",
    tooltip: "Valor recebido e disponível",
    color: "text-success bg-success/10 border-success",
  },
  pending_release: {
    icon: "⏳",
    label: "A liberar",
    tooltip: "Pagamento aprovado, mas ainda retido",
    color: "text-warning bg-warning/10 border-warning",
  },
  retained: {
    icon: "🔒",
    label: "Retido",
    tooltip: "Valor bloqueado por disputa ou chargeback",
    color: "text-orange-500 bg-orange-500/10 border-orange-500",
  },
  refunded: {
    icon: "🔁",
    label: "Devolvido",
    tooltip: "Valor reembolsado ao cliente",
    color: "text-blue-500 bg-blue-500/10 border-blue-500",
  },
  cancelled: {
    icon: "🚫",
    label: "Cancelado",
    tooltip: "Venda cancelada antes do pagamento",
    color: "text-muted-foreground bg-muted border-muted-foreground",
  },
};

const reconciliationStatusConfig: Record<ReconciliationStatus, {
  icon: string;
  label: string;
  tooltip: string;
  color: string;
}> = {
  reconciled: {
    icon: "✅",
    label: "Conferido",
    tooltip: "Valor confere com o valor recebido",
    color: "text-success bg-success/10 border-success",
  },
  difference_detected: {
    icon: "⚠️",
    label: "Diferença",
    tooltip: "Valores diferentes, mas explicação possível",
    color: "text-warning bg-warning/10 border-warning",
  },
  not_reconciled: {
    icon: "❌",
    label: "Não conferido",
    tooltip: "Venda sem registro correspondente no pagamento",
    color: "text-danger bg-danger/10 border-danger",
  },
  in_progress: {
    icon: "⏺️",
    label: "Em conferência",
    tooltip: "Processo de cruzamento ainda em execução",
    color: "text-blue-500 bg-blue-500/10 border-blue-500",
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
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Vendido</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Recebido</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Diferença</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status Financeiro</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status Conciliação</th>
              <th className="text-center p-4 text-sm font-medium text-muted-foreground">Ação</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isSelected = order.id === selectedOrderId;
              const isRefunded = order.financialStatus === "refunded";
              const isCancelled = order.financialStatus === "cancelled";
              
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
                        <div className="text-xs text-blue-500">
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <Badge 
                              variant="outline" 
                              className={cn("gap-1.5", financialStatusConfig[order.financialStatus].color)}
                            >
                              <span>{financialStatusConfig[order.financialStatus].icon}</span>
                              <span className="text-xs">{financialStatusConfig[order.financialStatus].label}</span>
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{financialStatusConfig[order.financialStatus].tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="p-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex justify-center">
                            <Badge 
                              variant="outline" 
                              className={cn("gap-1.5", reconciliationStatusConfig[order.reconciliationStatus].color)}
                            >
                              <span>{reconciliationStatusConfig[order.reconciliationStatus].icon}</span>
                              <span className="text-xs">{reconciliationStatusConfig[order.reconciliationStatus].label}</span>
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{reconciliationStatusConfig[order.reconciliationStatus].tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
