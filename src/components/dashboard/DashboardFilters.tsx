import { useState, useEffect } from "react";
import { Calendar, Filter, X, AlertCircle, DollarSign, HelpCircle, ShoppingCart, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export type FilterMode = "sale_date" | "payment_date";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface Filters {
  mode: FilterMode;
  dateRange: DateRange;
  financialStatus: string[];
  reconciliationStatus: string[];
  categories: string[];
  minDifference: number | null;
  paymentMethod: string[];
}

interface DashboardFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const DashboardFilters = ({ filters, onFiltersChange }: DashboardFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const [previousMode, setPreviousMode] = useState(filters.mode);

  // Show toast when mode changes
  useEffect(() => {
    if (previousMode !== filters.mode) {
      toast({
        title: filters.mode === "payment_date" 
          ? "💸 Exibindo por data de repasse (visão de caixa)"
          : "🛒 Exibindo por data de venda (visão de vendas)",
        duration: 3000,
      });
      setPreviousMode(filters.mode);
    }
  }, [filters.mode, previousMode, toast]);

  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      mode: "sale_date",
      dateRange: { from: undefined, to: undefined },
      financialStatus: [],
      reconciliationStatus: [],
      categories: [],
      minDifference: null,
      paymentMethod: [],
    });
  };

  const hasActiveFilters = 
    filters.dateRange.from || 
    filters.financialStatus.length > 0 || 
    filters.reconciliationStatus.length > 0 || 
    filters.categories.length > 0 ||
    filters.minDifference !== null ||
    filters.paymentMethod.length > 0;

  const toggleFinancialStatus = (value: string) => {
    const newStatus = filters.financialStatus.includes(value)
      ? filters.financialStatus.filter(s => s !== value)
      : [...filters.financialStatus, value];
    updateFilters({ financialStatus: newStatus });
  };

  const toggleReconciliationStatus = (value: string) => {
    const newStatus = filters.reconciliationStatus.includes(value)
      ? filters.reconciliationStatus.filter(s => s !== value)
      : [...filters.reconciliationStatus, value];
    updateFilters({ reconciliationStatus: newStatus });
  };

  return (
    <Card className="p-4 space-y-4 animate-fade-in">
      {/* Chips Sempre Visíveis */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b">
        <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
        
        {/* Mode Chip */}
        <Badge 
          variant="secondary" 
          className="gap-1 cursor-pointer hover:opacity-80"
          onClick={() => {}}
        >
          {filters.mode === "payment_date" ? "💸" : "🛒"}
          Modo: {filters.mode === "payment_date" ? "Repasse" : "Venda"}
        </Badge>

        {/* Period Chip */}
        {filters.dateRange.from && (
          <Badge variant="secondary" className="gap-1">
            <Calendar className="w-3 h-3" />
            Período: {format(filters.dateRange.from, "dd/MM")}
            {filters.dateRange.to && ` – ${format(filters.dateRange.to, "dd/MM")}`}
          </Badge>
        )}

        {/* Financial Status Chips */}
        {filters.financialStatus.length > 0 ? (
          filters.financialStatus.map(status => (
            <Badge key={status} variant="outline" className="gap-1">
              Fin: {status === "released" ? "Liberado" : 
                    status === "pending_release" ? "A liberar" :
                    status === "retained" ? "Retido" :
                    status === "refunded" ? "Devolvido" : "Cancelado"}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-danger" 
                onClick={() => {
                  updateFilters({ 
                    financialStatus: filters.financialStatus.filter(s => s !== status) 
                  });
                }}
              />
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" className="gap-1">
            Fin: Todos
          </Badge>
        )}

        {/* Reconciliation Status Chips */}
        {filters.reconciliationStatus.length > 0 ? (
          filters.reconciliationStatus.map(status => (
            <Badge key={status} variant="outline" className="gap-1">
              Conc: {status === "reconciled" ? "Conferido" :
                     status === "difference_detected" ? "Diferença" :
                     status === "not_reconciled" ? "Não conferido" : "Em conferência"}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-danger" 
                onClick={() => {
                  updateFilters({ 
                    reconciliationStatus: filters.reconciliationStatus.filter(s => s !== status) 
                  });
                }}
              />
            </Badge>
          ))
        ) : (
          <Badge variant="secondary" className="gap-1">
            Conc: Todos
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="ml-auto h-7 gap-1 px-2"
        >
          <Filter className="w-3 h-3" />
          {showAdvanced ? "Ocultar" : "Editar filtros"}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 animate-fade-in">
          {/* Mode Toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo de data</label>
            <div className="flex gap-2">
              <Button
                variant={filters.mode === "sale_date" ? "default" : "outline"}
                onClick={() => updateFilters({ mode: "sale_date" })}
                className="flex-1 gap-2"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Data da venda
              </Button>
              <Button
                variant={filters.mode === "payment_date" ? "default" : "outline"}
                onClick={() => updateFilters({ mode: "payment_date" })}
                className="flex-1 gap-2"
                size="sm"
              >
                <Banknote className="w-4 h-4" />
                Data do repasse
              </Button>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">De</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      format(filters.dateRange.from, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => updateFilters({ 
                      dateRange: { ...filters.dateRange, from: date } 
                    })}
                    disabled={(date) => {
                      const today = new Date();
                      return date > today;
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Até</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? (
                      format(filters.dateRange.to, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => updateFilters({ 
                      dateRange: { ...filters.dateRange, to: date } 
                    })}
                    disabled={(date) => {
                      const today = new Date();
                      const from = filters.dateRange.from;
                      if (from) {
                        const maxDate = new Date(from);
                        maxDate.setDate(maxDate.getDate() + 60);
                        return date > today || date < from || date > maxDate;
                      }
                      return date > today;
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Máximo de 60 dias por período
          </p>
          {/* Financial Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Status Financeiro (multi-seleção)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "released", label: "💸 Liberado", color: "bg-success/10 text-success border-success" },
                { value: "pending_release", label: "⏳ A liberar", color: "bg-warning/10 text-warning border-warning" },
                { value: "retained", label: "🔒 Retido", color: "bg-orange-500/10 text-orange-500 border-orange-500" },
                { value: "refunded", label: "🔁 Devolvido", color: "bg-blue-500/10 text-blue-500 border-blue-500" },
                { value: "cancelled", label: "🚫 Cancelado", color: "bg-muted text-muted-foreground border-muted-foreground" },
              ].map(({ value, label, color }) => (
                <Badge
                  key={value}
                  variant="outline"
                  className={cn(
                    "cursor-pointer hover:opacity-80 transition-all",
                    filters.financialStatus.includes(value) && color
                  )}
                  onClick={() => toggleFinancialStatus(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Reconciliation Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Status de Conciliação (multi-seleção)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "reconciled", label: "✅ Conferido", color: "bg-success/10 text-success border-success" },
                { value: "difference_detected", label: "⚠️ Diferença detectada", color: "bg-warning/10 text-warning border-warning" },
                { value: "not_reconciled", label: "❌ Não conferido", color: "bg-danger/10 text-danger border-danger" },
                { value: "in_progress", label: "⏺️ Em conferência", color: "bg-blue-500/10 text-blue-500 border-blue-500" },
              ].map(({ value, label, color }) => (
                <Badge
                  key={value}
                  variant="outline"
                  className={cn(
                    "cursor-pointer hover:opacity-80 transition-all",
                    filters.reconciliationStatus.includes(value) && color
                  )}
                  onClick={() => toggleReconciliationStatus(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Método de pagamento</label>
            <Select
              value={filters.paymentMethod[0] || "all"}
              onValueChange={(value) => 
                updateFilters({ paymentMethod: value === "all" ? [] : [value] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Min Difference */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Diferença mínima (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minDifference || ""}
              onChange={(e) => 
                updateFilters({ 
                  minDifference: e.target.value ? parseFloat(e.target.value) : null 
                })
              }
              className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
              placeholder="0.00"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default DashboardFilters;
