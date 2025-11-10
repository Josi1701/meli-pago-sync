import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, FileCheck, Info, AlertCircle } from "lucide-react";
import type { Order } from "@/pages/Dashboard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BalanceSummaryProps {
  orders: Order[];
}

const BalanceSummary = ({ orders }: BalanceSummaryProps) => {
  const balanceData = useMemo(() => {
    // Calcular diferenças não resolvidas (apenas detected e support_open)
    const unresolvedDifferences = orders
      .filter((o) => 
        o.difference !== 0 && 
        o.differenceStatus && 
        (o.differenceStatus === "detected" || o.differenceStatus === "support_open")
      )
      .reduce((sum, o) => sum + Math.abs(o.difference), 0);

    // Saldo conciliado = Total recebido + A liberar + Retido - Devoluções
    const totalReceived = orders
      .filter((o) => o.financialStatus === "released")
      .reduce((sum, o) => sum + o.receivedValue, 0);

    const pendingRelease = orders
      .filter((o) => o.financialStatus === "pending_release")
      .reduce((sum, o) => sum + o.soldValue, 0);

    const retained = orders
      .filter((o) => o.financialStatus === "retained")
      .reduce((sum, o) => sum + o.soldValue, 0);

    const refunds = orders
      .filter((o) => o.financialStatus === "refunded")
      .reduce((sum, o) => sum + (o.refund?.amount || 0), 0);

    const reconciledBalance = totalReceived + pendingRelease + retained - refunds;

    // Mock do saldo total do Mercado Pago (em produção viria da API)
    // Simula valores não conciliados como Pix, transferências, etc.
    const unreconciled = reconciledBalance * 0.25; // 25% a mais simulando outras movimentações
    const totalMercadoPago = reconciledBalance + unreconciled;

    const difference = totalMercadoPago - reconciledBalance;
    const differencePercentage = totalMercadoPago > 0 
      ? (difference / totalMercadoPago) * 100 
      : 0;

    return {
      totalMercadoPago,
      reconciledBalance,
      difference,
      differencePercentage,
      unreconciled,
      unresolvedDifferences,
    };
  }, [orders]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  const showInsight = balanceData.differencePercentage > 10;

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Mercado Pago */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Saldo total Mercado Pago
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Inclui pedidos, transferências, Pix e outras movimentações fora da conciliação</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(balanceData.totalMercadoPago)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor em tempo real da conta
            </p>
          </CardContent>
        </Card>

        {/* Saldo Conciliado */}
        <Card className="border-success/20 bg-success-light/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-success" />
              Saldo conciliado (pedidos)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Somente valores vinculados a pedidos Mercado Livre conciliados</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(balanceData.reconciledBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valores das vendas conciliadas
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Reconciliation Breakdown */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Linha de reconciliação
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-foreground">Total Mercado Pago</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(balanceData.totalMercadoPago)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground pl-4">
                  <span className="text-warning mr-2">–</span>
                  Valores não conciliados
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(balanceData.unreconciled)}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground pl-8 py-1">
                Pix, cobranças, transferências (fora do escopo)
              </div>

              <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-success/20">
                <span className="text-success font-semibold flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Total conciliado com pedidos
                </span>
                <span className="font-bold text-success">
                  {formatCurrency(balanceData.reconciledBalance)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insight Alert */}
      {showInsight && (
        <Card className="border-warning/50 bg-warning-light">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-warning-foreground">
                  💡 Diferença significativa detectada
                </p>
                <p className="text-sm text-muted-foreground">
                  Seu saldo no Mercado Pago está {formatCurrency(balanceData.difference)} acima do conciliado. 
                  Pode haver PIX, cobranças ou devoluções recentes. 
                  <button className="text-primary hover:underline ml-1 font-medium">
                    Veja no extrato do Mercado Pago
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Footer */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-lg">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <strong>A conciliação considera apenas os valores ligados a pedidos.</strong> 
          {" "}O saldo total pode incluir valores que não fazem parte das vendas conciliadas 
          (como Pix, transferências ou devoluções fora de pedido).
        </p>
      </div>
    </div>
  );
};

export default BalanceSummary;
