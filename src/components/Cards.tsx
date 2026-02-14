import React from 'react';
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Linkedin, Quote, ArrowRight, Shield, BarChart3, LineChart, Globe, Wallet, BookOpen, Headphones, Star } from "lucide-react";
import { Service, TradingInstrument, TeamMember } from "@/lib/index";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Mapeo de iconos para servicios basado en el nombre de la propiedad iconName
 */
const IconMap: Record<string, React.ElementType> = {
  Shield,
  BarChart3,
  LineChart,
  Globe,
  Wallet,
  BookOpen,
  Headphones
};

/**
 * Tarjeta de Servicio Financiero
 * Diseño moderno con elevación suave y acentos en dorado.
 */
export function ServiceCard({
  service
}: {
  service: Service;
}) {
  const Icon = IconMap[service.iconName] || Globe;
  return <motion.div whileHover={{
    y: -8
  }} transition={{
    type: "spring",
    stiffness: 300,
    damping: 20
  }} className="h-full">
      <Card className="h-full border-border/40 bg-card/60 backdrop-blur-md hover:border-accent/40 hover:shadow-xl transition-all duration-300 flex flex-col">
        <CardHeader className="card-mobile-sm">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-4 ring-1 ring-border/20 shadow-inner">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
          </div>
          <h3 className="text-subheading font-bold text-foreground leading-tight">{service.title}</h3>
        </CardHeader>
        <CardContent className="flex-grow card-mobile-sm">
          <p className="text-body text-muted-foreground leading-relaxed">{service.description}</p>
          {service.benefits && service.benefits.length > 0 && <ul className="mt-4 space-y-2">
              {service.benefits.slice(0, 3).map((benefit, idx) => <li key={idx} className="text-xs flex items-center text-muted-foreground/80">
                  <div className="w-1 h-1 rounded-full bg-accent mr-2" />
                  {benefit}
                </li>)}
            </ul>}
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            variant="ghost" 
            className="text-accent hover:text-accent-foreground hover:bg-accent p-0 px-4 group rounded-full transition-all"
onClick={() => {
              // Mapear IDs de servicios a IDs de FAQs
              const serviceToFaqMap: Record<string, string> = {
                'forex-trading': 'faq-forex',
                'commodities': 'faq-commodities', 
                'indices': 'faq-indices',
                'crypto': 'faq-crypto'
              };
              
              const faqId = serviceToFaqMap[service.id];
              const element = document.getElementById(faqId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight effect
                element.classList.add('bg-accent/10', 'border-accent/30');
                setTimeout(() => {
                  element.classList.remove('bg-accent/10', 'border-accent/30');
                }, 2000);
              }
            }}
          >
            Ver detalles <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>;
}

/**
 * Tarjeta de Instrumento de Trading
 * Muestra spreads en tiempo real y tendencias de mercado.
 */
export function InstrumentCard({
  instrument,
  onTrade
}: {
  instrument: TradingInstrument;
  onTrade?: () => void;
}) {
  const isUp = instrument.trending === 'up';
  return <motion.div whileHover={{
    scale: 1.02
  }} transition={{
    type: "spring",
    stiffness: 400,
    damping: 25
  }}>
      <Card className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm hover:shadow-lg transition-all group">
        <div className="card-responsive-sm flex items-center justify-between border-b border-border/10 bg-muted/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs sm:text-sm text-primary ring-1 ring-primary/20">
              {instrument.symbol.substring(0, 2)}
            </div>
            <div>
              <div className="font-bold font-mono text-caption sm:text-base text-foreground">{instrument.symbol}</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-tighter">{instrument.name}</div>
            </div>
          </div>
          <Badge variant={instrument.isPopular ? "default" : "secondary"} className={`text-xs ${instrument.isPopular ? "bg-accent text-accent-foreground border-none" : "bg-secondary/50 border-none"}`}>
            {instrument.category}
          </Badge>
        </div>
        <CardContent className="card-responsive-sm grid grid-cols-2 gap-responsive-sm">
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Spread</div>
            <div className="font-mono text-sm font-bold text-foreground">{instrument.spread} pips</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Apalancamiento</div>
            <div className="font-mono text-sm font-bold text-foreground">{instrument.leverage}</div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2 sm:gap-4 pt-0 card-responsive-sm">
          <div className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md">
            {isUp ? <TrendingUp className="w-3 h-3 text-[oklch(0.68_0.16_150)]" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
            <span className={`text-xs font-mono font-medium ${isUp ? "text-[oklch(0.68_0.16_150)]" : "text-destructive"}`}>
              {isUp ? "+0.42%" : "-0.18%"}
            </span>
          </div>
          <Button 
            size="sm" 
            className="h-7 sm:h-8 px-3 sm:px-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs font-bold touch-target"
            onClick={onTrade}
          >
            Operar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>;
}

/**
 * Tarjeta de Miembro del Equipo
 * Enfoque en profesionalismo y transparencia.
 */
export function TeamCard({
  member
}: {
  member: TeamMember;
}) {
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} whileInView={{
    opacity: 1,
    scale: 1
  }} viewport={{
    once: true
  }} className="group">
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/40 shadow-sm">
        <div className="aspect-[3/4] overflow-hidden relative">
          <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
          
          {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent hover:text-accent-foreground transition-all duration-300 z-10">
              <Linkedin className="lucide lucide-linkedin w-5 h-5 bg-[rgb(125,225,129)]" />
            </a>}
        </div>
        
        <div className="p-6">
          <h4 className="text-xl font-bold text-foreground">{member.name}</h4>
          <p className="text-accent font-medium text-sm mb-3">{member.role}</p>
          <p className="text-muted-foreground text-sm line-clamp-2 italic">"{member.bio}"</p>
        </div>
      </div>
    </motion.div>;
}

/**
 * Tarjeta de Testimonio
 * Diseño elegante con citas y calificación.
 */
export function TestimonialCard({
  testimonial
}: {
  testimonial: any;
}) {
  return <Card className="border-border/40 bg-card/50 backdrop-blur-sm p-6 relative overflow-hidden h-full">
      <div className="absolute -top-4 -right-4 opacity-5">
        <Quote className="w-24 h-24 text-accent" />
      </div>
      
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < (testimonial.rating || 5) ? "fill-accent text-accent" : "text-muted"}`} />)}
      </div>
      
      <CardContent className="p-0 mb-6">
        <p className="text-foreground/90 leading-relaxed italic text-lg">
          "{testimonial.quote || testimonial.text}"
        </p>
      </CardContent>
      
      <CardFooter className="p-0 flex items-center gap-4">
        {testimonial.image && <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-accent/20" />}
        <div>
          <div className="font-bold text-foreground">{testimonial.name}</div>
          <div className="text-xs text-muted-foreground">{testimonial.role || "Inversor Verificado"}</div>
        </div>
      </CardFooter>
    </Card>;
}