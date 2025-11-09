import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ShoppingCart, DollarSign, Info } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Order } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import BalanceSummary from "./BalanceSummary";

interface ManagementSummaryProps {
  orders: Order[];
}

type DateMode = "sale_date" | "payment_date";
type Channel = "all" | "mercado_livre" | "mercado_pago";

interface PeriodStats {
  month: string;
  totalOrders: number;
  totalOrdersValue: number;
  financiallyValidOrders: number;
  financiallyValidValue: number;
  
  // Conciliação
  reconciledCount: number;
  reconciledValue: number;
  reconciledPercentage: number;
  differenceCount: number;
  differenceValue: number;
  notReconciledCount: number;
  
  // Custos
  commissions: number;
  fixedFees: number;
  freeShipping: number;
  coupons: number;
  refunds: number;
  totalCosts: number;
  costsPercentage: number;
  
  // Recebimentos
  totalReceived: number;
  pendingRelease: number;
  retained: number;
  
  // Resultado
  netToReceive: number;
}

const ManagementSummary = ({ orders }: ManagementSummaryProps) => {
  const [dateMode, setDateMode] = useState<DateMode>("sale_date");
  const [channel, setChannel] = useState<Channel>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const periodStats = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return [];

    // Get all months in the range
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });

    return months.map((month): PeriodStats => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      // Filter orders for this month
      const monthOrders = orders.filter((order) => {
        const orderDate = parseISO(order.date);
        const inDateRange = orderDate >= monthStart && orderDate <= monthEnd;
        const matchesChannel = channel === "all" || order.channel.toLowerCase().includes(channel.replace("_", " "));
        return inDateRange && matchesChannel;
      });

      // Calculate metrics
      const totalOrders = monthOrders.length;
      const totalOrdersValue = monthOrders.reduce((sum, o) => sum + o.soldValue, 0);

      // Financially valid orders (excludes cancelled before payment)
      const financiallyValidOrders = monthOrders.filter(
        (o) => o.financialStatus !== "cancelled"
      );
      const financiallyValidValue = financiallyValidOrders.reduce((sum, o) => sum + o.soldValue, 0);

      // Reconciliation
      const reconciledOrders = monthOrders.filter((o) => o.reconciliationStatus === "reconciled");
      const reconciledValue = reconciledOrders.reduce((sum, o) => sum + o.soldValue, 0);
      const reconciledPercentage = financiallyValidValue > 0 
        ? Math.round((reconciledValue / financiallyValidValue) * 100)
        : 0;

      const differenceOrders = monthOrders.filter((o) => o.reconciliationStatus === "difference_detected");
      const differenceValue = differenceOrders.reduce((sum, o) => sum + Math.abs(o.difference), 0);

      const notReconciledCount = monthOrders.filter(
        (o) => o.reconciliationStatus === "not_reconciled"
      ).length;

      // Costs - ONLY calculated on reconciled and paid orders
      const commissions = reconciledOrders.reduce((sum, o) => {
        const feeTotal = o.fees?.reduce((feeSum, fee) => feeSum + fee.value, 0) || 0;
        return sum + feeTotal;
      }, 0);

      const refunds = reconciledOrders
        .filter((o) => o.financialStatus === "refunded")
        .reduce((sum, o) => sum + (o.refund?.amount || 0), 0);

      const fixedFees = reconciledValue * 0.01; // 1% estimado
      const freeShipping = reconciledValue * 0.005; // 0.5% estimado
      const coupons = reconciledValue * 0.003; // 0.3% estimado

      const totalCosts = commissions + fixedFees + freeShipping + coupons + refunds;
      const costsPercentage = reconciledValue > 0
        ? Math.round((totalCosts / reconciledValue) * 100)
        : 0;

      // Received values
      const totalReceived = monthOrders
        .filter((o) => o.financialStatus === "released")
        .reduce((sum, o) => sum + o.receivedValue, 0);

      const pendingRelease = monthOrders
        .filter((o) => o.financialStatus === "pending_release")
        .reduce((sum, o) => sum + o.soldValue, 0);

      const retained = monthOrders
        .filter((o) => o.financialStatus === "retained")
        .reduce((sum, o) => sum + o.soldValue, 0);

      // Net to receive - based on reconciled orders
      const netToReceive = reconciledValue - totalCosts - totalReceived;

      return {
        month: format(month, "MMM/yyyy", { locale: ptBR }),
        totalOrders,
        totalOrdersValue,
        financiallyValidOrders: financiallyValidOrders.length,
        financiallyValidValue,
        reconciledCount: reconciledOrders.length,
        reconciledValue,
        reconciledPercentage,
        differenceCount: differenceOrders.length,
        differenceValue,
        notReconciledCount,
        commissions,
        fixedFees,
        freeShipping,
        coupons,
        refunds,
        totalCosts,
        costsPercentage,
        totalReceived,
        pendingRelease,
        retained,
        netToReceive,
      };
    });
  }, [orders, dateRange, channel]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <BalanceSummary orders={orders} />

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Channel Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Canal</label>
              <Select value={channel} onValueChange={(value: Channel) => setChannel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="mercado_livre">Mercado Livre</SelectItem>
                  <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Mode Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de data</label>
              <div className="flex gap-2">
                <Button
                  variant={dateMode === "sale_date" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateMode("sale_date")}
                  className="flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Data da venda
                </Button>
                <Button
                  variant={dateMode === "payment_date" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateMode("payment_date")}
                  className="flex-1"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Data do repasse
                </Button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Período (até 60 dias)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Info Badge */}
          {dateRange.from && dateRange.to && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-500">
                {dateMode === "sale_date"
                  ? "Exibindo valores por data de venda (desempenho de vendas)"
                  : "Exibindo valores por data de repasse (fluxo de caixa)"}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Table */}
      {periodStats.length > 0 ? (
        <Card className="p-6 overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Indicador</th>
                  {periodStats.map((stat) => (
                    <th key={stat.month} className="text-right py-3 px-4 font-semibold text-foreground">
                      {stat.month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Pedidos Section */}
                <tr className="border-b border-border bg-muted/50">
                  <td colSpan={periodStats.length + 1} className="py-2 px-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-semibold text-muted-foreground cursor-help flex items-center gap-1">
                            🧾 PEDIDOS
                            <Info className="w-3 h-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Mostra o total de vendas do período (independente de conciliação)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground">Pedidos totais</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-foreground font-medium">{stat.totalOrders}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(stat.totalOrdersValue)}</div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <td className="py-3 px-4 text-foreground cursor-help">
                          Pedidos pagos
                          <Info className="w-3 h-3 inline ml-1 text-muted-foreground" />
                        </td>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Pedidos que geraram pagamento (exclui cancelados antes do repasse)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-foreground font-medium">{stat.financiallyValidOrders}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(stat.financiallyValidValue)}</div>
                    </td>
                  ))}
                </tr>

                {/* Conciliação Section */}
                <tr className="border-b border-border bg-success-light">
                  <td colSpan={periodStats.length + 1} className="py-2 px-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-semibold text-success cursor-help flex items-center gap-1">
                            ✅ CONCILIAÇÃO
                            <Info className="w-3 h-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Mostra o status da conferência dos pedidos com base nas informações do Mercado Pago</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground">Pedidos conferidos</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-success font-medium">{stat.reconciledPercentage}%</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.reconciledCount} pedidos
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <td className="py-3 px-4 text-foreground cursor-help">
                          Diferença explicada
                          <Info className="w-3 h-3 inline ml-1 text-muted-foreground" />
                        </td>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Diferenças geralmente são por tarifas do marketplace ou devoluções</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-warning font-medium">{stat.differenceCount}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(stat.differenceValue)}</div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground">Não conferidos</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-danger font-medium">{stat.notReconciledCount}</div>
                    </td>
                  ))}
                </tr>

                {/* Custos Section */}
                <tr className="border-b border-border bg-danger-light">
                  <td colSpan={periodStats.length + 1} className="py-2 px-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-semibold text-danger cursor-help flex items-center gap-1">
                            💸 CUSTOS (–)
                            <Info className="w-3 h-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Mostra custos calculados sobre os pedidos conciliados e pagos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-muted-foreground pl-8">Comissões</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrency(stat.commissions)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-muted-foreground pl-8">Taxas fixas</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrency(stat.fixedFees)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-muted-foreground pl-8">Frete grátis</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrency(stat.freeShipping)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-muted-foreground pl-8">Cupons concedidos</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4 text-muted-foreground">
                      {formatCurrency(stat.coupons)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-muted-foreground pl-8">Devoluções / Estornos</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4 text-danger">
                      {formatCurrency(stat.refunds)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50 bg-danger-light">
                  <td className="py-3 px-4 font-semibold text-danger">Total de custos</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-danger font-bold">{formatCurrency(stat.totalCosts)}</div>
                      <div className="text-xs text-danger">
                        {stat.reconciledValue > 0 ? `(${stat.costsPercentage}% sobre conciliados)` : '–'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Recebimentos Section */}
                <tr className="border-b border-border bg-muted/50">
                  <td colSpan={periodStats.length + 1} className="py-2 px-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-semibold text-muted-foreground cursor-help flex items-center gap-1">
                            🟢 RECEBIMENTOS
                            <Info className="w-3 h-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Mostra os valores efetivamente recebidos ou a receber dos pedidos conciliados</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground">Total recebido</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-success font-medium">{formatCurrency(stat.totalReceived)}</div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border hover:bg-muted/50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <td className="py-3 px-4 text-foreground cursor-help">
                          A liberar / Retidos
                          <Info className="w-3 h-3 inline ml-1 text-muted-foreground" />
                        </td>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Valores que já foram vendidos, mas o marketplace ainda não repassou</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-3 px-4">
                      <div className="text-warning font-medium">{formatCurrency(stat.pendingRelease + stat.retained)}</div>
                      <div className="text-xs text-muted-foreground">
                        {stat.pendingRelease > 0 && `A liberar: ${formatCurrency(stat.pendingRelease)}`}
                        {stat.retained > 0 && ` | Retido: ${formatCurrency(stat.retained)}`}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Net Result */}
                <tr className="border-t-2 border-success bg-success-light">
                  <td className="py-4 px-4 font-bold text-success text-base">Total líquido a receber</td>
                  {periodStats.map((stat) => (
                    <td key={stat.month} className="text-right py-4 px-4">
                      <div className="text-success font-bold text-lg">{formatCurrency(stat.netToReceive)}</div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Selecione um período para visualizar
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha o canal, tipo de data e período acima para gerar o resumo gerencial.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ManagementSummary;