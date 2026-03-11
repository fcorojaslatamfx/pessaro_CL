import { supabase } from "@/integrations/supabase/client";
import {
  BlogPost,
  TeamMember,
  Service,
  TradingInstrument,
  MediaFile,
  SiteSetting,
  PageContent
} from "@/lib/cms-types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCMS() {
  const queryClient = useQueryClient();

  // --- Blog Operations ---
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
        const { data, error } = await supabase
          .from('cms_blog_posts_2026_02_23_17_38')
          .upsert(post)
          .select()
          .single();
        if (error) throw error;
        return data as BlogPost;
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

  // --- Team Operations ---
  const team = {
    useMembers: () => useQuery({
      queryKey: ['team-members'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_team_members_2026_02_23_17_38')
          .select('*')
          .order('order', { ascending: true });
        if (error) throw error;
        return data as TeamMember[];
      }
    }),
    useUpsert: () => useMutation({
      mutationFn: async (member: Partial<TeamMember>) => {
        const { data, error } = await supabase
          .from('cms_team_members_2026_02_23_17_38')
          .upsert(member)
          .select()
          .single();
        if (error) throw error;
        return data as TeamMember;
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

  // --- Services Operations ---
  const services = {
    useAll: () => useQuery({
      queryKey: ['services'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .select('*')
          .order('order', { ascending: true });
        if (error) throw error;
        return data as Service[];
      }
    }),
    useUpsert: () => useMutation({
      mutationFn: async (service: Partial<Service>) => {
        const { data, error } = await supabase
          .from('cms_services_2026_02_23_17_38')
          .upsert(service)
          .select()
          .single();
        if (error) throw error;
        return data as Service;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] })
    })
  };

  // --- Trading Instruments Operations ---
  const instruments = {
    useAll: () => useQuery({
      queryKey: ['trading-instruments'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .select('*')
          .order('order', { ascending: true });
        if (error) throw error;
        return data as TradingInstrument[];
      }
    }),
    useUpsert: () => useMutation({
      mutationFn: async (instrument: Partial<TradingInstrument>) => {
        const { data, error } = await supabase
          .from('cms_instruments_2026_02_23_17_38')
          .upsert(instrument)
          .select()
          .single();
        if (error) throw error;
        return data as TradingInstrument;
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

  // --- Media Operations ---
  const media = {
    useFiles: (folder?: string) => useQuery({
      queryKey: ['media-files', folder],
      queryFn: async () => {
        let query = supabase.from('cms_media_files_2026_02_23_17_38').select('*').order('created_at', { ascending: false });
        if (folder) query = query.eq('folder', folder);
        const { data, error } = await query;
        if (error) throw error;
        return data as MediaFile[];
      }
    }),
    useUpload: () => useMutation({
      mutationFn: async ({ file, folder, userId }: { file: File, folder: string, userId: string }) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        const { data: mediaData, error: dbError } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .insert({
            name: file.name,
            url: publicUrl,
            file_type: file.type,
            size: file.size,
            folder,
            created_by: userId
          })
          .select()
          .single();

        if (dbError) throw dbError;
        return mediaData as MediaFile;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-files'] })
    }),
    useDelete: () => useMutation({
      mutationFn: async (id: string) => {
        const { data: file } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .select('url')
          .eq('id', id)
          .single();
        
        if (file) {
          const path = file.url.split('/storage/v1/object/public/media/')[1];
          if (path) await supabase.storage.from('media').remove([path]);
        }

        const { error } = await supabase
          .from('cms_media_files_2026_02_23_17_38')
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-files'] })
    })
  };

  // --- Settings Operations ---
  const settings = {
    useAll: () => useQuery({
      queryKey: ['site-settings'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .select('*');
        if (error) throw error;
        return data as SiteSetting[];
      }
    }),
    useUpdate: () => useMutation({
      mutationFn: async (setting: Partial<SiteSetting>) => {
        const { data, error } = await supabase
          .from('cms_site_settings_2026_02_23_17_38')
          .upsert(setting)
          .select()
          .single();
        if (error) throw error;
        return data as SiteSetting;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    })
  };

  // --- Page Content Operations ---
  const pages = {
    useContent: (pageKey: string) => useQuery({
      queryKey: ['page-content', pageKey],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .select('*')
          .eq('page_key', pageKey);
        if (error) throw error;
        return data as PageContent[];
      }
    }),
    useUpdateSection: () => useMutation({
      mutationFn: async (section: Partial<PageContent>) => {
        const { data, error } = await supabase
          .from('cms_page_content_2026_02_23_17_38')
          .upsert(section)
          .select()
          .single();
        if (error) throw error;
        return data as PageContent;
      },
      onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: ['page-content', variables.page_key] })
    })
  };

  return {
    blog,
    team,
    services,
    instruments,
    media,
    settings,
    pages
  };
}