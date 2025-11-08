import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Conciliação Automática
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Elimine planilhas e erros manuais. Concilie suas vendas do Mercado Livre com 
              recebimentos do Mercado Pago de forma 100% automática.
            </p>
          </div>

          <Button 
            onClick={() => navigate("/onboarding")}
            size="lg"
            className="text-lg px-8 py-6 transition-all hover:scale-105"
          >
            Começar agora
          </Button>

          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Automático</h3>
              <p className="text-muted-foreground">
                Sincronização direta com APIs do Mercado Livre e Pago
              </p>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Confiável</h3>
              <p className="text-muted-foreground">
                Identificação precisa de diferenças e retenções
              </p>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Visual</h3>
              <p className="text-muted-foreground">
                Dashboards e relatórios claros e acionáveis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
