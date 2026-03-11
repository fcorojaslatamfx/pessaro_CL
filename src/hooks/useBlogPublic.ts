import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { blogPosts as staticBlogPosts } from '@/data/index';
import { BlogPost } from '@/lib/index';

/**
 * Post de blog tal como viene de la tabla cms_blog_posts_2026_02_23_17_38
 */
interface DBBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_name: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  read_time: number;
  views: number;
}

/**
 * Convierte un post de BD al formato BlogPost que usan Blog.tsx y BlogPostPage.tsx
 */
function dbToStaticFormat(post: DBBlogPost): BlogPost {
  return {
    id: post.slug || post.id,           // slug como ID para la URL
    title: post.title,
    excerpt: post.excerpt || '',
    content: post.content,
    author: post.author_name,
    publishDate: post.published_at || post.created_at,
    category: post.category as BlogPost['category'],
    tags: post.tags || [],
    readTime: post.read_time || 5,
    image: post.featured_image || '',
  };
}

/**
 * Devuelve la lista combinada de posts para el blog público:
 * - Posts de BD con status='published' (editables desde el CMS) van PRIMERO
 * - Posts estáticos del código van después como complemento
 * - Si un post de BD tiene el mismo slug/id que uno estático, el de BD tiene prioridad
 */
export function useBlogPublic() {
  const { data: dbPosts, isLoading, error } = useQuery({
    queryKey: ['blog-public-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_blog_posts_2026_02_23_17_38')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return (data as DBBlogPost[]).map(dbToStaticFormat);
    },
    staleTime: 1000 * 60 * 2, // 2 min cache
  });

  // IDs/slugs ya cubiertos por la BD para no duplicar
  const dbIds = new Set((dbPosts || []).map(p => p.id));

  // Estáticos que NO están ya en la BD
  const staticOnly = staticBlogPosts.filter(p => !dbIds.has(p.id));

  const allPosts: BlogPost[] = [...(dbPosts || []), ...staticOnly];

  return { posts: allPosts, isLoading, error };
}

/**
 * Busca un post específico por slug/id:
 * 1. Primero en BD (cualquier status para preview en admin, pero aquí solo publicados)
 * 2. Luego en estáticos
 */
export function useBlogPost(slug: string | undefined) {
  const { data: dbPost, isLoading, isError } = useQuery({
    queryKey: ['blog-post-public', slug],
    queryFn: async () => {
      if (!slug) return null;
      // Formato correcto de PostgREST para .or() con valores string
      const { data, error } = await supabase
        .from('cms_blog_posts_2026_02_23_17_38')
        .select('*')
        .or(`slug.eq."${slug}",id.eq."${slug}"`)
        .eq('status', 'published')
        .maybeSingle();
      if (error) {
        console.warn('useBlogPost DB error (using static fallback):', error.message);
        return null; // No lanzar error — usar fallback estático
      }
      return data ? dbToStaticFormat(data as DBBlogPost) : null;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,
    retry: false, // No reintentar — ir directo al fallback
  });

  // Fallback a estáticos si no está en BD o si la query falló
  const staticPost = slug
    ? staticBlogPosts.find(p => p.id === slug) ?? null
    : null;

  // post = resultado BD si existe, sino estático, nil si aún cargando y no hay estático
  const post = isLoading
    ? (staticPost ?? null)  // Si hay estático disponible de inmediato, usarlo sin esperar BD
    : (dbPost ?? staticPost);

  // Para prev/next: usar los estáticos como base (los de BD no tienen orden global fácil)
  const allStatic = staticBlogPosts;
  const staticIndex = allStatic.findIndex(p => p.id === slug);
  const prevPost = staticIndex > 0 ? allStatic[staticIndex - 1] : null;
  const nextPost = staticIndex < allStatic.length - 1 ? allStatic[staticIndex + 1] : null;

  // Relacionados: misma categoría, distintos al actual
  const related = post
    ? staticBlogPosts
        .filter(p => p.id !== slug && p.category === post.category)
        .slice(0, 3)
    : [];

  return { post, isLoading: isLoading && !staticPost, prevPost, nextPost, related };
}
