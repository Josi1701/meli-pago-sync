import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Clock, Wallet } from "lucide-react";
import type { PeriodOption } from "@/pages/Onboarding";

interface ResultsStepProps {
  period: PeriodOption | null;
  customDates: { start: Date | null; end: Date | null };
  onFinish: () => void;
}

const ResultsStep = ({ period, customDates, onFinish }: ResultsStepProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Conciliação concluída!
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seus dados foram sincronizados e analisados. Veja o resultado:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-success-light border-success-border space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-success">Conferido</p>
                  <p className="text-3xl font-bold text-foreground">83%</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              231 pedidos batendo perfeitamente entre venda e pagamento
            </p>
            <div className="pt-2">
              <p className="text-2xl font-semibold text-foreground">R$ 32.450,00</p>
            </div>
          </Card>

          <Card className="p-6 bg-warning-light border-warning-border space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-warning">Com diferença</p>
                  <p className="text-3xl font-bold text-foreground">12</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Pedidos com diferença entre valor vendido e recebido
            </p>
            <div className="pt-2">
              <p className="text-2xl font-semibold text-foreground">R$ 540,00</p>
            </div>
          </Card>

          <Card className="p-6 bg-neutral-light border-neutral-border space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral/10 rounded-lg">
                  <Clock className="w-6 h-6 text-neutral" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral">A liberar</p>
                  <p className="text-3xl font-bold text-foreground">18</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Pedidos pagos, mas ainda não liberados pelo marketplace
            </p>
            <div className="pt-2">
              <p className="text-2xl font-semibold text-foreground">R$ 1.980,00</p>
            </div>
          </Card>

          <Card className="p-6 bg-success-light border-success-border space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Wallet className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-success">Liberado</p>
                  <p className="text-3xl font-bold text-foreground">245</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Valores já disponíveis na sua conta
            </p>
            <div className="pt-2">
              <p className="text-2xl font-semibold text-foreground">R$ 30.120,00</p>
            </div>
          </Card>
        </div>

        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Próximos passos
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onFinish}
              >
                Ver divergências
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onFinish}
              >
                Ver pedidos a liberar
              </Button>
              <Button 
                className="w-full"
                onClick={onFinish}
              >
                Ir para painel completo
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            ⏰ Suas conciliações serão atualizadas automaticamente 2x ao dia (8h e 18h)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;
