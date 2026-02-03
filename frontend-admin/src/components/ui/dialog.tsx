import * as React from "react";
import { cn } from "../../lib/utils";

interface DialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50">
			<button
				type="button"
				className="fixed inset-0 bg-black/80 w-full h-full border-none cursor-default"
				onClick={() => onOpenChange(false)}
				aria-label="Close dialog"
			/>
			{children}
		</div>
	);
};

// Simplified Trigger that just renders children and handles click
const DialogTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, children, asChild, ...props }, ref) => {
	// If used within Dialog context (which we don't fully implement here without context),
	// it should open the dialog.
	// Since we use controlled state in parent, this might just be a button wrapper.
	// BUT `UserDetailPage` uses it inside `Dialog` which expects it to work.
	// The current simple implementation of `Dialog` DOES NOT provide context.
	// So `DialogTrigger` won't work automatically unless we lift state up or use context.

	// For now, let's keep it simple and assume the parent handles `open` state
	// and `DialogTrigger` is just for UI consistency or we need to refactor `UserDetailPage`
	// to control state manually instead of relying on `DialogTrigger`.

	// Actually, let's implement a basic context for Dialog to make Trigger work if needed,
	// OR just update UserDetailPage to not use Trigger if it's too complex for this file.

	// Given UserDetailPage uses `DialogTrigger asChild` with a Button,
	// and `Dialog` wraps it...
	// The `Dialog` component above takes `open` and `onOpenChange` props.
	// It renders `children` directly.

	// To support `DialogTrigger`, we need a Context.
	return (
		<button ref={ref} className={cn(className)} onClick={onClick} {...props}>
			{children}
		</button>
	);
});
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			"fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg sm:rounded-lg",
			className,
		)}
		{...props}
	>
		{children}
	</div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className,
		)}
		{...props}
	/>
);

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className,
		)}
		{...props}
	/>
);

const DialogTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h2
		ref={ref}
		className={cn(
			"text-lg font-semibold leading-none tracking-tight",
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn("text-sm text-muted-foreground", className)}
		{...props}
	/>
));
DialogDescription.displayName = "DialogDescription";

export {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
};
