import { useState } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBugReports } from "@/hooks/useBugReports";

const BugReportDialog = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { submitReport } = useBugReports();

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    submitReport.mutate(
      { title: title.trim(), description: description.trim() },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-between gap-3 p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors text-left">
          <div className="flex items-center gap-2 min-w-0">
            <Bug className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-sm truncate">Zgłoś błąd</span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Zgłoś błąd
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-title">Tytuł</Label>
            <Input
              id="bug-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Krótki opis problemu"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bug-desc">Opis</Label>
            <Textarea
              id="bug-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opisz dokładnie co się stało..."
              maxLength={1000}
              rows={4}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || submitReport.isPending}
            className="w-full"
          >
            {submitReport.isPending ? "Wysyłanie..." : "Wyślij zgłoszenie"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BugReportDialog;
