import { useState } from "react";
import { Calendar, Filter, X } from "lucide-react";
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
  status: string[];
  categories: string[];
  minDifference: number | null;
  paymentMethod: string[];
  situation: string[];
}

interface DashboardFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const DashboardFilters = ({ filters, onFiltersChange }: DashboardFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      mode: "sale_date",
      dateRange: { from: undefined, to: undefined },
      status: [],
      categories: [],
      minDifference: null,
      paymentMethod: [],
      situation: [],
    });
  };

  const hasActiveFilters = 
    filters.dateRange.from || 
    filters.status.length > 0 || 
    filters.categories.length > 0 ||
    filters.minDifference !== null ||
    filters.paymentMethod.length > 0 ||
    filters.situation.length > 0;

  const toggleStatus = (value: string) => {
    const newStatus = filters.status.includes(value)
      ? filters.status.filter(s => s !== value)
      : [...filters.status, value];
    updateFilters({ status: newStatus });
  };

  const toggleSituation = (value: string) => {
    const newSituation = filters.situation.includes(value)
      ? filters.situation.filter(s => s !== value)
      : [...filters.situation, value];
    updateFilters({ situation: newSituation });
  };

  return (
    <Card className="p-4 space-y-4 animate-fade-in">
      {/* Mode Toggle */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Ver por:
        </p>
        <div className="flex gap-2">
          <Button
            variant={filters.mode === "sale_date" ? "default" : "outline"}
            onClick={() => updateFilters({ mode: "sale_date" })}
            className={cn(
              "flex-1 gap-2 transition-all",
              filters.mode === "sale_date" && "shadow-sm"
            )}
          >
            🛒 Data da venda
          </Button>
          <Button
            variant={filters.mode === "payment_date" ? "default" : "outline"}
            onClick={() => updateFilters({ mode: "payment_date" })}
            className={cn(
              "flex-1 gap-2 transition-all",
              filters.mode === "payment_date" && "shadow-sm"
            )}
          >
            💸 Data do repasse
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center animate-fade-in">
          {filters.mode === "sale_date" 
            ? "Exibindo dados por data de venda 🛒" 
            : "Exibindo dados por data de repasse 💸"}
        </p>
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
                  const sixtyDaysAgo = new Date();
                  sixtyDaysAgo.setDate(today.getDate() - 60);
                  return date > today || date < sixtyDaysAgo;
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

      {/* Advanced Filters Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full gap-2"
      >
        <Filter className="w-4 h-4" />
        {showAdvanced ? "Ocultar filtros avançados" : "Mostrar filtros avançados"}
      </Button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-3 pt-3 border-t animate-fade-in">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "ok", label: "Conciliado", color: "bg-success-light text-success" },
                { value: "difference", label: "Diferença", color: "bg-warning-light text-warning" },
                { value: "pending", label: "A liberar", color: "bg-neutral-light text-neutral" },
                { value: "retained", label: "Retido", color: "bg-danger-light text-danger" },
              ].map((status) => (
                <Badge
                  key={status.value}
                  variant={filters.status.includes(status.value) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    filters.status.includes(status.value) && status.color
                  )}
                  onClick={() => toggleStatus(status.value)}
                >
                  {status.label}
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

          {/* Situation Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Situação da venda</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "refunded", label: "Devolvida", icon: "🔁" },
                { value: "partial_refund", label: "Devolução parcial", icon: "🔁" },
                { value: "in_dispute", label: "Em disputa", icon: "⚖️" },
                { value: "chargeback", label: "Chargeback", icon: "💳" },
                { value: "cancelled_before_payment", label: "Cancelada", icon: "🚫" },
              ].map((situation) => (
                <Badge
                  key={situation.value}
                  variant={filters.situation.includes(situation.value) ? "default" : "outline"}
                  className="cursor-pointer transition-all"
                  onClick={() => toggleSituation(situation.value)}
                >
                  {situation.icon} {situation.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {filters.dateRange.from && (
            <Badge variant="secondary" className="gap-1">
              Período: {format(filters.dateRange.from, "dd/MM")} - 
              {filters.dateRange.to ? format(filters.dateRange.to, "dd/MM") : "..."}
            </Badge>
          )}
          {filters.status.length > 0 && (
            <Badge variant="secondary">
              {filters.status.length} status
            </Badge>
          )}
          {filters.minDifference !== null && (
            <Badge variant="secondary">
              Dif. ≥ R$ {filters.minDifference.toFixed(2)}
            </Badge>
          )}
          {filters.situation.length > 0 && (
            <Badge variant="secondary">
              {filters.situation.length} situações
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 gap-1 px-2"
          >
            <X className="w-3 h-3" />
            Limpar filtros
          </Button>
        </div>
      )}
    </Card>
  );
};

export default DashboardFilters;
