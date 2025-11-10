import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import type { Order } from "@/pages/Dashboard";
import { useMemo } from "react";

interface FinancialAutomationCTAProps {
  orders: Order[];
  variant?: "banner" | "card" | "inline";
}

const FinancialAutomationCTA = ({ orders, variant = "card" }: FinancialAutomationCTAProps) => {
  const eligibilityData = useMemo(() => {
    // Conta valores que estão "Conferidos" E "Liberados"
    const eligibleOrders = orders.filter(
      (o) => o.reconciliationStatus === "reconciled" && o.financialStatus === "released"
    );

    const eligibleValue = eligibleOrders.reduce((sum, o) => sum + o.receivedValue, 0);
    const eligibleCount = eligibleOrders.length;

    // Só mostra se tiver pelo menos R$ 1000 conferidos e liberados
    const shouldShow = eligibleValue >= 1000;

    return {
      shouldShow,
      eligibleValue,
      eligibleCount,
    };
  }, [orders]);

  if (!eligibilityData.shouldShow) return null;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  };

  const handleActivate = () => {
    // Em produção, isso levaria para o onboarding da Conciliação Financeira
    console.log("Ativar Conciliação Financeira com dados pré-carregados");
  };

  if (variant === "banner") {
    return (
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                💡 Seus pedidos do Mercado Livre já estão conferidos
              </p>
              <p className="text-xs text-muted-foreground">
                Com a Conciliação Financeira, o Bling baixa tudo automaticamente no Contas a Receber
              </p>
            </div>
          </div>
          <Button onClick={handleActivate} size="sm" className="gap-2 flex-shrink-0">
            <Zap className="w-4 h-4" />
            Automatizar baixas
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">
            Tudo certo com seus repasses. Quer transformar isso em baixa automática?
          </p>
          <p className="text-xs text-muted-foreground">
            Você já conferiu {formatCurrency(eligibilityData.eligibleValue)} em {eligibilityData.eligibleCount} pedidos.
            Com a Conciliação Financeira, eliminamos os lançamentos manuais.
          </p>
          <Button onClick={handleActivate} size="sm" variant="outline" className="gap-2 mt-2">
            <Zap className="w-3 h-3" />
            Ativar Conciliação Financeira
          </Button>
        </div>
      </div>
    );
  }

  // Default: card variant
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Próximo passo: automatize as baixas
            </h3>
            <p className="text-sm text-muted-foreground">
              Você já conferiu {formatCurrency(eligibilityData.eligibleValue)} do Mercado Livre.
              Que tal automatizar as baixas no seu Contas a Receber?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">Conferência validada</p>
              <p className="text-xs text-muted-foreground">{eligibilityData.eligibleCount} pedidos prontos</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">Dinheiro liberado</p>
              <p className="text-xs text-muted-foreground">Valores já na conta</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">Baixa automática</p>
              <p className="text-xs text-muted-foreground">Sem lançamentos manuais</p>
            </div>
          </div>
        </div>

        <Button onClick={handleActivate} className="w-full gap-2">
          <Zap className="w-4 h-4" />
          Ativar Conciliação Financeira
          <ArrowRight className="w-4 h-4" />
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          O sistema passa a baixar automaticamente os títulos do Contas a Receber conforme payment_id + external_reference
        </p>
      </div>
    </Card>
  );
};

export default FinancialAutomationCTA;
