import { cn } from "@/lib/utils";
import { RichTextEditor } from "../ui/rich-text-editor";

type FeedCardContentProps = {
  content: string;
  className?: string;
}

export function FeedCardContent({ content, className }: FeedCardContentProps) {
  return <RichTextEditor
    value={content}
    disabled={true}
    className={cn(`prose prose-sm dark:prose-invert max-w-none focus:outline-none border-none min-h-20`, className)}
    onChange={(_value: string) => { }}
  />;
}
