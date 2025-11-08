import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/pages/Dashboard";

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
}

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

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Identificação</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pedido:</span>
              <span className="text-sm font-medium text-foreground">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Data:</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(order.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Produto:</span>
              <span className="text-sm font-medium text-foreground">{order.product}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Canal:</span>
              <span className="text-sm font-medium text-foreground">{order.channel}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Resumo Financeiro</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor original:</span>
              <span className="text-lg font-semibold text-foreground">
                R$ {order.soldValue.toFixed(2)}
              </span>
            </div>

            {order.fees && order.fees.length > 0 && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                {order.fees.map((fee, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{fee.name}:</span>
                      <span className="text-danger">
                        -{fee.percentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground/70">{fee.origin}</span>
                      <span className="text-danger font-medium">
                        -R$ {fee.value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Valor líquido recebido:</span>
              <span className="text-lg font-bold text-success">
                {order.receivedValue > 0 
                  ? `R$ ${order.receivedValue.toFixed(2)}`
                  : "R$ 0,00"}
              </span>
            </div>
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
      </div>
    </Card>
  );
};

export default OrderDetailPanel;
