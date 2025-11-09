import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  differenceValue: number;
  onConfirm: (description: string) => void;
}

const SupportModal = ({ open, onOpenChange, orderId, differenceValue, onConfirm }: SupportModalProps) => {
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    onConfirm(description);
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Abrir suporte sobre diferença
          </DialogTitle>
          <DialogDescription>
            Registre um chamado de suporte para investigar a diferença de valor detectada.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Pedido</Label>
            <div className="p-3 bg-muted rounded-md">
              <span className="font-mono font-medium">{orderId}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Diferença detectada</Label>
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
              <span className="font-semibold text-warning">
                R$ {Math.abs(differenceValue).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Adicione observações sobre esta diferença..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="gap-2">
            📨 Confirmar abertura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupportModal;
