import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface SyncingStepProps {
  onComplete: () => void;
}

const messages = [
  "Buscando vendas do Mercado Livre...",
  "Lendo pagamentos do Mercado Pago...",
  "Aplicando regras inteligentes...",
  "Cruzando dados...",
  "Pronto! Seus resultados estão sendo conferidos."
];

const SyncingStep = ({ onComplete }: SyncingStepProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 2;
      });
    }, 250);

    const completionTimer = setTimeout(() => {
      onComplete();
    }, 13000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Conectando e sincronizando
            </h2>
            <p className="text-lg text-muted-foreground min-h-[28px] transition-all duration-300">
              {messages[currentMessageIndex]}
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progress}% concluído
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Tempo estimado: até 15 segundos
        </p>
      </div>
    </div>
  );
};

export default SyncingStep;
