import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Tag, Search, Filter, TrendingUp } from 'lucide-react';
import { blogPosts } from '@/data/index';
import { IMAGES } from '@/assets/images';
import { BlogPost } from '@/lib/index';
import { useContactPopup } from '@/hooks/useContactPopup';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import RiskProfileModal from '@/components/RiskProfileModal';
import NewsletterPopup from '@/components/NewsletterPopup';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  
  const { openPopup } = useContactPopup();
  const { showProfileModal, setShowProfileModal, saveProfile } = useRiskProfile();

  const categories = ['Todos', 'Trading', 'Mercados', 'Análisis', 'Educación', 'Criptomonedas'];

  const filteredPosts = blogPosts.filter(post => {
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
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 
                    "bg-accent text-accent-foreground hover:bg-accent/90" : 
                    "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
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
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No se encontraron artículos que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogPostCard post={post} />
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

// Blog Post Card Component
const BlogPostCard = ({ post }: { post: BlogPost }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="h-full border-border/40 bg-card/60 backdrop-blur-md hover:border-accent/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="aspect-video overflow-hidden rounded-t-lg">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
            {post.category}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime} min
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2">
          {post.title}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col">
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-accent/30 text-accent">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishDate).toLocaleDateString('es-ES', { 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full mt-3 text-accent hover:text-accent-foreground hover:bg-accent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Leer menos' : 'Leer más'}
          </Button>
        </div>
      </CardContent>
      
      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-6 pb-6"
        >
          <div className="prose prose-sm max-w-none text-foreground">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h3 key={index} className="text-lg font-bold text-accent mt-6 mb-3">
                    {paragraph.replace('## ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h4 key={index} className="text-base font-semibold text-foreground mt-4 mb-2">
                    {paragraph.replace('### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(item => item.startsWith('- '));
                return (
                  <ul key={index} className="list-disc list-inside space-y-1 my-3">
                    {items.map((item, i) => (
                      <li key={i} className="text-muted-foreground">
                        {item.replace('- ', '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.match(/^\d+\./)) {
                const items = paragraph.split('\n').filter(item => item.match(/^\d+\./));
                return (
                  <ol key={index} className="list-decimal list-inside space-y-1 my-3">
                    {items.map((item, i) => (
                      <li key={i} className="text-muted-foreground">
                        {item.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={index} className="text-muted-foreground leading-relaxed my-3">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </motion.div>
      )}
    </Card>
  );
};

export default Blog;