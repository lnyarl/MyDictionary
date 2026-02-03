import type { ReactNode } from "react";

type PageProps = {
	children: ReactNode;
	maxWidth?: "2xl" | "4xl" | "6xl";
}

export function Page({ children, maxWidth = "4xl" }: PageProps) {
	const maxWidthClass = {
		"2xl": "max-w-2xl",
		"4xl": "max-w-4xl",
		"6xl": "max-w-6xl",
	}[maxWidth];

	return (
		<div className="py-8">
			<div className={`${maxWidthClass} mx-auto`}>{children}</div>
		</div>
	);
}
