import { Image, X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RichTextEditor } from "../ui/rich-text-editor";
import { Switch } from "../ui/switch";

interface DefinitionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    content: string;
    tags: string[];
    isPublic: boolean;
    files: File[];
  }) => Promise<void>;
}

export function DefinitionForm({ open, onOpenChange, onSubmit }: DefinitionFormProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [tagsString, setTagsString] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsString
        .split(/\s+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onSubmit({
        content: content.trim(),
        tags,
        isPublic,
        files,
      });

      setContent("");
      setTagsString("");
      setIsPublic(false);
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit definition:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent("");
    setTagsString("");
    setIsPublic(false);
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("word.add_definition")}</DialogTitle>
            <DialogDescription>{t("word.definition_desc")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="content">{t("word.definition")}</Label>
              <div className="border rounded-md">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  disabled={isSubmitting}
                  className="min-h-50"
                />
              </div>
              <p className="text-sm text-muted-foreground text-right">{content.length}/5000</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic">{t("word.public_setting")}</Label>
                <p className="text-sm text-muted-foreground">{t("word.public_desc")}</p>
              </div>
              <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">{t("word.tags")}</Label>
              <Input
                id="tags"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder={t("word.tags_placeholder")}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">{t("word.tags_help")}</p>
            </div>

            <div className="grid gap-2">
              <Label>{t("word.media")}</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs group"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Image className="h-4 w-4 mr-2" />
                  {t("word.add_media")}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? t("common.saving") : t("common.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
