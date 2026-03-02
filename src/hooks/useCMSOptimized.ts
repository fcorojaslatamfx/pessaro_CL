import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// =============================================
// TIPOS PARA EL CMS OPTIMIZADO
// =============================================

export interface CMSPageContent {
  id: string;
  page_slug: string;
  section_key: string;
  content_type: 'text' | 'html' | 'image' | 'json';
  title?: string;
  content?: string;
  image_url?: string;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSService {
  id: string;
  service_id: string;
  title: string;
  description: string;
  long_description?: string;
  icon_name: string;
  benefits: string[];
  features?: any;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSInstrument {
  id: string;
  symbol: string;
  name: string;
  category: string;
  spread: string;
  leverage: string;
  trending: 'up' | 'down' | 'neutral';
  is_popular: boolean;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CMSTeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image_url?: string;
  linkedin_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  author_name: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at: string;
  read_time: number;
  views: number;
}

export interface CMSFAQ {
  id: string;
  faq_id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSSiteSetting {
  id: string;
  setting_key: string;
  setting_value?: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json';
  description?: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CMSMediaFile {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  alt_text?: string;
  description?: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// HOOK CMS OPTIMIZADO
// =============================================

export function useCMSOptimized() {
  const queryClient = useQueryClient();

  // =============================================
  // CONTENIDO DE PÁGINAS
  // =============================================
  const pageContent = {
    useAll: () => useQuery({
      queryKey: ['cms-page-content'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('page_slug', { ascending: true });
        if (error) throw error;
        return data as CMSPageContent[];
      }
    }),

    useByPage: (pageSlug: string) => useQuery({
      queryKey: ['cms-page-content', pageSlug],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('is_active', true)
          .order('section_key', { ascending: true });
        if (error) throw error;
        return data as CMSPageContent[];
      },
      enabled: !!pageSlug
    }),

    useBySection: (pageSlug: string, sectionKey: string) => useQuery({
      queryKey: ['cms-page-content', pageSlug, sectionKey],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .select('*')
          .eq('page_slug', pageSlug)
          .eq('section_key', sectionKey)
          .eq('is_active', true)
          .single();
        if (error) throw error;
        return data as CMSPageContent;
      },
      enabled: !!pageSlug && !!sectionKey
    }),

    useUpsert: () => useMutation({
      mutationFn: async (content: Partial<CMSPageContent>) => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .upsert(content, { onConflict: 'page_slug,section_key' })
          .select()
          .single();
        if (error) throw error;
        return data as CMSPageContent;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-page-content'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-page-content'] });
      }
    })
  };

  // =============================================
  // SERVICIOS
  // =============================================
  const services = {
    useAll: () => useQuery({
      queryKey: ['cms-services'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        if (error) throw error;
        return data as CMSService[];
      }
    }),

    useById: (id: string) => useQuery({
      queryKey: ['cms-service', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return data as CMSService;
      },
      enabled: !!id
    }),

    useByServiceId: (serviceId: string) => useQuery({
      queryKey: ['cms-service-by-service-id', serviceId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .select('*')
          .eq('service_id', serviceId)
          .eq('is_active', true)
          .single();
        if (error) throw error;
        return data as CMSService;
      },
      enabled: !!serviceId
    }),

    useUpsert: () => useMutation({
      mutationFn: async (service: Partial<CMSService>) => {
        const { data, error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .upsert(service, { onConflict: 'service_id' })
          .select()
          .single();
        if (error) throw error;
        return data as CMSService;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-services'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .update({ is_active: false })
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-services'] });
      }
    })
  };

  // =============================================
  // INSTRUMENTOS
  // =============================================
  const instruments = {
    useAll: () => useQuery({
      queryKey: ['cms-instruments'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('symbol', { ascending: true });
        if (error) throw error;
        return data as CMSInstrument[];
      }
    }),

    useByCategory: (category: string) => useQuery({
      queryKey: ['cms-instruments', category],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .order('symbol', { ascending: true });
        if (error) throw error;
        return data as CMSInstrument[];
      },
      enabled: !!category
    }),

    usePopular: () => useQuery({
      queryKey: ['cms-instruments-popular'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .select('*')
          .eq('is_popular', true)
          .eq('is_active', true)
          .order('symbol', { ascending: true });
        if (error) throw error;
        return data as CMSInstrument[];
      }
    }),

    useUpsert: () => useMutation({
      mutationFn: async (instrument: Partial<CMSInstrument>) => {
        const { data, error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .upsert(instrument, { onConflict: 'symbol' })
          .select()
          .single();
        if (error) throw error;
        return data as CMSInstrument;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-instruments'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .update({ is_active: false })
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-instruments'] });
      }
    })
  };

  // =============================================
  // EQUIPO
  // =============================================
  const team = {
    useAll: () => useQuery({
      queryKey: ['cms-team'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_team_members_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        if (error) throw error;
        return data as CMSTeamMember[];
      }
    }),

    useUpsert: () => useMutation({
      mutationFn: async (member: Partial<CMSTeamMember>) => {
        const { data, error } = await supabase
          .from('cms_team_members_2026_02_23_17_38')
          .upsert(member)
          .select()
          .single();
        if (error) throw error;
        return data as CMSTeamMember;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-team'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_team_members_2026_02_23_17_38')
          .update({ is_active: false })
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-team'] });
      }
    })
  };

  // =============================================
  // BLOG
  // =============================================
  const blog = {
    useAll: () => useQuery({
      queryKey: ['cms-blog'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as CMSBlogPost[];
      }
    }),

    usePublished: () => useQuery({
      queryKey: ['cms-blog-published'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (error) throw error;
        return data as CMSBlogPost[];
      }
    }),

    useBySlug: (slug: string) => useQuery({
      queryKey: ['cms-blog-post', slug],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .select('*')
          .eq('slug', slug)
          .single();
        if (error) throw error;
        return data as CMSBlogPost;
      },
      enabled: !!slug
    }),

    useUpsert: () => useMutation({
      mutationFn: async (post: Partial<CMSBlogPost>) => {
        const { data, error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .upsert(post, { onConflict: 'slug' })
          .select()
          .single();
        if (error) throw error;
        return data as CMSBlogPost;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-blog'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-blog'] });
      }
    })
  };

  // =============================================
  // FAQs
  // =============================================
  const faqs = {
    useAll: () => useQuery({
      queryKey: ['cms-faqs'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_faqs_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        if (error) throw error;
        return data as CMSFAQ[];
      }
    }),

    useByCategory: (category: string) => useQuery({
      queryKey: ['cms-faqs', category],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_faqs_2026_02_23_17_38')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        if (error) throw error;
        return data as CMSFAQ[];
      },
      enabled: !!category
    }),

    useUpsert: () => useMutation({
      mutationFn: async (faq: Partial<CMSFAQ>) => {
        const { data, error } = await supabase
          .from('cms_faqs_2026_02_23_17_38')
          .upsert(faq, { onConflict: 'faq_id' })
          .select()
          .single();
        if (error) throw error;
        return data as CMSFAQ;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-faqs'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_faqs_2026_02_23_17_38')
          .update({ is_active: false })
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-faqs'] });
      }
    })
  };

  // =============================================
  // CONFIGURACIONES DEL SITIO
  // =============================================
  const settings = {
    useAll: () => useQuery({
      queryKey: ['cms-settings'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true });
        if (error) throw error;
        return data as CMSSiteSetting[];
      }
    }),

    useByCategory: (category: string) => useQuery({
      queryKey: ['cms-settings', category],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .order('setting_key', { ascending: true });
        if (error) throw error;
        return data as CMSSiteSetting[];
      },
      enabled: !!category
    }),

    useByKey: (settingKey: string) => useQuery({
      queryKey: ['cms-setting', settingKey],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .select('*')
          .eq('setting_key', settingKey)
          .eq('is_active', true)
          .single();
        if (error) throw error;
        return data as CMSSiteSetting;
      },
      enabled: !!settingKey
    }),

    useUpsert: () => useMutation({
      mutationFn: async (setting: Partial<CMSSiteSetting>) => {
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .upsert(setting, { onConflict: 'setting_key' })
          .select()
          .single();
        if (error) throw error;
        return data as CMSSiteSetting;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-settings'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .update({ is_active: false })
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-settings'] });
      }
    })
  };

  // =============================================
  // ARCHIVOS DE MEDIOS
  // =============================================
  const media = {
    useAll: () => useQuery({
      queryKey: ['cms-media'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as CMSMediaFile[];
      }
    }),

    useByTags: (tags: string[]) => useQuery({
      queryKey: ['cms-media', 'tags', tags],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .select('*')
          .overlaps('tags', tags)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as CMSMediaFile[];
      },
      enabled: tags.length > 0
    }),

    useUpsert: () => useMutation({
      mutationFn: async (file: Partial<CMSMediaFile>) => {
        const { data, error } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .upsert(file)
          .select()
          .single();
        if (error) throw error;
        return data as CMSMediaFile;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-media'] });
      }
    }),

    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .update({ is_active: false })
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cms-media'] });
      }
    })
  };

  return {
    pageContent,
    services,
    instruments,
    team,
    blog,
    faqs,
    settings,
    media
  };
}