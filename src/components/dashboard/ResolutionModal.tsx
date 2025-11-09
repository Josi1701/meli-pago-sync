import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "recovered" | "confirmed_cost";
  orderId: string;
  differenceValue: number;
  onConfirm: () => void;
}

const ResolutionModal = ({ open, onOpenChange, type, orderId, differenceValue, onConfirm }: ResolutionModalProps) => {
  const isRecovered = type === "recovered";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRecovered ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-success" />
                Confirmar valor recuperado
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-danger" />
                Confirmar custo
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isRecovered
              ? "Confirme que o valor da diferença foi recuperado e compensado em repasse."
              : "Deseja confirmar que este valor foi perdido e contabilizar como custo?"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Pedido</div>
            <div className="p-3 bg-muted rounded-md">
              <span className="font-mono font-medium">{orderId}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Valor</div>
            <div className={`p-3 rounded-md border ${isRecovered ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
              <span className={`font-semibold ${isRecovered ? 'text-success' : 'text-danger'}`}>
                R$ {Math.abs(differenceValue).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            variant={isRecovered ? "default" : "destructive"}
          >
            {isRecovered ? "✅ Sim, foi recuperado" : "❌ Sim, confirmar custo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResolutionModal;
