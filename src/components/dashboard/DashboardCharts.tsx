import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import type { Order } from "@/pages/Dashboard";
import { TrendingUp, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from "lucide-react";

interface DashboardChartsProps {
  orders: Order[];
}

const COLORS = {
  ok: "hsl(var(--success))",
  difference: "hsl(var(--warning))",
  pending: "hsl(var(--neutral))",
  retained: "hsl(var(--danger))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--danger))",
};

const DashboardCharts = ({ orders }: DashboardChartsProps) => {
  // Calculate KPIs based on real data
  const recoveredValue = orders
    .filter(o => o.differenceStatus === "recovered")
    .reduce((sum, o) => sum + Math.abs(o.difference), 0);

  const confirmedCostValue = orders
    .filter(o => o.differenceStatus === "confirmed_cost")
    .reduce((sum, o) => sum + Math.abs(o.difference), 0);

  const supportOpenValue = orders
    .filter(o => o.differenceStatus === "support_open")
    .reduce((sum, o) => sum + Math.abs(o.difference), 0);

  const resolvedCount = orders.filter(
    o => o.differenceStatus === "recovered" || o.differenceStatus === "confirmed_cost"
  ).length;

  const totalWithDifference = orders.filter(o => o.difference !== 0).length;
  const reconciledAutomatically = orders.filter(o => o.reconciliationStatus === "reconciled").length;
  const timeSaved = Math.round((reconciledAutomatically * 0.25) * 10) / 10; // 15min per order

  const recoveryRate = recoveredValue + confirmedCostValue > 0
    ? Math.round((recoveredValue / (recoveredValue + confirmedCostValue)) * 100)
    : 0;

  // Financial status distribution with values
  const financialStatusData = [
    { 
      name: "Liberado", 
      count: orders.filter(o => o.financialStatus === "released").length,
      value: orders.filter(o => o.financialStatus === "released").reduce((s, o) => s + o.receivedValue, 0),
      color: COLORS.ok 
    },
    { 
      name: "A liberar", 
      count: orders.filter(o => o.financialStatus === "pending_release").length,
      value: orders.filter(o => o.financialStatus === "pending_release").reduce((s, o) => s + o.soldValue, 0),
      color: COLORS.pending 
    },
    { 
      name: "Retido", 
      count: orders.filter(o => o.financialStatus === "retained").length,
      value: orders.filter(o => o.financialStatus === "retained").reduce((s, o) => s + o.soldValue, 0),
      color: COLORS.retained 
    },
    { 
      name: "Devolvido", 
      count: orders.filter(o => o.financialStatus === "refunded").length,
      value: orders.filter(o => o.financialStatus === "refunded").reduce((s, o) => s + (o.refund?.amount || 0), 0),
      color: COLORS.warning 
    },
    { 
      name: "Cancelado", 
      count: orders.filter(o => o.financialStatus === "cancelled").length,
      value: 0,
      color: COLORS.danger 
    },
  ];

  // Reconciliation status distribution
  const reconciliationStatusData = [
    { 
      name: "Conferido", 
      value: orders.filter(o => o.reconciliationStatus === "reconciled").length, 
      color: COLORS.ok 
    },
    { 
      name: "Diferença", 
      value: orders.filter(o => o.reconciliationStatus === "difference_detected").length, 
      color: COLORS.difference 
    },
    { 
      name: "Não conferido", 
      value: orders.filter(o => o.reconciliationStatus === "not_reconciled").length, 
      color: COLORS.danger 
    },
    { 
      name: "Em conferência", 
      value: orders.filter(o => o.reconciliationStatus === "in_progress").length, 
      color: COLORS.warning 
    },
  ];

  const financialTotal = financialStatusData.reduce((sum, d) => sum + d.count, 0);
  const reconciliationTotal = reconciliationStatusData.reduce((sum, d) => sum + d.value, 0);

  // Calculate real causes from order fees
  const causesByValue = orders
    .filter(o => o.fees && o.fees.length > 0)
    .flatMap(o => o.fees!)
    .reduce((acc, fee) => {
      const existing = acc.find(c => c.name === fee.name);
      if (existing) {
        existing.value += fee.value;
      } else {
        acc.push({ name: fee.name, value: fee.value });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Resolution results data
  const resolutionData = [
    { name: "Recuperado", value: recoveredValue, color: COLORS.ok },
    { name: "Custo confirmado", value: confirmedCostValue, color: COLORS.danger },
    { name: "Em suporte", value: supportOpenValue, color: COLORS.warning },
  ].filter(d => d.value > 0);

  // Timeline data (group by week)
  const timelineData = orders
    .reduce((acc, order) => {
      const date = new Date(order.date);
      const weekKey = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const existing = acc.find(d => d.date === weekKey);
      if (existing) {
        existing.previsto += order.soldValue;
        existing.recebido += order.receivedValue;
      } else {
        acc.push({
          date: weekKey,
          previsto: order.soldValue,
          recebido: order.receivedValue,
        });
      }
      return acc;
    }, [] as { date: string; previsto: number; recebido: number }[])
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    })
    .slice(-10);

  const totalPrevisto = timelineData.reduce((s, d) => s + d.previsto, 0);
  const totalRecebido = timelineData.reduce((s, d) => s + d.recebido, 0);
  const avgDifference = totalPrevisto > 0 
    ? ((totalPrevisto - totalRecebido) / totalPrevisto * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Performance KPIs */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">💼 Resultados da Conciliação Automática</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 bg-success-light border-success-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-success mb-1">Lucro invisível recuperado</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {recoveredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  💸 Dinheiro que voltou para o caixa
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary mb-1">Tempo economizado</p>
                <p className="text-2xl font-bold text-foreground">{timeSaved}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  🕒 {reconciledAutomatically} pedidos conciliados automaticamente
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-blue-500/10 border-blue-500/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-500 mb-1">Diferenças resolvidas</p>
                <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  de {totalWithDifference} casos de diferença
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-danger-light border-danger-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-danger/20 rounded-lg">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-danger mb-1">Confirmadas como custo</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {confirmedCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  💔 Impacto financeiro confirmado
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-warning-light border-warning-border">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-warning mb-1">Taxa de recuperação</p>
                <p className="text-2xl font-bold text-foreground">{recoveryRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  📈 Eficiência da conciliação
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
                  R$ {supportOpenValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  📨 Sendo investigado
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Financial Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Distribuição por Status Financeiro
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {financialStatusData[0]?.count > 0 && 
              `${Math.round((financialStatusData[0].count / financialTotal) * 100)}% dos pedidos já liberados`
            }
          </p>
          {financialTotal > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialStatusData} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const item = financialStatusData.find(d => d.name === name);
                    return [
                      `${value} pedidos - R$ ${item?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                      name
                    ];
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {financialStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Sem dados para o período
            </div>
          )}
        </Card>

        {/* Reconciliation Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Distribuição por Status de Conciliação
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {reconciliationTotal > 0 && reconciledAutomatically > 0 &&
              `Taxa de conferência automática: ${Math.round((reconciledAutomatically / reconciliationTotal) * 100)}%`
            }
          </p>
          {reconciliationTotal > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reconciliationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${Number.isFinite(percent) ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reconciliationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Sem dados para o período
            </div>
          )}
        </Card>

        {/* Main Causes of Differences */}
        {causesByValue.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Principais Causas de Diferença
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Por valor financeiro impactado
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={causesByValue} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip 
                  formatter={(value: number) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Bar dataKey="value" fill={COLORS.warning} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Resolution Results */}
        {resolutionData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Resultados de Resolução
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {recoveryRate > 0 && `${recoveryRate}% das diferenças foram recuperadas`}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resolutionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Timeline Chart */}
      {timelineData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Evolução: Previsto vs Recebido
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Diferença média do período: {avgDifference}%
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="previsto" 
                stroke={COLORS.ok} 
                strokeWidth={2}
                name="Previsto"
              />
              <Line 
                type="monotone" 
                dataKey="recebido" 
                stroke={COLORS.difference} 
                strokeWidth={2}
                name="Recebido"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Impact Messages */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground mb-3">💡 Insights de Impacto</h3>
          {recoveredValue > 0 && (
            <p className="text-sm text-foreground">
              💸 <strong>Você já recuperou R$ {recoveredValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> de valores que passariam despercebidos.
            </p>
          )}
          {timeSaved > 0 && (
            <p className="text-sm text-foreground">
              🕒 <strong>Economizou {timeSaved} horas</strong> de trabalho manual neste período.
            </p>
          )}
          {resolvedCount > 0 && totalWithDifference > 0 && (
            <p className="text-sm text-foreground">
              📊 <strong>{Math.round((resolvedCount / totalWithDifference) * 100)}% das diferenças foram resolvidas</strong> — ótimo índice de eficiência!
            </p>
          )}
          {supportOpenValue > 0 && (
            <p className="text-sm text-foreground">
              ⚠️ <strong>R$ {supportOpenValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ainda em suporte aberto</strong>, acompanhe o andamento.
            </p>
          )}
          {confirmedCostValue > 0 && (
            <p className="text-sm text-foreground">
              ❤️ <strong>R$ {confirmedCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} confirmados como custo</strong> — use esse dado para renegociar taxas.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardCharts;
