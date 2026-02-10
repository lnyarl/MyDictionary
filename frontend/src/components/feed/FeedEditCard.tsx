import type { Definition } from "@stashy/shared";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Input,
  Label,
  Separator,
  Switch,
} from "../ui";
import { RichTextEditor } from "../ui/rich-text-editor";

type FeedEditCardProps = {
  definition: Definition;
  onSave: (data: { content: string; tags: string[]; isPublic: boolean }) => Promise<void>;
  onCancel: () => void;
  showWord?: boolean;
};

export function FeedEditCard({
  definition,
  onSave,
  onCancel,
  showWord = false,
}: FeedEditCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [content, setContent] = useState(definition.content);
  const [tagsString, setTagsString] = useState<string>(definition.tags?.join(" ") || "");
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = new Date(definition.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isEdited = definition.updatedAt !== definition.createdAt;

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/users/${definition.userId}`);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    console.log(definition.content);

    setIsSaving(true);
    try {
      const tags = tagsString
        .split(/\s+/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await onSave({ content: content.trim(), tags, isPublic: true });
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
    if (e.key === "Enter" && e.metaKey) {
      handleSave();
    }
  };

  return (
    <Card className="ring-2 ring-primary/20">
      <CardHeader>
        {showWord && definition.term && (
          <div className="mb-2">
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-lg"
              onClick={() => navigate(`/words/${definition.wordId}/edit`)}
            >
              {definition.term}
            </Button>
          </div>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6 cursor-pointer border border-gray-800" onClick={handleUserClick}>
              <AvatarImage src={definition.profilePicture} className="object-cover" />
              <AvatarFallback>{definition.nickname?.[0].toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-muted-foreground"
              onClick={handleUserClick}
            >
              {definition.nickname || t("common.user")}
            </Button>
            <span>•</span>
            <span>{formattedDate}</span>
            {isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              disabled={isSaving}
              title={t("common.cancel")}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              title={t("common.save")}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" onKeyDown={handleKeyDown}>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {content.length}/5000
        </span>
        <RichTextEditor
          value={content}
          onChange={setContent}
          className="min-h-30"
          disabled={isSaving}
          autoFocus
        />
        <div className="flex items-center justify-between gap-2">
          <Input
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder={t("word.tags_placeholder")}
            className="flex-1"
            disabled={isSaving}
          />
        </div>
        {/* <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="isPublic" className="text-sm">
              {t("word.public_setting")}
            </Label>
          </div>
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isSaving}
          />
        </div> */}
      </CardContent>
    </Card>
  );
}
