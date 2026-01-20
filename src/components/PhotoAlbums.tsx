import { useState, useRef } from "react";
import { Camera, Plus, Trash2, MapPin, Calendar, Loader2, X, FolderOpen, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePhotoAlbums, usePhotos } from "@/hooks/usePhotoAlbums";
import { useCouple } from "@/hooks/useCouple";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";
import WidgetWrapper from "./WidgetWrapper";

const PhotoAlbums = () => {
  const { couple } = useCouple();
  const { albums, isLoading, addAlbum, deleteAlbum } = usePhotoAlbums();
  
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  
  // Album form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");

  const handleAddAlbum = async () => {
    if (!title.trim()) {
      toast.error("Podaj nazwę albumu");
      return;
    }
    try {
      await addAlbum.mutateAsync({ 
        title: title.trim(), 
        description: description || undefined,
        location: location || undefined,
        date: date || undefined
      });
      toast.success("Utworzono album! 📷");
      setTitle("");
      setDescription("");
      setLocation("");
      setDate("");
      setIsAlbumOpen(false);
    } catch {
      toast.error("Nie udało się utworzyć");
    }
  };

  const handleDeleteAlbum = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteAlbum.mutateAsync(id);
      toast.success("Usunięto album");
    } catch {
      toast.error("Błąd");
    }
  };

  if (!couple) {
    return (
      <WidgetWrapper
        title="Wspomnienia"
        icon={<Camera className="w-5 h-5 text-primary" />}
        iconBg="bg-rose-light"
      >
        <p className="text-sm text-muted-foreground text-center py-4">
          Najpierw połącz się z partnerem 💕
        </p>
      </WidgetWrapper>
    );
  }

  // Show album detail view
  if (selectedAlbum) {
    return (
      <AlbumDetailView 
        albumId={selectedAlbum} 
        albums={albums}
        onBack={() => setSelectedAlbum(null)} 
      />
    );
  }

  return (
    <WidgetWrapper
      title="Wspomnienia"
      icon={<Camera className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <Dialog open={isAlbumOpen} onOpenChange={setIsAlbumOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy album</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Nazwa albumu (np. Wakacje 2024)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                placeholder="Opis (opcjonalne)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Lokalizacja"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <Button onClick={handleAddAlbum} className="w-full" disabled={addAlbum.isPending}>
                {addAlbum.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Utwórz album"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-6">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Brak albumów
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Stwórz pierwszy album ze wspomnieniami!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album.id)}
              className="relative group rounded-xl overflow-hidden aspect-square bg-secondary/50 hover:bg-secondary transition-colors text-left"
            >
              {album.cover_url ? (
                <img 
                  src={album.cover_url} 
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="font-medium text-white text-sm truncate">{album.title}</p>
                {album.location && (
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {album.location}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleDeleteAlbum(album.id, e)}
              >
                <Trash2 className="w-3 h-3 text-white" />
              </Button>
            </button>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
};

// Separate component for album detail view
const AlbumDetailView = ({ 
  albumId, 
  albums,
  onBack 
}: { 
  albumId: string; 
  albums: any[];
  onBack: () => void;
}) => {
  const { photos, isLoading, uploadPhoto, deletePhoto } = usePhotos(albumId);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const album = albums.find(a => a.id === albumId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadPhoto.mutateAsync({ file });
      }
      toast.success(`Dodano ${files.length} zdjęć!`);
    } catch {
      toast.error("Nie udało się przesłać zdjęć");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      await deletePhoto.mutateAsync(id);
      toast.success("Usunięto");
    } catch {
      toast.error("Błąd");
    }
  };

  return (
    <WidgetWrapper
      title={album?.title || "Album"}
      icon={<Camera className="w-5 h-5 text-primary-foreground" />}
      iconBg="gradient-primary"
      actions={
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Album info */}
      {album && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          {album.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {album.location}
            </span>
          )}
          {album.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {format(new Date(album.date), "d MMM yyyy", { locale: pl })}
            </span>
          )}
        </div>
      )}

      {/* Upload button */}
      <Button
        variant="outline"
        className="w-full mb-4"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        Dodaj zdjęcia
      </Button>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-6">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            Brak zdjęć w tym albumie
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="relative group aspect-square rounded-lg overflow-hidden"
            >
              <img 
                src={photo.url} 
                alt={photo.caption || ""} 
                className="w-full h-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeletePhoto(photo.id)}
              >
                <Trash2 className="w-3 h-3 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
};

export default PhotoAlbums;
