import { useState, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OrdersTable from "@/components/dashboard/OrdersTable";
import OrderDetailPanel from "@/components/dashboard/OrderDetailPanel";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardFilters, { type Filters } from "@/components/dashboard/DashboardFilters";
import ManagementSummary from "@/components/dashboard/ManagementSummary";

export type FinancialStatus = 
  | "released"           // 💸 Liberado - Valor recebido e disponível
  | "pending_release"    // ⏳ A liberar - Pagamento aprovado, mas ainda retido
  | "retained"           // 🔒 Retido - Valor bloqueado por disputa ou chargeback
  | "refunded"           // 🔁 Devolvido - Valor reembolsado ao cliente
  | "cancelled";         // 🚫 Cancelado - Venda cancelada antes do pagamento

export type ReconciliationStatus = 
  | "reconciled"         // ✅ Conferido - Valor confere
  | "difference_detected" // ⚠️ Diferença detectada - Valores diferentes mas explicável
  | "not_reconciled"     // ❌ Não conferido - Sem registro correspondente
  | "in_progress";       // ⏺️ Em conferência - Processo em execução

export interface Order {
  id: string;
  date: string;
  product: string;
  channel: string;
  soldValue: number;
  receivedValue: number;
  difference: number;
  financialStatus: FinancialStatus;
  reconciliationStatus: ReconciliationStatus;
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
  releaseDate?: string; // Data prevista de liberação
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
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
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
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#324053",
    date: "2025-01-09",
    product: "Relógio Casio",
    channel: "Mercado Livre",
    soldValue: 350.00,
    receivedValue: 0,
    difference: -350.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-01-12",
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
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
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
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
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
    financialStatus: "refunded",
    reconciliationStatus: "reconciled",
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
    financialStatus: "retained",
    reconciliationStatus: "reconciled",
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
    financialStatus: "cancelled",
    reconciliationStatus: "reconciled",
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
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
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
  const [currentView, setCurrentView] = useState<"table" | "charts" | "summary">("table");
  const [filters, setFilters] = useState<Filters>({
    mode: "sale_date",
    dateRange: { from: undefined, to: undefined },
    financialStatus: [],
    reconciliationStatus: [],
    categories: [],
    minDifference: null,
    paymentMethod: [],
  });

  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      // Filter by date range
      if (filters.dateRange.from || filters.dateRange.to) {
        const orderDate = new Date(order.date);
        if (filters.dateRange.from && orderDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && orderDate > filters.dateRange.to) return false;
      }

      // Filter by financial status
      if (filters.financialStatus.length > 0 && !filters.financialStatus.includes(order.financialStatus)) {
        return false;
      }

      // Filter by reconciliation status
      if (filters.reconciliationStatus.length > 0 && !filters.reconciliationStatus.includes(order.reconciliationStatus)) {
        return false;
      }

      // Filter by minimum difference
      if (filters.minDifference !== null && Math.abs(order.difference) < filters.minDifference) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const handleToggleView = () => {
    if (currentView === "table") {
      setCurrentView("charts");
    } else if (currentView === "charts") {
      setCurrentView("summary");
    } else {
      setCurrentView("table");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        onToggleView={handleToggleView}
        currentView={currentView}
        orders={filteredOrders}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {currentView === "summary" ? (
          <ManagementSummary orders={filteredOrders} />
        ) : currentView === "charts" ? (
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
