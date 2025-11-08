import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, ChevronLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth, endOfMonth, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PeriodOption } from "@/pages/Onboarding";

interface PeriodSelectionStepProps {
  onSelect: (period: PeriodOption, dates?: { start: Date; end: Date }) => void;
}

const PeriodSelectionStep = ({ onSelect }: PeriodSelectionStepProps) => {
  const [selected, setSelected] = useState<PeriodOption | null>(null);
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [showDateError, setShowDateError] = useState(false);

  const today = new Date();
  const maxDate = today;
  const minDate = subDays(today, 60);

  const handleCardClick = (period: PeriodOption) => {
    setSelected(period);
    setShowDateError(false);
    
    if (period === "current-month") {
      onSelect(period, {
        start: startOfMonth(today),
        end: endOfMonth(today),
      });
    } else if (period === "last-month") {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
      onSelect(period, {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      });
    }
  };

  const handleCustomConfirm = () => {
    if (!customStartDate || !customEndDate) {
      setShowDateError(true);
      return;
    }

    const daysDiff = Math.floor((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 60) {
      setShowDateError(true);
      return;
    }

    onSelect("custom", {
      start: customStartDate,
      end: customEndDate,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Qual período deseja conciliar?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Você pode conciliar até 60 dias atrás. Comece por esse período e depois amplie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            className={cn(
              "p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2",
              selected === "current-month" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
            onClick={() => handleCardClick("current-month")}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Mês atual</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Concilia apenas vendas e recebimentos do mês em curso.
              </p>
              <div className="pt-2 text-sm text-primary font-medium">
                Sempre disponível
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              "p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2",
              selected === "last-month" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
            onClick={() => handleCardClick("last-month")}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Mês anterior</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Revisa as operações do mês passado completo.
              </p>
              <div className="pt-2 text-sm text-success font-medium">
                Dentro dos últimos 60 dias
              </div>
            </div>
          </Card>

          <Card
            className={cn(
              "p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2",
              selected === "custom" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
            onClick={() => setSelected("custom")}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Personalizado</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Seleciona datas específicas dentro do limite de 60 dias.
              </p>
              <div className="pt-2 text-sm text-warning font-medium">
                Data inicial e final obrigatórias
              </div>
            </div>
          </Card>
        </div>

        {selected === "custom" && (
          <Card className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Data inicial
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {customStartDate ? (
                        format(customStartDate, "PPP", { locale: ptBR })
                      ) : (
                        "Selecione uma data"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      disabled={(date) => date > maxDate || date < minDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Data final
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customEndDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {customEndDate ? (
                        format(customEndDate, "PPP", { locale: ptBR })
                      ) : (
                        "Selecione uma data"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      disabled={(date) => 
                        date > maxDate || 
                        date < minDate || 
                        (customStartDate && date < customStartDate)
                      }
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {showDateError && (
              <div className="p-4 bg-danger-light border border-danger-border rounded-lg">
                <p className="text-sm text-danger">
                  {!customStartDate || !customEndDate 
                    ? "Por favor, selecione ambas as datas para continuar."
                    : "O período não pode ultrapassar 60 dias. Por favor, ajuste as datas."}
                </p>
              </div>
            )}

            <Button 
              onClick={handleCustomConfirm}
              className="w-full"
              size="lg"
            >
              Confirmar período
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PeriodSelectionStep;
