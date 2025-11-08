import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import PeriodSelectionStep from "@/components/onboarding/PeriodSelectionStep";
import SyncingStep from "@/components/onboarding/SyncingStep";
import ResultsStep from "@/components/onboarding/ResultsStep";

export type PeriodOption = "current-month" | "last-month" | "custom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(null);
  const [customDates, setCustomDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const navigate = useNavigate();

  const handleNext = () => setStep((prev) => prev + 1);

  const handlePeriodSelect = (period: PeriodOption, dates?: { start: Date; end: Date }) => {
    setSelectedPeriod(period);
    if (dates) {
      setCustomDates({ start: dates.start, end: dates.end });
    }
    handleNext();
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {step === 1 && <WelcomeStep onNext={handleNext} />}
      {step === 2 && <PeriodSelectionStep onSelect={handlePeriodSelect} />}
      {step === 3 && <SyncingStep onComplete={handleNext} />}
      {step === 4 && (
        <ResultsStep 
          period={selectedPeriod} 
          customDates={customDates}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
};

export default Onboarding;
