import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoSNI from "@/assets/logoSNI.png";

const BANNER_URL = "https://byslxrvqzcrjgpoatyxt.supabase.co/storage/v1/object/public/landing-images/1766405025490-5vonvbp.png";

export default function LandingPage() {
  const { data: stations = [], isLoading } = useQuery({
    queryKey: ["landing-stations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stations")
        .select("id, title, card_image_url, order_index")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

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

      {/* Stations Grid */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-primary mb-8 text-center">
          Estações
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stations.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Nenhuma estação disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <Link
                key={station.id}
                to="/login"
                className="group rounded-lg overflow-hidden border bg-card shadow-sm hover:shadow-lg transition-shadow"
              >
                {station.card_image_url ? (
                  <img
                    src={station.card_image_url}
                    alt={station.title}
                    className="w-full h-auto object-contain"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Sem imagem</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-center">
                    {station.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

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
