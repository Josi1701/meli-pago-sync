import { useState, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OrdersTable from "@/components/dashboard/OrdersTable";
import OrderDetailPanel from "@/components/dashboard/OrderDetailPanel";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardFilters, { type Filters } from "@/components/dashboard/DashboardFilters";

export type OrderSituation = 
  | "active"
  | "cancelled_before_payment"
  | "refunded"
  | "partial_refund"
  | "in_dispute"
  | "chargeback";

export interface Order {
  id: string;
  date: string;
  product: string;
  channel: string;
  soldValue: number;
  receivedValue: number;
  difference: number;
  status: "ok" | "difference" | "pending" | "retained";
  situation?: OrderSituation;
  refund?: {
    amount: number;
    date: string;
    status: "completed" | "pending" | "in_process";
  };
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
    situation: "active",
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
    situation: "active",
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
    situation: "active",
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
    situation: "in_dispute",
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
    situation: "active",
    fees: [
      { name: "Intermediação", percentage: 2.67, value: 4.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324056",
    date: "2025-01-08",
    product: "Tênis Adidas Running",
    channel: "Mercado Livre",
    soldValue: 220.00,
    receivedValue: 0,
    difference: -220.00,
    status: "ok",
    situation: "refunded",
    refund: {
      amount: 220.00,
      date: "2025-01-12",
      status: "completed",
    },
    explanation: "Pedido devolvido — valor reembolsado ao comprador."
  },
  {
    id: "#324057",
    date: "2025-01-07",
    product: "Smartwatch Samsung",
    channel: "Mercado Livre",
    soldValue: 450.00,
    receivedValue: 0,
    difference: -450.00,
    status: "retained",
    situation: "chargeback",
    explanation: "Pagamento estornado pelo emissor do cartão. Valor perdido."
  },
  {
    id: "#324058",
    date: "2025-01-07",
    product: "Notebook Dell",
    channel: "Mercado Livre",
    soldValue: 3200.00,
    receivedValue: 0,
    difference: -3200.00,
    status: "ok",
    situation: "cancelled_before_payment",
    explanation: "Venda cancelada antes de gerar pagamento. Nenhum valor afetado."
  },
  {
    id: "#324059",
    date: "2025-01-06",
    product: "Fone Bluetooth JBL",
    channel: "Mercado Livre",
    soldValue: 280.00,
    receivedValue: 240.00,
    difference: -40.00,
    status: "difference",
    situation: "partial_refund",
    refund: {
      amount: 40.00,
      date: "2025-01-10",
      status: "completed",
    },
    explanation: "Parte do pedido foi devolvida, diferença de R$ 40."
  },
];

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    mode: "sale_date",
    dateRange: { from: undefined, to: undefined },
    status: [],
    categories: [],
    minDifference: null,
    paymentMethod: [],
    situation: [],
  });

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      // Filter by date range
      if (filters.dateRange.from || filters.dateRange.to) {
        const orderDate = new Date(order.date);
        if (filters.dateRange.from && orderDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && orderDate > filters.dateRange.to) return false;
      }

      // Filter by status
      if (filters.status.length > 0 && !filters.status.includes(order.status)) {
        return false;
      }

      // Filter by situation
      if (filters.situation.length > 0) {
        const orderSituation = order.situation || "active";
        if (!filters.situation.includes(orderSituation)) {
          return false;
        }
      }

      // Filter by minimum difference
      if (filters.minDifference !== null && Math.abs(order.difference) < filters.minDifference) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onToggleCharts={() => setShowCharts(!showCharts)} 
        showCharts={showCharts}
        orders={filteredOrders}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {showCharts ? (
          <DashboardCharts orders={filteredOrders} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DashboardFilters 
                filters={filters} 
                onFiltersChange={setFilters}
              />
              <OrdersTable 
                orders={filteredOrders} 
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
