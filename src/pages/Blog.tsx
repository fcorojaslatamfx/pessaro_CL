import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, User, Search, TrendingUp } from 'lucide-react';
import { IMAGES } from '@/assets/images';
import { BlogPost } from '@/lib/index';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { useBlogPublic } from '@/hooks/useBlogPublic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RiskProfileModal from '@/components/RiskProfileModal';
import NewsletterPopup from '@/components/NewsletterPopup';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  
  const { openPopup } = useContactPopup();
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();
  const { posts: allPosts, isLoading: postsLoading } = useBlogPublic();

  const categories = ['Todos', 'Trading', 'Mercados', 'Análisis', 'Educación', 'Criptomonedas'];

  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="text-title-primary">Blog de</span> <span className="text-title-accent">Mercados</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-8">
              Análisis experto, estrategias de trading y educación financiera para potenciar tus inversiones
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-mobile-xs justify-center lg:justify-start">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 
                    "btn-mobile-sm transition-all duration-200 bg-accent text-accent-foreground hover:bg-accent/90" : 
                    "btn-mobile-sm transition-all duration-200 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Análisis de Mercado Destacado */}
      <section className="py-16 relative overflow-hidden">
        {/* Background Image for Stock Market Analysis */}
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.STOCK_MARKET_BG_5} 
            alt="Stock Market Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-accent/20" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                <span className="text-title-primary">Análisis de</span> <span className="text-title-accent">Mercado</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Insights exclusivos y análisis profesional de nuestro Head Trader
              </p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-border/50 shadow-xl">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Francisco Rojas-Aranda</h3>
                      <p className="text-accent font-semibold">Head Trader</p>
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-foreground mb-4">
                    Sesiones de Análisis de Mercado Exclusivas
                  </h4>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Únete a nuestras sesiones semanales de análisis de mercado donde Francisco Rojas-Aranda, 
                    nuestro Head Trader con más de 20 años de experiencia, comparte insights exclusivos sobre 
                    las tendencias del mercado, oportunidades de trading y estrategias avanzadas.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30"
                      onClick={() => setShowProfileModal(true)}
                    >
                      Reservar Plaza
                    </Button>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Próxima sesión: Viernes 14:00 CLT</span>
                    </div>
                  </div>
                </div>
                
                
                <div className="w-full md:w-80 h-48 rounded-xl overflow-hidden relative">
                  <img 
                    src={IMAGES.FOREX_TRADING_BG_10} 
                    alt="Forex Trading Analysis" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-accent/80 to-transparent flex items-end justify-center p-4">
                    <div className="text-center text-white">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Análisis en Vivo</p>
                      <p className="text-lg font-bold">Forex & Mercados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {postsLoading ? (
            <div className="grid grid-responsive-blog gap-mobile-lg">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card border border-border/40 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-2 bg-muted rounded w-16" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No se encontraron artículos que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-responsive-blog gap-mobile-lg">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogPostCard post={post} index={index} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-title-primary">Mantente</span> <span className="text-title-accent">Informado</span>
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Recibe análisis de mercado exclusivos y estrategias de trading personalizadas según tus intereses
            </p>
            <div className="space-y-4">
              <p className="text-sm opacity-75">
                Selecciona tus temas de interés: Noticias • Política • Mercados • Acciones • Divisas • ETF • Criptomonedas
              </p>
              <Button 
                onClick={() => setShowNewsletterPopup(true)}
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-accent/30 px-8 py-3"
              >
                Suscribirse al Newsletter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Risk Profile Modal */}
      <RiskProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={saveProfile}
        showRegistrationOption={true}
      />

      {/* Newsletter Popup */}
      <NewsletterPopup
        isOpen={showNewsletterPopup}
        onClose={() => setShowNewsletterPopup(false)}
      />
    </div>
  );
};

// Blog Post Card Component — Editorial Finance 2026
const categoryColors: Record<string, string> = {
  'Trading':        'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Mercados':       'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Análisis':       'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Educación':      'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Criptomonedas':  'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

const BlogPostCard = ({ post, index: cardIndex }: { post: BlogPost; index?: number }) => {
  const catColor = categoryColors[post.category] || 'bg-accent/10 text-accent border-accent/20';
  const num = String((cardIndex ?? 0) + 1).padStart(2, '0');

  return (
    <Link
      to={`/blog/${post.id}`}
      className="group relative flex flex-col bg-card border border-border/40 rounded-2xl overflow-hidden transition-all duration-500 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1"
    >
      {/* Image with overlay */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Article number */}
        <div className="absolute top-4 left-4 font-mono text-xs font-bold text-white/40 tracking-widest select-none">
          #{num}
        </div>

        {/* Category pill */}
        <div className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-md ${catColor}`}>
          {post.category}
        </div>

        {/* Read time */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          {post.readTime} min
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5">
        <div className="w-8 h-0.5 bg-accent rounded-full mb-4 transition-all duration-500 group-hover:w-16" />

        <h3 className="text-lg font-bold text-foreground leading-snug mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300">
          {post.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/50">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{post.author.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.publishDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-200 shrink-0">
            Leer →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Blog;
