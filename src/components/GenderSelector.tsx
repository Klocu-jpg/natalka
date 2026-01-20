import { useState } from "react";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface GenderSelectorProps {
  onComplete: () => void;
}

const GenderSelector = ({ onComplete }: GenderSelectorProps) => {
  const { createOrUpdateProfile } = useProfile();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (gender: "female" | "male" | "other") => {
    setLoading(true);
    try {
      await createOrUpdateProfile.mutateAsync({ gender });
      toast.success("Zapisano!");
      onComplete();
    } catch {
      toast.error("Nie udało się zapisać");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 animate-slide-up">
          <User className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">
            Jeszcze jedno pytanie 💕
          </h1>
          <p className="text-muted-foreground">
            To pomoże nam dostosować aplikację do Twoich potrzeb
          </p>
        </div>

        <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-lg py-6"
            onClick={() => handleSelect("female")}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "👩 Kobieta"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-lg py-6"
            onClick={() => handleSelect("male")}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "👨 Mężczyzna"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full text-lg py-6"
            onClick={() => handleSelect("other")}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "🌈 Inna"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenderSelector;
