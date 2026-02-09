import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCouple } from "./useCouple";

export interface PhotoAlbum {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  cover_url: string | null;
  created_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  url: string;
  caption: string | null;
  taken_at: string | null;
  uploaded_by: string;
  created_at: string;
}

export const usePhotoAlbums = () => {
  const { user } = useAuth();
  const { couple } = useCouple();
  const queryClient = useQueryClient();

  const { data: albums = [], isLoading } = useQuery({
    queryKey: ["photo_albums", couple?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_albums")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as PhotoAlbum[];
    },
    enabled: !!couple,
  });

  const addAlbum = useMutation({
    mutationFn: async (album: { title: string; description?: string; location?: string; date?: string }) => {
      const { data, error } = await supabase
        .from("photo_albums")
        .insert({ 
          couple_id: couple!.id,
          title: album.title,
          description: album.description || null,
          location: album.location || null,
          date: album.date || null
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photo_albums"] }),
  });

  const updateAlbum = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; location?: string; date?: string; cover_url?: string }) => {
      const { error } = await supabase
        .from("photo_albums")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photo_albums"] }),
  });

  const deleteAlbum = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("photo_albums")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photo_albums"] }),
  });

  return { albums, isLoading, addAlbum, updateAlbum, deleteAlbum };
};

export const usePhotos = (albumId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos", albumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("album_id", albumId!)
        .order("taken_at", { ascending: false });
      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!albumId,
  });

  const uploadPhoto = useMutation({
    mutationFn: async ({ file, caption, taken_at }: { file: File; caption?: string; taken_at?: string }) => {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${albumId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;

      // Store the storage path (not a public URL) since bucket is private
      const storagePath = fileName;

      // Insert photo record with storage path
      const { error } = await supabase
        .from("photos")
        .insert({
          album_id: albumId!,
          uploaded_by: user!.id,
          url: storagePath,
          caption: caption || null,
          taken_at: taken_at || null
        });
      
      if (error) throw error;
      
      return storagePath;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photos", albumId] }),
  });

  const deletePhoto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photos", albumId] }),
  });

  return { photos, isLoading, uploadPhoto, deletePhoto };
};
