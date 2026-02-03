import {
	type BadgeEntity,
	type CreateBadgeDto,
	EventType,
	type UpdateBadgeDto,
} from "@stashy/shared";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/ui/table";
import { useBadges } from "../hooks/useBadges";
import { badgesApi } from "../lib/badges";

export default function BadgesPage() {
	const [page, setPage] = useState(1);
	const [refreshKey, setRefreshKey] = useState(0);
	const { badges, isLoading, error, meta } = useBadges(page, 20, refreshKey);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedBadge, setSelectedBadge] = useState<BadgeEntity | null>(null);

	const [formData, setFormData] = useState<CreateBadgeDto>({
		code: "",
		name: "",
		description: "",
		icon: "",
		category: "achievement",
		event_type: "word_create",
		threshold: 1,
		is_active: true,
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const handleCreate = () => {
		setIsEditMode(false);
		setSelectedBadge(null);
		setFormData({
			code: "",
			name: "",
			description: "",
			icon: "",
			category: "achievement",
			event_type: "word_create",
			threshold: 1,
			is_active: true,
		});
		setIsDialogOpen(true);
	};

	const handleEdit = (badge: BadgeEntity) => {
		setIsEditMode(true);
		setSelectedBadge(badge);
		setFormData({
			code: badge.code,
			name: badge.name,
			description: badge.description || "",
			icon: badge.icon || "",
			category: badge.category,
			event_type: badge.event_type,
			threshold: badge.threshold,
			is_active: badge.is_active,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this badge?")) {
			try {
				await badgesApi.delete(id);
				setRefreshKey((prev) => prev + 1);
			} catch (err) {
				alert(err instanceof Error ? err.message : "Failed to delete badge");
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		try {
			setIsSubmitting(true);
			if (isEditMode && selectedBadge) {
				await badgesApi.update(selectedBadge.id, formData as UpdateBadgeDto);
			} else {
				await badgesApi.create(formData);
			}
			setIsDialogOpen(false);
			setRefreshKey((prev) => prev + 1);
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Failed to save badge");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => ({ ...prev, [name]: checked }));
		} else if (type === "number") {
			setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-lg">Loading badges...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-red-600 bg-red-50 p-4 rounded">Error: {error}</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-8">
			<div className="mb-6 flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold">Badges Management</h1>
					<p className="text-gray-600 mt-2">Create and manage badges</p>
				</div>
				<Button onClick={handleCreate}>Create Badge</Button>
			</div>

			<div className="bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Code</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Event Type</TableHead>
							<TableHead>Threshold</TableHead>
							<TableHead>Active</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{badges.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-8 text-gray-500"
								>
									No badges found
								</TableCell>
							</TableRow>
						) : (
							badges.map((badge) => (
								<TableRow key={badge.id}>
									<TableCell className="font-mono text-sm">
										{badge.code}
									</TableCell>
									<TableCell className="font-medium">
										<div className="flex items-center gap-2">
											{badge.icon && <span>{badge.icon}</span>}
											{badge.name}
										</div>
									</TableCell>
									<TableCell>{badge.category}</TableCell>
									<TableCell>{badge.event_type}</TableCell>
									<TableCell>{badge.threshold}</TableCell>
									<TableCell>
										<span
											className={`px-2 py-1 rounded text-xs ${
												badge.is_active
													? "bg-green-100 text-green-800"
													: "bg-gray-100 text-gray-800"
											}`}
										>
											{badge.is_active ? "Active" : "Inactive"}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleEdit(badge)}
											>
												Edit
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDelete(badge.id)}
											>
												Delete
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>

				<div className="flex justify-between items-center p-4 border-t">
					<div className="text-sm text-gray-600">
						Page {meta.page} of {meta.totalPages} ({meta.total} total badges)
					</div>
					<div className="space-x-2">
						<Button
							onClick={() => setPage(page - 1)}
							disabled={page === 1}
							variant="outline"
							size="sm"
						>
							Previous
						</Button>
						<Button
							onClick={() => setPage(page + 1)}
							disabled={page >= meta.totalPages}
							variant="outline"
							size="sm"
						>
							Next
						</Button>
					</div>
				</div>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{isEditMode ? "Edit Badge" : "Create New Badge"}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-2 gap-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="code">Code</Label>
								<Input
									id="code"
									name="code"
									value={formData.code}
									onChange={handleChange}
									placeholder="e.g., word_master_1"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="e.g., Word Master I"
									required
								/>
							</div>
							<div className="col-span-2 space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Badge description"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="icon">Icon (Emoji/URL)</Label>
								<Input
									id="icon"
									name="icon"
									value={formData.icon}
									onChange={handleChange}
									placeholder="e.g., 🏆"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Input
									id="category"
									name="category"
									value={formData.category}
									onChange={handleChange}
									placeholder="e.g., achievement"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="event_type">Event Type</Label>
								<Select
									value={formData.event_type}
									onValueChange={(value) =>
										setFormData((prev) => ({ ...prev, event_type: value }))
									}
								>
									<SelectTrigger id="event_type">
										<SelectValue placeholder="Select event type" />
									</SelectTrigger>
									<SelectContent>
										{Object.values(EventType).map((type) => (
											<SelectItem key={type} value={type}>
												{type}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="threshold">Threshold</Label>
								<Input
									id="threshold"
									name="threshold"
									type="number"
									min="1"
									value={formData.threshold}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="col-span-2 flex items-center space-x-2">
								<input
									type="checkbox"
									id="is_active"
									name="is_active"
									checked={formData.is_active}
									onChange={handleChange}
									className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								/>
								<Label htmlFor="is_active">Is Active</Label>
							</div>

							{formError && (
								<div className="col-span-2 text-sm text-red-600 bg-red-50 p-2 rounded">
									{formError}
								</div>
							)}
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
