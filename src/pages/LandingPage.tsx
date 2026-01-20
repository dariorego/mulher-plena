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
    <div className="min-h-screen bg-white">
      {sections.map((section, index) => (
        <LandingSectionBlock 
          key={section.id} 
          section={section} 
          isEven={index % 2 === 0}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
        />
      ))}
      
      {/* Login Button at bottom */}
      <div className="py-12 text-center bg-white">
        <Button 
          asChild 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-10 py-6 rounded-full"
        >
          <Link to="/login">Entrar na Plataforma</Link>
        </Button>
      </div>
    </div>
  );
}

interface LandingSectionBlockProps {
  section: LandingSection;
  isEven: boolean;
  isFirst: boolean;
  isLast: boolean;
}

function LandingSectionBlock({ section, isEven, isFirst, isLast }: LandingSectionBlockProps) {
  const hasImage = !!section.image_url;
  const hasTitle = !!section.title;
  const hasContent = !!section.content;

  // Hero Banner Section - Burgundy background with title left, image right
  if (hasImage && hasTitle && (isFirst || section.order_index === 0)) {
    return (
      <>
        {/* Hero Banner */}
        <section className="relative bg-gradient-to-br from-[#5C1A1A] via-[#722424] to-[#5C1A1A] overflow-hidden">
          <div className="container mx-auto px-6 py-0">
            <div className="flex flex-col md:flex-row items-center min-h-[300px] md:min-h-[400px]">
              {/* Title on left */}
              <div className="w-full md:w-1/2 py-12 md:py-16 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-cinzel font-bold text-white leading-tight drop-shadow-lg">
                  {section.title}
                </h1>
              </div>
              
              {/* Image on right */}
              <div className="w-full md:w-1/2 flex justify-end">
                <img
                  src={section.image_url!}
                  alt={section.title || ""}
                  className="w-full md:w-auto h-[250px] md:h-[400px] object-cover object-top"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content text below hero */}
        {hasContent && (
          <section className="py-8 md:py-12 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
              <div 
                className="text-foreground prose prose-lg max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content! }}
              />
            </div>
          </section>
        )}
      </>
    );
  }

  // Banner section with image and title (secondary banners)
  if (hasImage && hasTitle) {
    return (
      <>
        {/* Banner with burgundy background */}
        <section className="relative bg-gradient-to-br from-[#5C1A1A] via-[#722424] to-[#5C1A1A] overflow-hidden">
          <div className="container mx-auto px-6 py-0">
            <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center min-h-[250px] md:min-h-[300px]`}>
              {/* Title */}
              <div className="w-full md:w-1/2 py-10 md:py-12 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-cinzel font-bold text-white leading-tight drop-shadow-lg">
                  {section.title}
                </h2>
              </div>
              
              {/* Image */}
              <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                <img
                  src={section.image_url!}
                  alt={section.title || ""}
                  className="w-auto h-[200px] md:h-[300px] object-cover object-center"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content text below */}
        {hasContent && (
          <section className="py-8 md:py-10 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
              <div 
                className="text-foreground prose prose-lg max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: section.content! }}
              />
            </div>
          </section>
        )}
      </>
    );
  }

  // CTA Banner (last section style with multiple images)
  if (section.is_cta && hasImage && hasTitle) {
    return (
      <section className="relative bg-gradient-to-br from-[#5C1A1A] via-[#722424] to-[#5C1A1A] overflow-hidden">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Title on left */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-cinzel font-bold text-white leading-tight drop-shadow-lg">
                {section.title}
              </h2>
              {section.cta_text && (
                <Button 
                  asChild 
                  size="lg"
                  className="mt-8 bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8 py-6 rounded-full"
                >
                  <Link to={section.cta_link || "/login"}>
                    {section.cta_text}
                  </Link>
                </Button>
              )}
            </div>
            
            {/* Image collage on right */}
            <div className="w-full md:w-1/2 flex justify-center">
              <img
                src={section.image_url!}
                alt=""
                className="w-auto max-w-full h-auto max-h-[300px] object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Image-only section
  if (hasImage && !hasTitle && !hasContent) {
    return (
      <section className="relative bg-gradient-to-br from-[#5C1A1A] via-[#722424] to-[#5C1A1A] overflow-hidden">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center">
            <img
              src={section.image_url!}
              alt=""
              className="w-auto max-w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        </div>
      </section>
    );
  }

  // Text-only section (white background)
  if (!hasImage && (hasTitle || hasContent)) {
    return (
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          {hasTitle && (
            <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-primary mb-6 text-center">
              {section.title}
            </h2>
          )}
          {hasContent && (
            <div 
              className="text-foreground prose prose-lg max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: section.content! }}
            />
          )}
          {section.is_cta && section.cta_text && (
            <div className="text-center mt-8">
              <Button 
                asChild 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-8 py-6 rounded-full"
              >
                <Link to={section.cta_link || "/login"}>
                  {section.cta_text}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Fallback
  return null;
}
