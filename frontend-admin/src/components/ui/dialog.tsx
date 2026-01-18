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

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, children, ...props }, ref) => (
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
	),
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
		{...props}
	/>
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({ className, ...props }, ref) => (
		<h2
			ref={ref}
			className={cn("text-lg font-semibold leading-none tracking-tight", className)}
			{...props}
		/>
	),
);
DialogTitle.displayName = "DialogTitle";

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle };
