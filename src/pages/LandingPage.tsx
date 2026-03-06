import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Journey } from "@/types";
import logoSNI from "@/assets/logoSNI.png";

const BANNER_URL = "https://byslxrvqzcrjgpoatyxt.supabase.co/storage/v1/object/public/landing-images/1766405025490-5vonvbp.png";

function JourneyCard({ journey }: { journey: Journey }) {
  return (
    <Link
      to="/login"
      className="group rounded-lg overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-shadow"
    >
      {journey.cover_image ? (
        <img
          src={journey.cover_image}
          alt={journey.title}
          className="w-full h-auto object-contain"
        />
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Sem imagem</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-center">
          {journey.title}
        </h3>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ["landing-journeys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journeys")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as Journey[];
    },
  });

  const essenciais = journeys.filter((j) => j.order_index <= 2);
  const outras = journeys.filter((j) => j.order_index > 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Logo */}
      <div className="flex justify-center py-8 bg-background">
        <img src={logoSNI} alt="SNI Logo" className="h-20 md:h-28 object-contain" />
      </div>

      {/* Banner */}
      <div className="w-full">
        <img
          src={BANNER_URL}
          alt="Banner"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Jornada Essencial Highlight */}
      <section className="container mx-auto px-6 py-12">
        <div className="rounded-2xl border-2 border-primary/20 bg-card shadow-md p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-primary mb-8 text-center">
            Jornada Essencial
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : essenciais.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma jornada disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {essenciais.map((journey) => (
                <JourneyCard key={journey.id} journey={journey} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Outras Jornadas */}
      {outras.length > 0 && (
        <section className="container mx-auto px-6 pb-12">
          <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-primary mb-8 text-center">
            Outras Jornadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {outras.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        </section>
      )}

      {/* Login Button */}
      <div className="py-12 text-center">
        <Button
          asChild
          size="lg"
          className="font-semibold text-lg px-10 py-6 rounded-full"
        >
          <Link to="/login">Entrar na Plataforma</Link>
        </Button>
      </div>
    </div>
  );
}
