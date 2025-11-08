import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OrdersTable from "@/components/dashboard/OrdersTable";
import OrderDetailPanel from "@/components/dashboard/OrderDetailPanel";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export interface Order {
  id: string;
  date: string;
  product: string;
  channel: string;
  soldValue: number;
  receivedValue: number;
  difference: number;
  status: "ok" | "difference" | "pending" | "retained";
  fees?: Array<{
    name: string;
    percentage: number;
    value: number;
    origin: string;
  }>;
  explanation?: string;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "#324051",
    date: "2025-01-10",
    product: "Tênis Nike Air Max",
    channel: "Mercado Livre",
    soldValue: 150.00,
    receivedValue: 145.50,
    difference: -4.50,
    status: "difference",
    fees: [
      { name: "Intermediação", percentage: 2.99, value: 4.49, origin: "Mercado Pago" },
      { name: "Antecipação", percentage: 0.01, value: 0.01, origin: "Mercado Pago" },
    ],
    explanation: "O Mercado Pago aplicou tarifa de intermediação (2,99%) e antecipação (0,01%). Diferença de R$ 4,50 identificada automaticamente."
  },
  {
    id: "#324052",
    date: "2025-01-10",
    product: "Camiseta Adidas",
    channel: "Mercado Livre",
    soldValue: 200.00,
    receivedValue: 200.00,
    difference: 0,
    status: "ok",
  },
  {
    id: "#324053",
    date: "2025-01-09",
    product: "Relógio Casio",
    channel: "Mercado Livre",
    soldValue: 350.00,
    receivedValue: 0,
    difference: -350.00,
    status: "pending",
    explanation: "Pedido pago pelo cliente, aguardando liberação do marketplace."
  },
  {
    id: "#324054",
    date: "2025-01-09",
    product: "Fone JBL",
    channel: "Mercado Livre",
    soldValue: 120.00,
    receivedValue: 0,
    difference: -120.00,
    status: "retained",
    explanation: "Valor bloqueado por disputa aberta pelo comprador."
  },
  {
    id: "#324055",
    date: "2025-01-08",
    product: "Mochila Nike",
    channel: "Mercado Livre",
    soldValue: 180.00,
    receivedValue: 175.20,
    difference: -4.80,
    status: "difference",
    fees: [
      { name: "Intermediação", percentage: 2.67, value: 4.80, origin: "Mercado Pago" },
    ],
  },
];

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onToggleCharts={() => setShowCharts(!showCharts)} showCharts={showCharts} />
      
      <div className="container mx-auto p-6 space-y-6">
        {showCharts ? (
          <DashboardCharts orders={mockOrders} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OrdersTable 
                orders={mockOrders} 
                onSelectOrder={setSelectedOrder}
                selectedOrderId={selectedOrder?.id}
              />
            </div>
            <div className="lg:col-span-1">
              <OrderDetailPanel 
                order={selectedOrder} 
                onClose={() => setSelectedOrder(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
