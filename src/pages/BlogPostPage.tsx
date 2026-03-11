import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar, User, Tag, Share2, ChevronRight, BookOpen } from 'lucide-react';
import { blogPosts } from '@/data/index';
import { BlogPost } from '@/lib/index';
import { Button } from '@/components/ui/button';
import SocialShare from '@/components/SocialShare';

const categoryColors: Record<string, string> = {
  'Trading':        'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Mercados':       'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Análisis':       'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'Educación':      'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Criptomonedas':  'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

const renderContent = (content: string) => {
  const paragraphs = content.split('\n\n');
  return paragraphs.map((paragraph, index) => {
    if (paragraph.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl font-bold text-foreground mt-10 mb-4 leading-tight">
          {paragraph.replace('## ', '')}
        </h2>
      );
    }
    if (paragraph.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xl font-semibold text-foreground mt-8 mb-3">
          {paragraph.replace('### ', '')}
        </h3>
      );
    }
    if (paragraph.startsWith('- ') || paragraph.includes('\n- ')) {
      const items = paragraph.split('\n').filter(line => line.startsWith('- '));
      return (
        <ul key={index} className="my-4 space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {item.replace('- ', '')}
            </li>
          ))}
        </ul>
      );
    }
    if (paragraph.match(/^\d+\./)) {
      const items = paragraph.split('\n').filter(line => line.match(/^\d+\./));
      return (
        <ol key={index} className="my-4 space-y-2 list-none">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
              <span className="shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {item.replace(/^\d+\.\s*/, '')}
            </li>
          ))}
        </ol>
      );
    }
    if (paragraph.trim() === '') return null;
    return (
      <p key={index} className="text-muted-foreground leading-relaxed my-4">
        {paragraph}
      </p>
    );
  });
};

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);

  useEffect(() => {
    const found = blogPosts.find(p => p.id === slug);
    if (!found) {
      navigate('/blog', { replace: true });
      return;
    }
    setPost(found);
    // Artículos relacionados: misma categoría, distintos al actual, máx 3
    const rel = blogPosts
      .filter(p => p.id !== slug && p.category === found.category)
      .slice(0, 3);
    // Si hay menos de 3, completar con otros
    if (rel.length < 3) {
      const extra = blogPosts
        .filter(p => p.id !== slug && p.category !== found.category)
        .slice(0, 3 - rel.length);
      setRelated([...rel, ...extra]);
    } else {
      setRelated(rel);
    }
    // Scroll al top al cargar
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return null;

  const catColor = categoryColors[post.category] || 'bg-accent/10 text-accent border-accent/20';
  const postIndex = blogPosts.findIndex(p => p.id === slug);
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null;
  const nextPost = postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null;

  return (
    <div className="flex flex-col w-full">

      {/* Hero con imagen de portada */}
      <section className="relative min-h-[420px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <Link to="/blog" className="hover:text-accent transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground/70 truncate max-w-[200px]">{post.title}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl"
          >
            {/* Category + readtime */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${catColor}`}>
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime} min de lectura
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              {post.excerpt}
            </p>

            {/* Author + Date */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{post.author}</p>
                  <p className="text-xs text-muted-foreground">Autor</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishDate).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 max-w-5xl mx-auto">

            {/* Artículo */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 min-w-0"
            >
              {/* Separador decorativo */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-border/60" />
                <BookOpen className="w-4 h-4 text-accent" />
                <div className="h-px flex-1 bg-border/60" />
              </div>

              {/* Body del artículo */}
              <div className="prose-custom">
                {renderContent(post.content)}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border/50">
                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/60 hover:border-accent/40 hover:text-accent transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                  ¿Te fue útil? Compártelo
                </div>
                <SocialShare post={post} />
              </div>

              {/* Navegación prev/next */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                {prevPost && (
                  <Link to={`/blog/${prevPost.id}`} className="group p-4 rounded-xl border border-border/40 hover:border-accent/40 bg-card/60 hover:bg-card transition-all duration-200">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <ArrowLeft className="w-3 h-3" /> Artículo anterior
                    </div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">{prevPost.title}</p>
                  </Link>
                )}
                {nextPost && (
                  <Link to={`/blog/${nextPost.id}`} className={`group p-4 rounded-xl border border-border/40 hover:border-accent/40 bg-card/60 hover:bg-card transition-all duration-200 ${!prevPost ? 'sm:col-start-2' : ''}`}>
                    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-2">
                      Artículo siguiente <ChevronRight className="w-3 h-3" />
                    </div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 text-right">{nextPost.title}</p>
                  </Link>
                )}
              </div>
            </motion.article>

            {/* Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-8 space-y-6">

                {/* Volver al blog */}
                <Link to="/blog">
                  <Button variant="outline" size="sm" className="w-full border-border/50 hover:border-accent/50 hover:text-accent gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Blog
                  </Button>
                </Link>

                {/* Artículos relacionados */}
                {related.length > 0 && (
                  <div className="bg-card/60 border border-border/40 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-accent rounded-full inline-block" />
                      Artículos Relacionados
                    </h3>
                    <div className="space-y-4">
                      {related.map((rel) => (
                        <Link
                          key={rel.id}
                          to={`/blog/${rel.id}`}
                          className="group flex gap-3 items-start hover:opacity-80 transition-opacity"
                        >
                          <div className="w-16 h-12 rounded-md overflow-hidden shrink-0">
                            <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">{rel.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {rel.readTime} min
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA newsletter */}
                <div className="bg-accent/5 border border-accent/20 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-foreground mb-2">📬 Recibe análisis semanales</h3>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Estrategias de trading y análisis de mercado directo en tu correo.
                  </p>
                  <Link to="/#newsletter">
                    <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
                      Suscribirse gratis
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Artículos relacionados (mobile) */}
      {related.length > 0 && (
        <section className="py-12 bg-muted/30 border-t border-border/40 lg:hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-foreground mb-6">Artículos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link key={rel.id} to={`/blog/${rel.id}`} className="group bg-card border border-border/40 rounded-xl overflow-hidden hover:border-accent/40 transition-colors">
                  <div className="aspect-video overflow-hidden">
                    <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">{rel.title}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rel.readTime} min
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogPostPage;
