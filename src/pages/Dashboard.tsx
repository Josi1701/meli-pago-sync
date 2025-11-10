import { useState, useMemo } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OrdersTable from "@/components/dashboard/OrdersTable";
import OrderDetailPanel from "@/components/dashboard/OrderDetailPanel";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardFilters, { type Filters } from "@/components/dashboard/DashboardFilters";
import ManagementSummary from "@/components/dashboard/ManagementSummary";
import FinancialAutomationCTA from "@/components/dashboard/FinancialAutomationCTA";
import { toast } from "@/hooks/use-toast";

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

export type DifferenceStatus = 
  | "detected"           // ⚠️ Diferença detectada
  | "support_open"       // 📨 Suporte aberto
  | "recovered"          // ✅ Valor recuperado
  | "confirmed_cost"     // ❌ Custo confirmado
  | null;                // Sem diferença

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
  releaseDate?: string;
  differenceStatus?: DifferenceStatus;
  supportOpenedAt?: string;
  supportDescription?: string;
  resolvedAt?: string;
}

// Mock data - Expanded dataset for management summary validation
const mockOrders: Order[] = [
  // Novembro 2025 - Semana 4
  {
    id: "#334001",
    date: "2025-11-28",
    product: "Smart TV LG 65\" OLED",
    channel: "Mercado Livre",
    soldValue: 5200.00,
    receivedValue: 5064.80,
    difference: -135.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-12-05",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 135.20, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#334002",
    date: "2025-11-27",
    product: "iPhone 15 Pro Max 256GB",
    channel: "Mercado Livre",
    soldValue: 7800.00,
    receivedValue: 7800.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-12-04",
  },
  {
    id: "#334003",
    date: "2025-11-26",
    product: "MacBook Air M3",
    channel: "Mercado Livre",
    soldValue: 9500.00,
    receivedValue: 0,
    difference: -9500.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-12-08",
    explanation: "Pedido pago pelo cliente, aguardando liberação do marketplace."
  },
  {
    id: "#334004",
    date: "2025-11-25",
    product: "Geladeira Samsung Side by Side",
    channel: "Mercado Livre",
    soldValue: 4200.00,
    receivedValue: 0,
    difference: -4200.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Valor bloqueado por disputa aberta pelo comprador."
  },
  {
    id: "#334005",
    date: "2025-11-24",
    product: "Notebook Asus ROG",
    channel: "Mercado Livre",
    soldValue: 6800.00,
    receivedValue: 6623.20,
    difference: -176.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-12-01",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 176.80, origin: "Mercado Pago" },
    ],
  },
  // Novembro 2025 - Semana 3
  {
    id: "#334006",
    date: "2025-11-20",
    product: "PlayStation 5 Slim Digital",
    channel: "Mercado Livre",
    soldValue: 3800.00,
    receivedValue: 0,
    difference: -3800.00,
    financialStatus: "refunded",
    reconciliationStatus: "reconciled",
    refund: {
      amount: 3800.00,
      date: "2025-11-25",
      status: "completed",
    },
    explanation: "Pedido devolvido — valor reembolsado ao comprador."
  },
  {
    id: "#334007",
    date: "2025-11-19",
    product: "Apple Watch Ultra 2",
    channel: "Mercado Livre",
    soldValue: 6500.00,
    receivedValue: 6331.00,
    difference: -169.00,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-26",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 169.00, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#334008",
    date: "2025-11-18",
    product: "iPad Pro 12.9\" M2",
    channel: "Mercado Livre",
    soldValue: 8200.00,
    receivedValue: 8200.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-11-25",
  },
  {
    id: "#334009",
    date: "2025-11-17",
    product: "Monitor LG UltraWide 34\"",
    channel: "Mercado Livre",
    soldValue: 2800.00,
    receivedValue: 0,
    difference: -2800.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-11-28",
  },
  {
    id: "#334010",
    date: "2025-11-16",
    product: "Cadeira Herman Miller",
    channel: "Mercado Livre",
    soldValue: 5200.00,
    receivedValue: 5064.80,
    difference: -135.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-23",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 135.20, origin: "Mercado Pago" },
    ],
  },
  // Novembro 2025 - Semana 2
  {
    id: "#334011",
    date: "2025-11-13",
    product: "Galaxy Z Fold 5",
    channel: "Mercado Livre",
    soldValue: 8900.00,
    receivedValue: 0,
    difference: -8900.00,
    financialStatus: "cancelled",
    reconciliationStatus: "reconciled",
    explanation: "Venda cancelada antes de gerar pagamento. Nenhum valor afetado."
  },
  {
    id: "#334012",
    date: "2025-11-12",
    product: "AirPods Pro 3",
    channel: "Mercado Livre",
    soldValue: 2200.00,
    receivedValue: 1800.00,
    difference: -400.00,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-19",
    refund: {
      amount: 400.00,
      date: "2025-11-16",
      status: "completed",
    },
    explanation: "Parte do pedido foi devolvida, diferença de R$ 400."
  },
  {
    id: "#334013",
    date: "2025-11-11",
    product: "Camera Sony Alpha A7 IV",
    channel: "Mercado Livre",
    soldValue: 12500.00,
    receivedValue: 12175.00,
    difference: -325.00,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-18",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 325.00, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#334014",
    date: "2025-11-10",
    product: "Drone DJI Mavic 3 Pro",
    channel: "Mercado Livre",
    soldValue: 9800.00,
    receivedValue: 9800.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-11-17",
  },
  {
    id: "#334015",
    date: "2025-11-09",
    product: "Home Theater Samsung",
    channel: "Mercado Livre",
    soldValue: 2400.00,
    receivedValue: 0,
    difference: -2400.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Disputa do comprador em análise."
  },
  // Novembro 2025 - Semana 1
  {
    id: "#334016",
    date: "2025-11-06",
    product: "Mesa Digitalizadora Wacom",
    channel: "Mercado Livre",
    soldValue: 3200.00,
    receivedValue: 3116.80,
    difference: -83.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-13",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 83.20, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#334017",
    date: "2025-11-05",
    product: "Microfone Shure SM7B",
    channel: "Mercado Livre",
    soldValue: 2800.00,
    receivedValue: 2800.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-11-12",
  },
  {
    id: "#334018",
    date: "2025-11-04",
    product: "Placa de Vídeo RTX 4080",
    channel: "Mercado Livre",
    soldValue: 7200.00,
    receivedValue: 0,
    difference: -7200.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-11-18",
  },
  {
    id: "#334019",
    date: "2025-11-03",
    product: "Processador Intel i9-14900K",
    channel: "Mercado Livre",
    soldValue: 3800.00,
    receivedValue: 3701.20,
    difference: -98.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-10",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 98.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#334020",
    date: "2025-11-02",
    product: "SSD Samsung 990 Pro 2TB",
    channel: "Mercado Livre",
    soldValue: 1400.00,
    receivedValue: 1400.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-11-09",
  },

  // Outubro 2025 - Semana 4
  {
    id: "#333001",
    date: "2025-10-29",
    product: "Notebook Dell XPS 15",
    channel: "Mercado Livre",
    soldValue: 8500.00,
    receivedValue: 8279.00,
    difference: -221.00,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-05",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 221.00, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#333002",
    date: "2025-10-28",
    product: "iPhone 15 Pro 128GB",
    channel: "Mercado Livre",
    soldValue: 6800.00,
    receivedValue: 6800.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-11-04",
  },
  {
    id: "#333003",
    date: "2025-10-27",
    product: "Galaxy S24 Ultra",
    channel: "Mercado Livre",
    soldValue: 6200.00,
    receivedValue: 0,
    difference: -6200.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-11-08",
    explanation: "Pedido pago pelo cliente, aguardando liberação do marketplace."
  },
  {
    id: "#333004",
    date: "2025-10-26",
    product: "Xbox Series X",
    channel: "Mercado Livre",
    soldValue: 3600.00,
    receivedValue: 0,
    difference: -3600.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Valor bloqueado por disputa aberta pelo comprador."
  },
  {
    id: "#333005",
    date: "2025-10-25",
    product: "Smart TV Samsung 55\" QLED",
    channel: "Mercado Livre",
    soldValue: 3800.00,
    receivedValue: 3701.20,
    difference: -98.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-11-01",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 98.80, origin: "Mercado Pago" },
    ],
  },
  // Outubro 2025 - Semana 3
  {
    id: "#333006",
    date: "2025-10-22",
    product: "Apple Watch Series 10",
    channel: "Mercado Livre",
    soldValue: 4200.00,
    receivedValue: 0,
    difference: -4200.00,
    financialStatus: "refunded",
    reconciliationStatus: "reconciled",
    refund: {
      amount: 4200.00,
      date: "2025-10-28",
      status: "completed",
    },
    explanation: "Pedido devolvido — valor reembolsado ao comprador."
  },
  {
    id: "#333007",
    date: "2025-10-21",
    product: "AirPods Max",
    channel: "Mercado Livre",
    soldValue: 4800.00,
    receivedValue: 4675.20,
    difference: -124.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-28",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 124.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#333008",
    date: "2025-10-20",
    product: "iPad Air M2",
    channel: "Mercado Livre",
    soldValue: 5200.00,
    receivedValue: 5200.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-10-27",
  },
  {
    id: "#333009",
    date: "2025-10-19",
    product: "Monitor Dell UltraSharp 32\"",
    channel: "Mercado Livre",
    soldValue: 3200.00,
    receivedValue: 0,
    difference: -3200.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-10-30",
  },
  {
    id: "#333010",
    date: "2025-10-18",
    product: "Teclado Mecânico Keychron K8",
    channel: "Mercado Livre",
    soldValue: 780.00,
    receivedValue: 759.48,
    difference: -20.52,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-25",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 20.28, origin: "Mercado Pago" },
    ],
  },
  // Outubro 2025 - Semana 2
  {
    id: "#333011",
    date: "2025-10-15",
    product: "Mouse Logitech MX Master 3S",
    channel: "Mercado Livre",
    soldValue: 520.00,
    receivedValue: 0,
    difference: -520.00,
    financialStatus: "cancelled",
    reconciliationStatus: "reconciled",
    explanation: "Venda cancelada antes de gerar pagamento. Nenhum valor afetado."
  },
  {
    id: "#333012",
    date: "2025-10-14",
    product: "Webcam Logitech Brio 4K",
    channel: "Mercado Livre",
    soldValue: 1400.00,
    receivedValue: 1000.00,
    difference: -400.00,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-21",
    refund: {
      amount: 400.00,
      date: "2025-10-18",
      status: "completed",
    },
    explanation: "Parte do pedido foi devolvida, diferença de R$ 400."
  },
  {
    id: "#333013",
    date: "2025-10-13",
    product: "SSD Western Digital 4TB",
    channel: "Mercado Livre",
    soldValue: 2400.00,
    receivedValue: 2337.60,
    difference: -62.40,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-20",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 62.40, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#333014",
    date: "2025-10-12",
    product: "Memória RAM Corsair 64GB",
    channel: "Mercado Livre",
    soldValue: 1800.00,
    receivedValue: 1800.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-10-19",
  },
  {
    id: "#333015",
    date: "2025-10-11",
    product: "Fonte Corsair 1000W",
    channel: "Mercado Livre",
    soldValue: 1200.00,
    receivedValue: 0,
    difference: -1200.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Disputa do comprador em análise."
  },
  // Outubro 2025 - Semana 1
  {
    id: "#333016",
    date: "2025-10-08",
    product: "Gabinete NZXT H7 Flow",
    channel: "Mercado Livre",
    soldValue: 980.00,
    receivedValue: 954.52,
    difference: -25.48,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-15",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 25.48, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#333017",
    date: "2025-10-07",
    product: "Cooler Noctua NH-D15",
    channel: "Mercado Livre",
    soldValue: 680.00,
    receivedValue: 680.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-10-14",
  },
  {
    id: "#333018",
    date: "2025-10-06",
    product: "Placa-Mãe ASUS ROG",
    channel: "Mercado Livre",
    soldValue: 2800.00,
    receivedValue: 0,
    difference: -2800.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-10-20",
  },
  {
    id: "#333019",
    date: "2025-10-05",
    product: "Headset SteelSeries Arctis Pro",
    channel: "Mercado Livre",
    soldValue: 1600.00,
    receivedValue: 1558.40,
    difference: -41.60,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-12",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 41.60, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#333020",
    date: "2025-10-04",
    product: "Caixa de Som JBL Flip 6",
    channel: "Mercado Livre",
    soldValue: 720.00,
    receivedValue: 720.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-10-11",
  },
  {
    id: "#333021",
    date: "2025-10-03",
    product: "Ring Light Profissional",
    channel: "Mercado Livre",
    soldValue: 380.00,
    receivedValue: 370.12,
    difference: -9.88,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-10",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 9.88, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#333022",
    date: "2025-10-02",
    product: "Tripé Manfrotto",
    channel: "Mercado Livre",
    soldValue: 890.00,
    receivedValue: 890.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
    releaseDate: "2025-10-09",
  },
  {
    id: "#333023",
    date: "2025-10-01",
    product: "Gimbal DJI RS 3",
    channel: "Mercado Livre",
    soldValue: 3200.00,
    receivedValue: 3116.80,
    difference: -83.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    releaseDate: "2025-10-08",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 83.20, origin: "Mercado Pago" },
    ],
  },

  // Janeiro 2025 - Semana 2
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
    releaseDate: "2025-01-17",
    differenceStatus: "detected",
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
    releaseDate: "2025-01-17",
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
  // Janeiro 2025 - Semana 1
  {
    id: "#324060",
    date: "2025-01-05",
    product: "Mouse Logitech MX Master",
    channel: "Mercado Livre",
    soldValue: 450.00,
    receivedValue: 438.30,
    difference: -11.70,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 11.70, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324061",
    date: "2025-01-05",
    product: "Teclado Mecânico Razer",
    channel: "Mercado Livre",
    soldValue: 680.00,
    receivedValue: 680.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#324062",
    date: "2025-01-04",
    product: "Monitor Samsung 27\"",
    channel: "Mercado Livre",
    soldValue: 1200.00,
    receivedValue: 0,
    difference: -1200.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-01-15",
  },
  {
    id: "#324063",
    date: "2025-01-04",
    product: "Cadeira Gamer",
    channel: "Mercado Livre",
    soldValue: 890.00,
    receivedValue: 865.70,
    difference: -24.30,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.73, value: 24.30, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324064",
    date: "2025-01-03",
    product: "Webcam Logitech C920",
    channel: "Mercado Livre",
    soldValue: 550.00,
    receivedValue: 550.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#324065",
    date: "2025-01-03",
    product: "Headset HyperX Cloud",
    channel: "Mercado Livre",
    soldValue: 320.00,
    receivedValue: 0,
    difference: -320.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Disputa do comprador em análise."
  },
  {
    id: "#324066",
    date: "2025-01-02",
    product: "SSD Samsung 1TB",
    channel: "Mercado Livre",
    soldValue: 480.00,
    receivedValue: 467.52,
    difference: -12.48,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 12.48, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324067",
    date: "2025-01-02",
    product: "Placa de Vídeo RTX 3060",
    channel: "Mercado Livre",
    soldValue: 2400.00,
    receivedValue: 0,
    difference: -2400.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-01-20",
  },
  {
    id: "#324068",
    date: "2025-01-01",
    product: "Processador AMD Ryzen 7",
    channel: "Mercado Livre",
    soldValue: 1800.00,
    receivedValue: 1753.20,
    difference: -46.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 46.80, origin: "Mercado Pago" },
    ],
  },

  // Dezembro 2024 - Final do mês
  {
    id: "#323950",
    date: "2024-12-30",
    product: "Smartphone Samsung Galaxy S23",
    channel: "Mercado Livre",
    soldValue: 2800.00,
    receivedValue: 2727.20,
    difference: -72.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 72.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323951",
    date: "2024-12-30",
    product: "Tablet iPad 10th Gen",
    channel: "Mercado Livre",
    soldValue: 3500.00,
    receivedValue: 3500.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323952",
    date: "2024-12-29",
    product: "MacBook Pro M2",
    channel: "Mercado Livre",
    soldValue: 12000.00,
    receivedValue: 0,
    difference: -12000.00,
    financialStatus: "refunded",
    reconciliationStatus: "reconciled",
    refund: {
      amount: 12000.00,
      date: "2025-01-05",
      status: "completed",
    },
    explanation: "Cliente desistiu da compra dentro do prazo de arrependimento."
  },
  {
    id: "#323953",
    date: "2024-12-28",
    product: "AirPods Pro 2",
    channel: "Mercado Livre",
    soldValue: 1800.00,
    receivedValue: 1753.20,
    difference: -46.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 46.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323954",
    date: "2024-12-28",
    product: "Apple Watch Series 9",
    channel: "Mercado Livre",
    soldValue: 3200.00,
    receivedValue: 3200.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323955",
    date: "2024-12-27",
    product: "Console PlayStation 5",
    channel: "Mercado Livre",
    soldValue: 4200.00,
    receivedValue: 0,
    difference: -4200.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-01-08",
  },
  {
    id: "#323956",
    date: "2024-12-26",
    product: "Xbox Series X",
    channel: "Mercado Livre",
    soldValue: 3800.00,
    receivedValue: 0,
    difference: -3800.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Pagamento retido para análise de segurança."
  },
  {
    id: "#323957",
    date: "2024-12-25",
    product: "Nintendo Switch OLED",
    channel: "Mercado Livre",
    soldValue: 2200.00,
    receivedValue: 2142.80,
    difference: -57.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 57.20, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323958",
    date: "2024-12-24",
    product: "TV Samsung 55\" 4K",
    channel: "Mercado Livre",
    soldValue: 2800.00,
    receivedValue: 2800.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323959",
    date: "2024-12-23",
    product: "Soundbar JBL 5.1",
    channel: "Mercado Livre",
    soldValue: 1600.00,
    receivedValue: 1558.40,
    difference: -41.60,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 41.60, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323960",
    date: "2024-12-22",
    product: "Geladeira Brastemp Frost Free",
    channel: "Mercado Livre",
    soldValue: 3200.00,
    receivedValue: 0,
    difference: -3200.00,
    financialStatus: "cancelled",
    reconciliationStatus: "reconciled",
    explanation: "Venda cancelada por falta de estoque."
  },
  {
    id: "#323961",
    date: "2024-12-21",
    product: "Fogão 5 Bocas Electrolux",
    channel: "Mercado Livre",
    soldValue: 1800.00,
    receivedValue: 1753.20,
    difference: -46.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 46.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323962",
    date: "2024-12-20",
    product: "Microondas Panasonic 32L",
    channel: "Mercado Livre",
    soldValue: 680.00,
    receivedValue: 680.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323963",
    date: "2024-12-19",
    product: "Liquidificador Philips Walita",
    channel: "Mercado Livre",
    soldValue: 420.00,
    receivedValue: 409.08,
    difference: -10.92,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 10.92, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323964",
    date: "2024-12-18",
    product: "Aspirador de Pó Electrolux",
    channel: "Mercado Livre",
    soldValue: 890.00,
    receivedValue: 0,
    difference: -890.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-01-02",
  },
  {
    id: "#323965",
    date: "2024-12-17",
    product: "Ferro de Passar Black+Decker",
    channel: "Mercado Livre",
    soldValue: 220.00,
    receivedValue: 220.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323966",
    date: "2024-12-16",
    product: "Cafeteira Nespresso",
    channel: "Mercado Livre",
    soldValue: 750.00,
    receivedValue: 0,
    difference: -750.00,
    financialStatus: "refunded",
    reconciliationStatus: "reconciled",
    refund: {
      amount: 750.00,
      date: "2024-12-20",
      status: "completed",
    },
    explanation: "Produto com defeito, devolução autorizada."
  },
  {
    id: "#323967",
    date: "2024-12-15",
    product: "Batedeira Planetária KitchenAid",
    channel: "Mercado Livre",
    soldValue: 1200.00,
    receivedValue: 1168.80,
    difference: -31.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 31.20, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323968",
    date: "2024-12-14",
    product: "Air Fryer Philco 7L",
    channel: "Mercado Livre",
    soldValue: 580.00,
    receivedValue: 580.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323969",
    date: "2024-12-13",
    product: "Purificador de Água IBBL",
    channel: "Mercado Livre",
    soldValue: 920.00,
    receivedValue: 896.08,
    difference: -23.92,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 23.92, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323970",
    date: "2024-12-12",
    product: "Ventilador de Coluna Arno",
    channel: "Mercado Livre",
    soldValue: 320.00,
    receivedValue: 0,
    difference: -320.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Chargeback em análise pelo banco emissor."
  },
  {
    id: "#323971",
    date: "2024-12-11",
    product: "Ar Condicionado Split 12000 BTUs",
    channel: "Mercado Livre",
    soldValue: 2200.00,
    receivedValue: 2142.80,
    difference: -57.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 57.20, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323972",
    date: "2024-12-10",
    product: "Aquecedor Elétrico Cadence",
    channel: "Mercado Livre",
    soldValue: 280.00,
    receivedValue: 280.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323973",
    date: "2024-12-09",
    product: "Umidificador de Ar Multilaser",
    channel: "Mercado Livre",
    soldValue: 180.00,
    receivedValue: 175.32,
    difference: -4.68,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 4.68, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323974",
    date: "2024-12-08",
    product: "Fritadeira Elétrica Mondial",
    channel: "Mercado Livre",
    soldValue: 450.00,
    receivedValue: 0,
    difference: -450.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2024-12-28",
  },
  {
    id: "#323975",
    date: "2024-12-07",
    product: "Churrasqueira Elétrica Cadence",
    channel: "Mercado Livre",
    soldValue: 520.00,
    receivedValue: 520.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  // Mais pedidos em Dezembro 2024
  {
    id: "#323976",
    date: "2024-12-06",
    product: "Notebook Lenovo IdeaPad",
    channel: "Mercado Livre",
    soldValue: 2500.00,
    receivedValue: 2435.00,
    difference: -65.00,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 65.00, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323977",
    date: "2024-12-05",
    product: "Impressora HP LaserJet",
    channel: "Mercado Livre",
    soldValue: 1200.00,
    receivedValue: 1200.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#323978",
    date: "2024-12-04",
    product: "Câmera Canon EOS Rebel",
    channel: "Mercado Livre",
    soldValue: 3800.00,
    receivedValue: 0,
    difference: -3800.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2024-12-25",
  },
  {
    id: "#323979",
    date: "2024-12-03",
    product: "Drone DJI Mini 3",
    channel: "Mercado Livre",
    soldValue: 2800.00,
    receivedValue: 0,
    difference: -2800.00,
    financialStatus: "refunded",
    reconciliationStatus: "reconciled",
    refund: {
      amount: 2800.00,
      date: "2024-12-10",
      status: "completed",
    },
    explanation: "Cliente solicitou cancelamento após pagamento."
  },
  {
    id: "#323980",
    date: "2024-12-02",
    product: "GoPro Hero 11",
    channel: "Mercado Livre",
    soldValue: 2200.00,
    receivedValue: 2142.80,
    difference: -57.20,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 57.20, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#323981",
    date: "2024-12-01",
    product: "Estabilizador DJI Osmo Mobile",
    channel: "Mercado Livre",
    soldValue: 800.00,
    receivedValue: 0,
    difference: -800.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Pagamento em análise de segurança."
  },
  // Mais pedidos em Janeiro 2025
  {
    id: "#324069",
    date: "2025-01-15",
    product: "Bicicleta Caloi Elite",
    channel: "Mercado Livre",
    soldValue: 1800.00,
    receivedValue: 1753.20,
    difference: -46.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 46.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324070",
    date: "2025-01-15",
    product: "Patinete Elétrico Xiaomi",
    channel: "Mercado Livre",
    soldValue: 2400.00,
    receivedValue: 2400.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#324071",
    date: "2025-01-14",
    product: "Capacete de Ciclismo Giro",
    channel: "Mercado Livre",
    soldValue: 350.00,
    receivedValue: 0,
    difference: -350.00,
    financialStatus: "pending_release",
    reconciliationStatus: "in_progress",
    releaseDate: "2025-01-25",
  },
  {
    id: "#324072",
    date: "2025-01-14",
    product: "Luvas de Ciclismo Specialized",
    channel: "Mercado Livre",
    soldValue: 180.00,
    receivedValue: 175.32,
    difference: -4.68,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 4.68, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324073",
    date: "2025-01-13",
    product: "Tênis de Corrida Asics",
    channel: "Mercado Livre",
    soldValue: 480.00,
    receivedValue: 0,
    difference: -480.00,
    financialStatus: "refunded",
    reconciliationStatus: "reconciled",
    refund: {
      amount: 480.00,
      date: "2025-01-16",
      status: "completed",
    },
    explanation: "Produto com defeito de fabricação."
  },
  {
    id: "#324074",
    date: "2025-01-13",
    product: "Bola de Futebol Nike",
    channel: "Mercado Livre",
    soldValue: 220.00,
    receivedValue: 220.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
  {
    id: "#324075",
    date: "2025-01-12",
    product: "Raquete de Tênis Wilson",
    channel: "Mercado Livre",
    soldValue: 680.00,
    receivedValue: 0,
    difference: -680.00,
    financialStatus: "retained",
    reconciliationStatus: "not_reconciled",
    explanation: "Contestação do pagamento pelo cliente."
  },
  {
    id: "#324076",
    date: "2025-01-12",
    product: "Kit de Alteres 20kg",
    channel: "Mercado Livre",
    soldValue: 320.00,
    receivedValue: 311.68,
    difference: -8.32,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 8.32, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324077",
    date: "2025-01-11",
    product: "Esteira Ergométrica Dream",
    channel: "Mercado Livre",
    soldValue: 1800.00,
    receivedValue: 1753.20,
    difference: -46.80,
    financialStatus: "released",
    reconciliationStatus: "difference_detected",
    fees: [
      { name: "Intermediação", percentage: 2.6, value: 46.80, origin: "Mercado Pago" },
    ],
  },
  {
    id: "#324078",
    date: "2025-01-11",
    product: "Bicicleta Ergométrica Kikos",
    channel: "Mercado Livre",
    soldValue: 950.00,
    receivedValue: 950.00,
    difference: 0,
    financialStatus: "released",
    reconciliationStatus: "reconciled",
  },
];

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const handleOpenSupport = (orderId: string, description: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              differenceStatus: "support_open" as DifferenceStatus,
              supportOpenedAt: new Date().toISOString(),
              supportDescription: description
            }
          : order
      )
    );
    toast({
      title: "Suporte aberto",
      description: "Acompanhe a resolução deste valor.",
    });
  };

  const handleMarkAsRecovered = (orderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              differenceStatus: "recovered" as DifferenceStatus,
              resolvedAt: new Date().toISOString()
            }
          : order
      )
    );
    toast({
      title: "✅ Valor recuperado",
      description: "A diferença foi registrada como recuperada.",
      variant: "default",
    });
  };

  const handleConfirmCost = (orderId: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              differenceStatus: "confirmed_cost" as DifferenceStatus,
              resolvedAt: new Date().toISOString()
            }
          : order
      )
    );
    toast({
      title: "❌ Custo confirmado",
      description: "A diferença foi registrada como custo.",
      variant: "destructive",
    });
  };
  const [currentView, setCurrentView] = useState<"table" | "charts" | "summary">("table");
  
  // Default to current month and payment_date mode
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);
  
  const currentMonthEnd = new Date();
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
  currentMonthEnd.setDate(0);
  currentMonthEnd.setHours(23, 59, 59, 999);
  
  const [filters, setFilters] = useState<Filters>({
    mode: "payment_date",
    dateRange: { from: currentMonthStart, to: currentMonthEnd },
    financialStatus: [],
    reconciliationStatus: [],
    categories: [],
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filter by date range based on mode
      if (filters.dateRange.from || filters.dateRange.to) {
        let orderDate: Date;
        
        if (filters.mode === "payment_date") {
          // For payment_date mode:
          // - Use releaseDate if explicitly set
          // - For "released" status without releaseDate, assume it was released (use sale date + 7 days as estimate)
          // - For other statuses without releaseDate, exclude them
          if (order.releaseDate) {
            orderDate = new Date(order.releaseDate);
          } else if (order.financialStatus === "released") {
            // Estimate: released 7 days after sale
            orderDate = new Date(order.date);
            orderDate.setDate(orderDate.getDate() + 7);
          } else {
            // Not released yet, exclude from payment_date view
            return false;
          }
        } else {
          // For sale_date mode, use the sale date
          orderDate = new Date(order.date);
        }
        
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

      return true;
    });
  }, [filters, orders]);

  const handleToggleView = () => {
    if (currentView === "table") {
      setCurrentView("charts");
    } else if (currentView === "charts") {
      setCurrentView("summary");
    } else {
      setCurrentView("table");
    }
  };

  const handleCardClick = (filterType: 'financial' | 'reconciliation', value: string) => {
    if (filterType === 'financial') {
      setFilters(prev => ({
        ...prev,
        financialStatus: [value]
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        reconciliationStatus: [value]
      }));
    }
    setCurrentView('table');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Master Filters - Always visible at the top */}
      <div className="border-b bg-card">
        <div className="container mx-auto p-4">
          <DashboardFilters 
            filters={filters} 
            onFiltersChange={setFilters}
          />
        </div>
      </div>

      <DashboardHeader 
        onToggleView={handleToggleView}
        currentView={currentView}
        orders={filteredOrders}
        onCardClick={handleCardClick}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Financial Automation CTA Banner - Shown only in table view */}
        {currentView === "table" && (
          <FinancialAutomationCTA orders={filteredOrders} variant="banner" />
        )}

        {currentView === "summary" ? (
          <ManagementSummary orders={filteredOrders} />
        ) : currentView === "charts" ? (
          <DashboardCharts orders={filteredOrders} />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
            <OrdersTable 
              orders={filteredOrders} 
              onSelectOrder={setSelectedOrder}
              selectedOrderId={selectedOrder?.id}
              onOpenSupport={handleOpenSupport}
              onMarkAsRecovered={handleMarkAsRecovered}
              onConfirmCost={handleConfirmCost}
            />
            </div>
            <div className="lg:col-span-1">
              <OrderDetailPanel 
                order={selectedOrder} 
                onClose={() => setSelectedOrder(null)}
                onOpenSupport={handleOpenSupport}
                onMarkAsRecovered={handleMarkAsRecovered}
                onConfirmCost={handleConfirmCost}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
