import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Vamos começar sua conciliação inteligente?
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Como ERP, já temos suas vendas, recebimentos e taxas do Mercado Livre e Mercado Pago.
            Agora escolha quanto tempo quer conciliar e veja tudo acontecer automaticamente.
          </p>
        </div>

        <div className="grid gap-4 max-w-md mx-auto text-left">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Conexão direta com APIs do Mercado Livre e Pago
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Sem planilhas manuais ou upload de arquivos
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Identificação automática de diferenças e retenções
            </p>
          </div>
        </div>

        <Button 
          onClick={onNext}
          size="lg"
          className="gap-2 px-8 transition-all hover:scale-105"
        >
          Escolher período
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
