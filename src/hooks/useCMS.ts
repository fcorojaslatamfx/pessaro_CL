import { supabase } from "@/integrations/supabase/client";
import {
  BlogPost,
  TeamMember,
  Service,
  TradingInstrument,
  MediaFile,
  SiteSetting,
  PageContent,
  FAQ
} from "@/lib/cms-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Bucket real de storage para uploads
const MEDIA_BUCKET = 'media-library-2026-01-30-20-41';

// Helper: construye URL pública desde file_path
function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

// Helper: DELETE seguro (UPDATE + INSERT, nunca upsert genérico)
// Excluye siempre created_at y campos generados
function cleanForUpdate<T extends Record<string, any>>(obj: T, extraExclude: string[] = []): Partial<T> {
  const exclude = new Set(['created_at', 'page_key', ...extraExclude]);
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => !exclude.has(k))
  ) as Partial<T>;
}

export function useCMS() {
  const queryClient = useQueryClient();

  // =========================================================
  // BLOG — cms_blog_posts_2026_02_23_17_38
  // featured_image (NO cover_image), author_name (NO author_id)
  // =========================================================
  const blog = {
    usePosts: () => useQuery({
      queryKey: ['blog-posts'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as BlogPost[];
      }
    }),
    usePost: (id: string) => useQuery({
      queryKey: ['blog-post', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return data as BlogPost;
      },
      enabled: !!id
    }),
    useUpsert: () => useMutation({
      mutationFn: async (post: Partial<BlogPost>) => {
        if (post.id) {
          const { id, ...rest } = post;
          const payload = cleanForUpdate(rest);
          const { data, error } = await supabase
            .from('cms_blog_posts_2026_02_23_17_38')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data as BlogPost;
        } else {
          const payload = cleanForUpdate(post);
          const { data, error } = await supabase
            .from('cms_blog_posts_2026_02_23_17_38')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data as BlogPost;
        }
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    }),
    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['blog-posts'] })
    })
  };

  // =========================================================
  // TEAM — cms_team_members_2026_02_23_17_38
  // order_index (NO order)
  // =========================================================
  const team = {
    useMembers: () => useQuery({
      queryKey: ['team-members'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_team_members_2026_02_23_17_38')
          .select('*')
          .order('order_index', { ascending: true });
        if (error) throw error;
        return data as TeamMember[];
      }
    }),
    useUpsert: () => useMutation({
      mutationFn: async (member: Partial<TeamMember>) => {
        if (member.id) {
          const { id, ...rest } = member;
          const payload = cleanForUpdate(rest);
          const { data, error } = await supabase
            .from('cms_team_members_2026_02_23_17_38')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data as TeamMember;
        } else {
          const payload = cleanForUpdate(member);
          const { data, error } = await supabase
            .from('cms_team_members_2026_02_23_17_38')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data as TeamMember;
        }
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members'] })
    }),
    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_team_members_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members'] })
    })
  };

  // =========================================================
  // SERVICES — cms_services_2026_02_23_17_38
  // service_id (unique), icon_name, order_index (NO order ni icon)
  // =========================================================
  const services = {
    useAll: () => useQuery({
      queryKey: ['services'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .select('*')
          .order('order_index', { ascending: true });
        if (error) throw error;
        return data as Service[];
      }
    }),
    useUpsert: () => useMutation({
      mutationFn: async (service: Partial<Service>) => {
        if (service.id) {
          const { id, ...rest } = service;
          const payload = cleanForUpdate(rest);
          const { data, error } = await supabase
            .from('cms_services_2026_02_23_17_38')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data as Service;
        } else {
          const payload = cleanForUpdate(service);
          const { data, error } = await supabase
            .from('cms_services_2026_02_23_17_38')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data as Service;
        }
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] })
    }),
    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] })
    })
  };

  // =========================================================
  // INSTRUMENTS — cms_instruments_2026_02_23_17_38
  // NO tiene order/order_index — ordenar por symbol
  // =========================================================
  const instruments = {
    useAll: () => useQuery({
      queryKey: ['trading-instruments'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .select('*')
          .order('symbol', { ascending: true });
        if (error) throw error;
        return data as TradingInstrument[];
      }
    }),
    useUpsert: () => useMutation({
      mutationFn: async (instrument: Partial<TradingInstrument>) => {
        if (instrument.id) {
          const { id, ...rest } = instrument;
          const payload = cleanForUpdate(rest);
          const { data, error } = await supabase
            .from('cms_instruments_2026_02_23_17_38')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data as TradingInstrument;
        } else {
          const payload = cleanForUpdate(instrument);
          const { data, error } = await supabase
            .from('cms_instruments_2026_02_23_17_38')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data as TradingInstrument;
        }
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trading-instruments'] })
    }),
    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trading-instruments'] })
    })
  };

  // =========================================================
  // MEDIA — cms_media_files_2026_02_23_17_38
  // Columnas: filename, original_name, file_path, file_size, mime_type
  // Bucket: media-library-2026-01-30-20-41
  // =========================================================
  const media = {
    useFiles: () => useQuery({
      queryKey: ['media-files'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data as MediaFile[];
      }
    }),
    useUpload: () => useMutation({
      mutationFn: async ({ file, subfolder }: { file: File; subfolder?: string }) => {
        const ext = file.name.split('.').pop();
        const safeFilename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = subfolder ? `${subfolder}/${safeFilename}` : safeFilename;

        const { error: uploadError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(filePath, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;

        const { data: mediaData, error: dbError } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .insert({
            filename: safeFilename,
            original_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            is_active: true
          })
          .select()
          .single();
        if (dbError) throw dbError;

        // Adjuntar URL pública para uso inmediato en UI
        return { ...mediaData, publicUrl: getPublicUrl(filePath) } as MediaFile & { publicUrl: string };
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-files'] })
    }),
    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { data: file } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .select('file_path')
          .eq('id', id)
          .single();

        if (file?.file_path) {
          await supabase.storage.from(MEDIA_BUCKET).remove([file.file_path]);
        }

        const { error } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-files'] })
    }),
    getPublicUrl  // exponer helper para uso en componentes
  };

  // =========================================================
  // SETTINGS — cms_site_settings_2026_02_23_17_38
  // setting_value es text (NO any). Filtrar por is_active para lectura pública.
  // En admin CMS ver todos.
  // =========================================================
  const settings = {
    useAll: () => useQuery({
      queryKey: ['site-settings'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .select('*')
          .order('category', { ascending: true });
        if (error) throw error;
        return data as SiteSetting[];
      }
    }),
    useUpdate: () => useMutation({
      mutationFn: async (setting: Pick<SiteSetting, 'id' | 'setting_value'>) => {
        // Solo actualizar setting_value — nunca tocar setting_key (NOT NULL, unique)
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .update({
            setting_value: setting.setting_value,
            updated_at: new Date().toISOString()
          })
          .eq('id', setting.id)
          .select()
          .single();
        if (error) throw error;
        return data as SiteSetting;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    })
  };

  // =========================================================
  // PAGE CONTENT — cms_page_content_2026_02_23_17_38
  // page_slug = columna real (NOT NULL, escribible)
  // page_key  = columna GENERATED STORED (solo lectura, NO enviar en INSERT/UPDATE)
  // content   = text (NO JSON)
  // =========================================================
  const pages = {
    useContent: (pageSlug: string) => useQuery({
      queryKey: ['page-content', pageSlug],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .select('*')
          .eq('page_slug', pageSlug);
        if (error) throw error;
        return data as PageContent[];
      },
      enabled: !!pageSlug
    }),
    useAllContent: () => useQuery({
      queryKey: ['page-content-all'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .select('*')
          .order('page_slug', { ascending: true });
        if (error) throw error;
        return data as PageContent[];
      }
    }),
    useUpdateSection: () => useMutation({
      mutationFn: async (section: Partial<PageContent>) => {
        // Nunca enviar page_key (columna generada) ni created_at
        const payload = cleanForUpdate(section);

        if (payload.id) {
          const { id, ...rest } = payload;
          const { data, error } = await supabase
            .from('cms_page_content_2026_02_23_17_38')
            .update({ ...rest, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data as PageContent;
        } else {
          // INSERT requiere page_slug y section_key
          if (!payload.page_slug || !payload.section_key) {
            throw new Error('page_slug y section_key son requeridos');
          }
          const { data, error } = await supabase
            .from('cms_page_content_2026_02_23_17_38')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data as PageContent;
        }
      },
      onSuccess: (_, variables) => {
        const slug = variables.page_slug;
        queryClient.invalidateQueries({ queryKey: ['page-content', slug] });
        queryClient.invalidateQueries({ queryKey: ['page-content-all'] });
      }
    })
  };

  // =========================================================
  // FAQS — cms_faqs_2026_02_23_17_38
  // faq_id (texto único), order_index
  // =========================================================
  const faqs = {
    useAll: () => useQuery({
      queryKey: ['faqs'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_faqs_2026_02_23_17_38')
          .select('*')
          .order('order_index', { ascending: true });
        if (error) throw error;
        return data as FAQ[];
      }
    }),
    useUpsert: () => useMutation({
      mutationFn: async (faq: Partial<FAQ>) => {
        if (faq.id) {
          const { id, ...rest } = faq;
          const payload = cleanForUpdate(rest);
          const { data, error } = await supabase
            .from('cms_faqs_2026_02_23_17_38')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
          if (error) throw error;
          return data as FAQ;
        } else {
          const payload = cleanForUpdate(faq);
          const { data, error } = await supabase
            .from('cms_faqs_2026_02_23_17_38')
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          return data as FAQ;
        }
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] })
    }),
    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from('cms_faqs_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] })
    })
  };

  return {
    blog,
    team,
    services,
    instruments,
    media,
    settings,
    pages,
    faqs
  };
}
