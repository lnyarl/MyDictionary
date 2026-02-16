import { cn } from "@/lib/utils";
import { RichTextEditor } from "../ui/rich-text-editor";
import type { EditorView } from "@codemirror/view";

type FeedCardContentProps = {
  content: string;
  className?: string;
  onMouseUp?: (e: React.MouseEvent, view: EditorView) => void;
};

export function FeedCardContent({ content, className, onMouseUp }: FeedCardContentProps) {
  return (
    <RichTextEditor
      value={content}
      disabled={true}
      onMouseUp={onMouseUp}
      className={cn(
        `prose prose-sm dark:prose-invert max-w-none focus:outline-none border-none min-h-20`,
        className,
      )}
      onChange={(_value: string) => {}}
    />
  );
}
