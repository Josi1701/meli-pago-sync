import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import type { Order } from "@/pages/Dashboard";

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
  // Calculate main causes of differences
  const causesData = [
    { name: "Taxas de intermediação", value: 45, color: COLORS.difference },
    { name: "Antecipação", value: 25, color: COLORS.warning },
    { name: "Retenções", value: 20, color: COLORS.retained },
    { name: "Devoluções", value: 10, color: COLORS.danger },
  ];

  // Timeline data (mock)
  const timelineData = [
    { date: "05/01", previsto: 5200, recebido: 5000 },
    { date: "06/01", previsto: 6800, recebido: 6650 },
    { date: "07/01", previsto: 4500, recebido: 4420 },
    { date: "08/01", previsto: 7200, recebido: 7100 },
    { date: "09/01", previsto: 5900, recebido: 5800 },
    { date: "10/01", previsto: 8100, recebido: 7950 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-success-light border-success-border">
          <div className="space-y-2">
            <p className="text-sm font-medium text-success">Lucro invisível recuperado</p>
            <p className="text-3xl font-bold text-foreground">R$ 1.240,00</p>
            <p className="text-sm text-muted-foreground">
              Diferenças identificadas e recuperadas automaticamente
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Tempo economizado</p>
            <p className="text-3xl font-bold text-foreground">12 horas</p>
            <p className="text-sm text-muted-foreground">
              Horas poupadas com automação este mês
            </p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Principais Causas de Diferença
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={causesData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.warning} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Evolução: Previsto vs Recebido
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `R$ ${value.toFixed(2)}`}
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
    </div>
  );
};

export default DashboardCharts;
