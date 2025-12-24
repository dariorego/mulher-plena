import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LandingSection } from "@/types";

export default function LandingPage() {
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["landing-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as LandingSection[];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
        <h1 className="text-3xl font-cinzel font-bold text-primary text-center">
          Bem-vindo
        </h1>
        <p className="text-muted-foreground mt-4 text-center max-w-md">
          A página inicial está sendo configurada. Por favor, faça login para acessar a plataforma.
        </p>
        <Button asChild className="mt-6">
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {sections.map((section, index) => (
        <LandingSectionBlock 
          key={section.id} 
          section={section} 
          isEven={index % 2 === 0}
        />
      ))}
    </div>
  );
}

interface LandingSectionBlockProps {
  section: LandingSection;
  isEven: boolean;
}

function LandingSectionBlock({ section, isEven }: LandingSectionBlockProps) {
  const hasImage = !!section.image_url;
  const hasContent = section.title || section.content;

  // Full-width image section (no text)
  if (hasImage && !hasContent && !section.is_cta) {
    return (
      <section className="relative w-full">
        <img
          src={section.image_url!}
          alt={section.title || ""}
          className="w-full h-[50vh] md:h-[70vh] object-cover"
        />
      </section>
    );
  }

  // Hero-style section with image background and overlay
  if (hasImage && hasContent && section.order_index === 0) {
    return (
      <section className="relative min-h-screen flex items-center justify-center">
        <img
          src={section.image_url!}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative z-10 text-center px-6 py-12 max-w-4xl">
          {section.title && (
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-cinzel font-bold text-accent drop-shadow-lg">
              {section.title}
            </h1>
          )}
          {section.content && (
            <div 
              className="mt-6 text-lg md:text-xl text-white/90 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          )}
          {section.is_cta && section.cta_text && (
            <Button 
              asChild 
              size="lg" 
              className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-lg px-8 py-6"
            >
              <Link to={section.cta_link || "/login"}>
                {section.cta_text}
              </Link>
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Split layout section (image + content side by side)
  if (hasImage && hasContent) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className={`container mx-auto px-6 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}>
          <div className="w-full md:w-1/2">
            <img
              src={section.image_url!}
              alt={section.title || ""}
              className="w-full rounded-lg shadow-xl"
            />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            {section.title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-cinzel font-bold text-primary">
                {section.title}
              </h2>
            )}
            {section.content && (
              <div 
                className="text-muted-foreground prose max-w-none"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
            {section.is_cta && section.cta_text && (
              <Button 
                asChild 
                size="lg"
                className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to={section.cta_link || "/login"}>
                  {section.cta_text}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // CTA Section with image background
  if (hasImage && section.is_cta) {
    return (
      <section className="relative py-24 md:py-32">
        <img
          src={section.image_url!}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          {section.title && (
            <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-accent">
              {section.title}
            </h2>
          )}
          {section.content && (
            <div 
              className="mt-4 text-white/90 prose prose-invert max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          )}
          {section.cta_text && (
            <Button 
              asChild 
              size="lg"
              className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-lg px-8 py-6"
            >
              <Link to={section.cta_link || "/login"}>
                {section.cta_text}
              </Link>
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Text-only section
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        {section.title && (
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-cinzel font-bold text-primary">
            {section.title}
          </h2>
        )}
        {section.content && (
          <div 
            className="mt-6 text-muted-foreground prose max-w-none mx-auto"
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
        )}
        {section.is_cta && section.cta_text && (
          <Button 
            asChild 
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link to={section.cta_link || "/login"}>
              {section.cta_text}
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
