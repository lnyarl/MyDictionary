import { cn } from "@/lib/utils";
import type { SelectionRange } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { RichTextEditor } from "../ui/rich-text-editor";

type FeedCardContentProps = {
  content: string;
  className?: string;
  onMouseUp?: (e: React.MouseEvent, view: EditorView) => void;
  onSelectionChange?: (range: SelectionRange, view: EditorView) => void;
};

export function FeedCardContent({
  content,
  className,
  onMouseUp,
  onSelectionChange,
}: FeedCardContentProps) {
  return (
    <RichTextEditor
      value={content}
      disabled={true}
      onMouseUp={onMouseUp}
      onSelectionChange={onSelectionChange}
      className={cn(
        `prose prose-sm dark:prose-invert max-w-none focus:outline-none border-none min-h-20`,
        className,
      )}
      onChange={(_value: string) => {}}
    />
  );
}
