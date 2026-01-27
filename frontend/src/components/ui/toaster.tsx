import { AlertCircle, CheckCircle } from "lucide-react";

import { Toast, ToastClose, ToastProvider, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, variant, ...props }) => (
				<Toast key={id} variant={variant} className="bg-white my-1" {...props}>
					<div className="flex items-center gap-3">
						{variant === "destructive" ? (
							<AlertCircle className="h-5 w-5 shrink-0 text-destructive text-red-600" />
						) : (
							<CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
						)}
						<p className="text-sm">{description}</p>
					</div>
					{action}
					<ToastClose />
				</Toast>
			))}
			<ToastViewport />
		</ToastProvider>
	);
}
