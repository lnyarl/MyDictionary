import { EditorView } from "@codemirror/view";
import { Calendar, Globe, Lock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import type { CreateFeedInput } from "@/lib/api/feed";
import { getItem, removeItem } from "@/lib/localStorage";
import { toDayString } from "@/lib/utils/date";
import { type Word, wordsApi } from "../../lib/api/words";
import { Button } from "../ui/button";
import { STORAGE_KEY } from "../ui/codemirror/save-extension";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RichTextEditor } from "../ui/rich-text-editor";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

type WordFormProps = {
  onCreate: (data: CreateFeedInput) => Promise<void>;
};

export function FeedForm({ onCreate }: WordFormProps) {
  const { t } = useTranslation();
  const today = toDayString();
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<{
    myWords: Word[];
    othersWords: Word[];
  }>({ myWords: [], othersWords: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tempDocument = useMemo(() => {
    return getItem<string>(STORAGE_KEY);
  }, []);
  const viewRef = useRef<EditorView>(null);

  const [definition, setDefinition] = useState<{
    content: string;
    tags: string;
    isPublic: boolean;
  }>({ content: tempDocument ?? "", tags: "", isPublic: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearEditor = () => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: "",
        },
      });
    }
  };
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (term === today) return;
      if (!term.trim() || term.length < 2) {
        setSuggestions({ myWords: [], othersWords: [] });
        return;
      }
      try {
        const response = await wordsApi.autocomplete(term);
        setSuggestions(response);
        if (response.myWords.length === 1 && response.othersWords.length === 0 && response.myWords[0].term === term) {
          setShowSuggestions(false);
          return;
        } else {
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [term, today]);

  const handleSelectSuggestion = (word: Word) => {
    setTerm(word.term);
    setShowSuggestions(false);
    setSuggestions({ myWords: [], othersWords: [] });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit(e);
    } else if (e.key === "Enter") {
      document.getElementById("term")?.focus();
    }
  };

  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) {
      toast.toast({ description: "단어를 작성해주세요" });
      document.getElementById("term")?.focus();
      return;
    }
    if (!definition.content.trim()) {
      toast.toast({ description: "단어를 작성해주세요" });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDefinition = {
        content: definition.content.trim(),
        tags: definition.tags
          .split(/\s+/)
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        isPublic: definition.isPublic,
      };
      await onCreate({
        term: term.trim(),
        definition: formattedDefinition,
      } as CreateFeedInput);
      setTerm("");
      setDefinition({ content: "", tags: "", isPublic: true });
      clearEditor();
      removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to submit word:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isToday = term === today;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="border border-gray-200 p-1 bg-gray-50">
        <div className="border border-gray-200 bg-card transition-all p-4">
          <div className="relative flex">
            <Input
              id="term"
              tabIndex={0}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setShowSuggestions(false);
              }}
              maxLength={100}
              autoComplete="off"
              className="border-0 justify-between items-center-safe focus-visible:ring-0 shadow-none text-4xl font-medium p-3 h-auto"
              placeholder={t("word.term_placeholder")}
            />

            <Button
              type="button"
              variant={isToday ? "default" : "ghost"}
              tabIndex={-1}
              size="sm"
              onClick={() => setTerm(today)}
              className={`transition-colors m-1.25 ${isToday ? "bg-primary hover:bg-primary/80 text-white" : "hover:bg-primary/5"
                }`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t("word.today")}
            </Button>
            {showSuggestions &&
              (suggestions.myWords.length > 0 || suggestions.othersWords.length > 0) && (
                <div className="absolute top-full left-0 w-full z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                  <ul className="max-h-75 overflow-auto py-1">
                    {suggestions.myWords.length > 0 && (
                      <>
                        <li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          {t("word.my_words")}
                        </li>
                        {suggestions.myWords.map((word) => (
                          <li
                            key={word.id}
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-4 py-1.5 text-sm outline-none bg-blue-50/50 hover:bg-blue-100 hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onClick={() => handleSelectSuggestion(word)}
                          >
                            {word.term}
                          </li>
                        ))}
                      </>
                    )}
                    {suggestions.othersWords.length > 0 && (
                      <>
                        <li className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 border-t">
                          {t("word.others_words")}
                        </li>
                        {suggestions.othersWords.map((word) => (
                          <li
                            key={word.id}
                            className="relative flex cursor-pointer select-none items-center rounded-sm px-4 py-1.5 text-sm outline-none bg-blue-50/50 hover:bg-blue-100 hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onClick={() => handleSelectSuggestion(word)}
                          >
                            {word.term}
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </div>
              )}
          </div>
          <RichTextEditor
            value={definition.content}
            onChange={(value) => setDefinition({ ...definition, content: value })}
            onKeyDown={handleKeyDown}
            placeholder={t("word.definition_placeholder")}
            className="border-0 text-sm focus-visible:ring-0 shadow-none rounded-none min-h-30 max-h-120 px-2 py-2"
            ref={viewRef}
            autoFocus
          />
          <div className="px-3">
            <Separator className="w-full" />
          </div>
          <div className="flex items-center justify-end gap-6 pt-4">
            <Input
              value={definition.tags}
              onChange={(e) => setDefinition({ ...definition, tags: e.target.value })}
              placeholder={t("word.tags_placeholder")}
              className="border-0 text-xs focus-visible:ring-0 shadow-none rounded-b-lg rounded-t-none px-4 py-3 h-auto"
            />
            {/* <div className="flex items-center gap-2">
          <Switch
            checked={definition.isPublic}
            onCheckedChange={(checked: boolean) =>
              setDefinition({ ...definition, isPublic: checked })
            }
            id="public-mode"
          />
          <Label htmlFor="public-mode" className="text-sm cursor-pointer text-gray-500">
            {definition.isPublic ? (
              <Globe className="w-4 h-4" aria-label={t("word.public")} />
            ) : (
              <Lock className="w-4 h-4" aria-label={t("word.private")} />
            )}
          </Label>
        </div> */}
            <Button type="submit" disabled={isSubmitting} className="m-2 font-normal">
              {isSubmitting ? t("common.saving") : t("common.add")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
