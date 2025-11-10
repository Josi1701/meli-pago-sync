import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, LineChart, Line, Area, AreaChart, CartesianGrid } from "recharts";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { Order } from "@/pages/Dashboard";
import { 
  TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, 
  TrendingDown, Info, Target, Lightbulb, ArrowRight, Search, 
  FileText, BarChart3, DollarSign, RefreshCcw 
} from "lucide-react";
interface DashboardChartsProps {
  orders: Order[];
}
const COLORS = {
  ok: "hsl(var(--success))",
  difference: "hsl(var(--warning))",
  pending: "hsl(var(--neutral))",
  retained: "hsl(var(--danger))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--danger))"
};
const DashboardCharts = ({ orders }: DashboardChartsProps) => {
  // ========== KPIs ==========
  const recoveredValue = orders.filter(o => o.differenceStatus === "recovered").reduce((sum, o) => sum + Math.abs(o.difference), 0);
  const confirmedCostValue = orders.filter(o => o.differenceStatus === "confirmed_cost").reduce((sum, o) => sum + Math.abs(o.difference), 0);
  const supportOpenValue = orders.filter(o => o.differenceStatus === "support_open").reduce((sum, o) => sum + Math.abs(o.difference), 0);
  const resolvedCount = orders.filter(o => o.differenceStatus === "recovered" || o.differenceStatus === "confirmed_cost").length;
  const totalWithDifference = orders.filter(o => o.difference !== 0).length;
  const reconciledAutomatically = orders.filter(o => o.reconciliationStatus === "reconciled").length;
  const timeSaved = Math.round(reconciledAutomatically * 0.25 * 10) / 10;
  const recoveryRate = recoveredValue + confirmedCostValue > 0 ? Math.round(recoveredValue / (recoveredValue + confirmedCostValue) * 100) : 0;
  
  // ========== Difference types mapping ==========
  const differencesByType = orders
    .filter(o => o.fees && o.fees.length > 0)
    .flatMap(o => o.fees!)
    .reduce((acc, fee) => {
      const existing = acc.find(c => c.name === fee.name);
      if (existing) {
        existing.value += fee.value;
        existing.count += 1;
      } else {
        acc.push({ name: fee.name, value: fee.value, count: 1 });
      }
      return acc;
    }, [] as { name: string; value: number; count: number }[])
    .sort((a, b) => b.value - a.value);

  // ========== Recurring patterns ==========
  const recurringDifferences = differencesByType.slice(0, 3);

  // ========== Reconciliation rate ==========
  const reconciliationTotal = orders.filter(o => o.financialStatus !== "cancelled").length;
  const reconciliationRate = reconciliationTotal > 0 ? Math.round((reconciledAutomatically / reconciliationTotal) * 100) : 0;

  // ========== Timeline data ==========
  const timelineData = orders
    .reduce((acc, order) => {
      const date = new Date(order.date);
      const weekKey = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const existing = acc.find(d => d.date === weekKey);
      if (existing) {
        existing.previsto += order.soldValue;
        existing.recebido += order.receivedValue;
        existing.diferenca += Math.abs(order.soldValue - order.receivedValue);
      } else {
        acc.push({
          date: weekKey,
          previsto: order.soldValue,
          recebido: order.receivedValue,
          diferenca: Math.abs(order.soldValue - order.receivedValue)
        });
      }
      return acc;
    }, [] as { date: string; previsto: number; recebido: number; diferenca: number }[])
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    })
    .slice(-15);

  const totalPrevisto = timelineData.reduce((s, d) => s + d.previsto, 0);
  const totalRecebido = timelineData.reduce((s, d) => s + d.recebido, 0);
  const totalDiferencas = timelineData.reduce((s, d) => s + d.diferenca, 0);
  const avgDifference = totalPrevisto > 0 ? ((totalPrevisto - totalRecebido) / totalPrevisto * 100).toFixed(1) : "0";

  return (
    <div className="space-y-8">
      {/* ========== BLOCO 1: RESUMO EXECUTIVO ========== */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Resumo Executivo</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Você está aprendendo com o comportamento do seu dinheiro. Continue conferindo para tornar seu caixa mais previsível.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-5 bg-success-light border-success-border cursor-help">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-success/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-success mb-1">Valor recuperado</p>
                      <p className="text-2xl font-bold text-foreground">
                        R$ {recoveredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        💸 Dinheiro que voltou para o caixa
                      </p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">Valores que foram identificados como diferenças e posteriormente recuperados através de suporte ou reclassificação.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-5 bg-primary/5 border-primary/20 cursor-help">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary mb-1">Tempo economizado</p>
                      <p className="text-2xl font-bold text-foreground">{timeSaved}h</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        🤖 {reconciledAutomatically} conferências automáticas
                      </p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">Estimativa de tempo que você economizou ao usar a conciliação automática ao invés de conferir manualmente cada pedido.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-5 bg-warning-light border-warning-border cursor-help">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-warning/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-warning mb-1">Taxa de recuperação</p>
                      <p className="text-2xl font-bold text-foreground">{recoveryRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        📈 Eficiência em resolver diferenças
                      </p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">Percentual de diferenças que foram recuperadas vs. confirmadas como custo. Mostra a eficácia do seu processo de resolução.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Card className="p-5 bg-danger-light border-danger-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-danger/20 rounded-lg">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-danger mb-1">Confirmadas como custo</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {confirmedCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  💼 Use para renegociar com marketplaces
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-orange-500/10 border-orange-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-500 mb-1">Em suporte aberto</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {supportOpenValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📨 {resolvedCount} casos resolvidos de {totalWithDifference} totais
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ========== BLOCO 2: MAPA DE DIFERENÇAS ========== */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Mapa de Diferenças</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Visualize onde estão as diferenças entre o previsto e o recebido. Diferenças não são erros — são oportunidades de entender seu fluxo financeiro.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {differencesByType.length > 0 ? (
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Distribuição por Tipo de Diferença
                </CardTitle>
                <CardDescription>
                  Por valor financeiro impactado • Total: R$ {differencesByType.reduce((s, d) => s + d.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </CardDescription>
              </CardHeader>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={differencesByType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={140} style={{ fontSize: 12 }} />
                  <ChartTooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill={COLORS.warning} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          ) : (
            <Card className="p-6 flex items-center justify-center h-[400px]">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success" />
                <p className="text-sm font-medium">Nenhuma diferença detectada!</p>
                <p className="text-xs mt-1">Todos os valores estão conferidos.</p>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-4 h-4" />
                Entenda as Diferenças
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg h-fit">
                    <DollarSign className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Taxa de intermediação</p>
                    <p className="text-xs text-muted-foreground">
                      Descontada pelo marketplace antes do repasse. É o custo da plataforma por vender através dela.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Antecipação</p>
                    <p className="text-xs text-muted-foreground">
                      Você optou por receber antes e o marketplace cobra uma taxa por isso. É como um empréstimo com desconto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex gap-3">
                  <div className="p-2 bg-danger/10 rounded-lg h-fit">
                    <AlertCircle className="w-4 h-4 text-danger" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Retenção</p>
                    <p className="text-xs text-muted-foreground">
                      Valor temporariamente bloqueado por disputa ou análise. Será liberado ou estornado no futuro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg h-fit">
                    <RefreshCcw className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">Devolução</p>
                    <p className="text-xs text-muted-foreground">
                      Cliente devolveu o produto e o valor foi estornado. Afeta o recebido, mas não o vendido.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ========== BLOCO 3: TENDÊNCIAS E CAUSAS ========== */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Tendências e Causas</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Acompanhe a evolução das diferenças ao longo do tempo e entenda os padrões do seu negócio.
        </p>

        {timelineData.length > 0 && (
          <Card className="p-6 mb-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg">Evolução: Previsto vs Recebido</CardTitle>
              <CardDescription>
                Diferença média do período: {avgDifference}% • Total de diferenças: R$ {totalDiferencas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </CardDescription>
            </CardHeader>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.ok} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.ok} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.difference} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.difference} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" style={{ fontSize: 11 }} />
                <YAxis style={{ fontSize: 11 }} />
                <ChartTooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="previsto" stroke={COLORS.ok} fillOpacity={1} fill="url(#colorPrevisto)" name="Previsto" strokeWidth={2} />
                <Area type="monotone" dataKey="recebido" stroke={COLORS.difference} fillOpacity={1} fill="url(#colorRecebido)" name="Recebido" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Diferenças Recorrentes
              </CardTitle>
              <CardDescription>Causas mais frequentes detectadas</CardDescription>
            </CardHeader>
            {recurringDifferences.length > 0 ? (
              <div className="space-y-3">
                {recurringDifferences.map((diff, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{diff.name}</p>
                      <p className="text-xs text-muted-foreground">{diff.count} ocorrências</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        R$ {diff.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma diferença recorrente detectada</p>
            )}
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Insights Inteligentes
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {reconciliationRate >= 80 && (
                <p className="text-sm text-foreground flex gap-2">
                  <span className="text-success">✓</span>
                  <span><strong>Excelente taxa de conferência!</strong> Com {reconciliationRate}% de conferências automáticas, seu fluxo de caixa está altamente previsível.</span>
                </p>
              )}
              {recoveredValue > 0 && (
                <p className="text-sm text-foreground flex gap-2">
                  <span className="text-success">💰</span>
                  <span><strong>R$ {recoveredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} recuperados</strong> — valores que não apareceriam sem a conciliação automática.</span>
                </p>
              )}
              {timeSaved > 5 && (
                <p className="text-sm text-foreground flex gap-2">
                  <span className="text-primary">⚡</span>
                  <span><strong>{timeSaved} horas economizadas</strong> neste período. Tempo que você pode usar para crescer o negócio.</span>
                </p>
              )}
              {Number(avgDifference) > 5 && (
                <p className="text-sm text-foreground flex gap-2">
                  <span className="text-warning">⚠️</span>
                  <span>Diferença média de <strong>{avgDifference}%</strong>. Considere revisar taxas e condições de pagamento com os marketplaces.</span>
                </p>
              )}
              {confirmedCostValue > 1000 && (
                <p className="text-sm text-foreground flex gap-2">
                  <span className="text-danger">📊</span>
                  <span><strong>R$ {confirmedCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em custos confirmados</strong>. Use esses dados para negociar melhores condições.</span>
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* ========== BLOCO 4: AÇÕES SUGERIDAS ========== */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Próximos Passos</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Ações recomendadas para melhorar ainda mais seus resultados de conciliação.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {totalWithDifference > resolvedCount && (
            <Card className="p-6 bg-warning-light border-warning-border hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-warning/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Resolver diferenças pendentes</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {totalWithDifference - resolvedCount} casos ainda não resolvidos
                  </p>
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Ver pedidos <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {supportOpenValue > 0 && (
            <Card className="p-6 bg-orange-500/10 border-orange-500/20 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-orange-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Acompanhar suportes abertos</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    R$ {supportOpenValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em análise
                  </p>
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Gerenciar <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {confirmedCostValue > 500 && (
            <Card className="p-6 bg-danger-light border-danger-border hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-danger/20 rounded-lg group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-danger" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Reclassificar custos</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Use dados para negociar com marketplaces
                  </p>
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    Exportar relatório <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 bg-primary/5 border-primary/20 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">Melhorar taxa de conferência</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Atualmente em {reconciliationRate}%
                </p>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Ver dicas <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-success-light border-success-border hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-success/20 rounded-lg group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">Automatizar baixas no ERP</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Elimine lançamentos manuais
                </p>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Ativar <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-500/10 border-blue-500/20 hover:shadow-lg transition-shadow cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">Comparar com período anterior</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Entenda a evolução do negócio
                </p>
                <Button size="sm" variant="outline" className="h-8 text-xs">
                  Comparar <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
export default DashboardCharts;