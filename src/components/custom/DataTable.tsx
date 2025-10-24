import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	Column,
	Row
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search } from 'lucide-react';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchPlaceholder?: string;
	searchKey?: keyof TData;
	showSearch?: boolean;
	showColumnToggle?: boolean;
	showPagination?: boolean;
	pageSize?: number;
	className?: string;
	emptyMessage?: string;
	onAdd?: () => void;
	addLabel?: string;
	// Props untuk URL pagination
	useUrlPagination?: boolean;
	totalItems?: number;
	currentPage?: number;
	onPageChange?: (page: number) => void;
	// Props untuk controlled search
	searchValue?: string;
	onSearchChange?: (value: string) => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	searchPlaceholder = 'Search...',
	searchKey,
	showSearch = true,
	showColumnToggle = true,
	showPagination = true,
	pageSize = 10,
	className = '',
	emptyMessage = 'Tidak ada data.',
	onAdd,
	addLabel,
	useUrlPagination = false,
	totalItems,
	currentPage: externalCurrentPage,
	onPageChange,
	searchValue: controlledSearchValue,
	onSearchChange
}: DataTableProps<TData, TValue>) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

	// State untuk internal pagination (jika tidak pakai URL)
	const [internalPage, setInternalPage] = React.useState(0);

	// State untuk internal search (jika tidak controlled)
	const [internalSearchValue, setInternalSearchValue] = React.useState('');

	// Tentukan apakah search controlled atau tidak
	const isSearchControlled = controlledSearchValue !== undefined && onSearchChange !== undefined;
	const currentSearchValue = isSearchControlled ? controlledSearchValue : internalSearchValue;

	// Effect untuk set default URL params saat pertama kali mount
	React.useEffect(() => {
		if (useUrlPagination) {
			const pageParam = searchParams.get('page');
			const limitParam = searchParams.get('limit');

			// Jika tidak ada params di URL, set default
			if (!pageParam || !limitParam) {
				const defaultPage = externalCurrentPage || 1;
				updateUrlParams(defaultPage);
			}
		}
	}, []); // Run only once on mount

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		manualPagination: useUrlPagination, // Jika pakai URL, pagination manual
		manualFiltering: isSearchControlled, // Jika search controlled, filtering manual
		pageCount: useUrlPagination && totalItems ? Math.ceil(totalItems / pageSize) : undefined,
		initialState: {
			pagination: {
				pageSize: pageSize,
				pageIndex: useUrlPagination ? (externalCurrentPage ? externalCurrentPage - 1 : 0) : 0
			}
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			pagination: {
				pageSize: pageSize,
				pageIndex: useUrlPagination ? (externalCurrentPage ? externalCurrentPage - 1 : 0) : internalPage
			}
		}
	});

	// Function untuk update URL params
	const updateUrlParams = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set('page', page.toString());
		params.set('limit', pageSize.toString());
		router.push(`?${params.toString()}`, { scroll: false });
	};

	// Handler untuk search
	const handleSearchChange = (value: string) => {
		if (isSearchControlled) {
			// Controlled: call parent handler
			onSearchChange(value);
		} else {
			// Uncontrolled: update internal state dan table filter
			setInternalSearchValue(value);
			table.getColumn(searchKey as string)?.setFilterValue(value);
		}
	};

	// Handler untuk previous page
	const handlePreviousPage = () => {
		if (useUrlPagination) {
			const newPage = (externalCurrentPage || 1) - 1;
			if (newPage >= 1) {
				if (onPageChange) {
					onPageChange(newPage);
				} else {
					updateUrlParams(newPage);
				}
			}
		} else {
			table.previousPage();
			setInternalPage((prev) => prev - 1);
		}
	};

	// Handler untuk next page
	const handleNextPage = () => {
		if (useUrlPagination) {
			const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 1;
			const newPage = (externalCurrentPage || 1) + 1;
			if (newPage <= totalPages) {
				if (onPageChange) {
					onPageChange(newPage);
				} else {
					updateUrlParams(newPage);
				}
			}
		} else {
			table.nextPage();
			setInternalPage((prev) => prev + 1);
		}
	};

	// Hitung pagination info
	const getPaginationInfo = () => {
		if (useUrlPagination && totalItems !== undefined) {
			const currentPageNum = externalCurrentPage || 1;
			const start = (currentPageNum - 1) * pageSize + 1;
			const end = Math.min(currentPageNum * pageSize, totalItems);
			const totalPages = Math.ceil(totalItems / pageSize);

			return {
				start,
				end,
				total: totalItems,
				currentPage: currentPageNum,
				totalPages,
				canPrevious: currentPageNum > 1,
				canNext: currentPageNum < totalPages
			};
		} else {
			const rows = table.getFilteredRowModel().rows;
			const pageIndex = table.getState().pagination.pageIndex;
			const pageSize = table.getState().pagination.pageSize;
			const start = pageIndex * pageSize + 1;
			const end = Math.min((pageIndex + 1) * pageSize, rows.length);

			return {
				start,
				end,
				total: rows.length,
				currentPage: pageIndex + 1,
				totalPages: Math.ceil(rows.length / pageSize),
				canPrevious: table.getCanPreviousPage(),
				canNext: table.getCanNextPage()
			};
		}
	};

	const paginationInfo = getPaginationInfo();

	return (
		<div className={`w-full max-w-sm sm:max-w-none ${className}`}>
			{/* Toolbar */}
			{(showSearch || showColumnToggle || onAdd) && (
				<div className="flex items-center justify-between pb-4">
					<div className="flex items-center space-x-2">
						{/* Search Input */}
						{showSearch && searchKey && (
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder={searchPlaceholder}
									value={currentSearchValue}
									onChange={(event) => handleSearchChange(event.target.value)}
									className="pl-8 max-w-sm"
								/>
							</div>
						)}
					</div>

					<div className="flex items-center gap-2">
						{/* Tambah Button */}
						{onAdd && (
							<Button
								onClick={onAdd}
								className="bg-black text-white hover:bg-gray-800 cursor-pointer"
							>
								{addLabel ?? '+ Tambah'}
							</Button>
						)}

						{/* Column Toggle */}
						{showColumnToggle && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="ml-auto"
									>
										Columns <ChevronDown className="ml-2 h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{table
										.getAllColumns()
										.filter((column) => column.getCanHide())
										.map((column) => {
											return (
												<DropdownMenuCheckboxItem
													key={column.id}
													className="capitalize"
													checked={column.getIsVisible()}
													onCheckedChange={(value) => column.toggleVisibility(!!value)}
												>
													{column.id}
												</DropdownMenuCheckboxItem>
											);
										})}
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			)}

			{/* Table */}
			<div className="rounded-md border overflow-hidden bg-white">
				<Table>
					<TableHeader className="bg-black">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="border-gray-700 hover:bg-black"
							>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className="font-medium text-white border-gray-700"
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											className="whitespace-normal break-words"
											key={cell.id}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{showPagination && (
				<div className="flex items-center justify-end space-x-2 pt-4">
					<div className="flex-1 text-sm text-muted-foreground">
						{paginationInfo.total > 0 ? (
							<>
								Menampilkan {paginationInfo.start} hingga {paginationInfo.end} dari{' '}
								{paginationInfo.total} hasil
								{useUrlPagination && (
									<>
										{' '}
										(Halaman {paginationInfo.currentPage} dari {paginationInfo.totalPages})
									</>
								)}
							</>
						) : (
							'No data'
						)}
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handlePreviousPage}
							disabled={!paginationInfo.canPrevious}
							className="cursor-pointer"
						>
							Sebelumnya
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleNextPage}
							disabled={!paginationInfo.canNext}
							className="cursor-pointer"
						>
							Selanjutnya
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

// Helper function to create a sortable column header
export function createSortableHeader<TData>(title: string) {
	const SortableHeader = ({ column }: { column: Column<TData, unknown> }) => {
		return (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				className="h-auto p-0 -ml-3 font-medium hover:text-white hover:bg-transparent cursor-pointer"
			>
				{title}
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		);
	};

	SortableHeader.displayName = `SortableHeader_${title}`;
	return SortableHeader;
}

// Helper function to create an action column
export function createActionColumn<TData>(actions: (row: TData) => React.ReactNode) {
	return {
		id: 'actions',
		enableHiding: false,
		cell: ({ row }: { row: Row<TData> }) => {
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="h-8 w-8 p-0"
						>
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">{actions(row.original)}</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	};
}

export function createInlineActionColumn<TData>(actions: (row: TData) => React.ReactNode) {
	return {
		id: 'actions',
		enableHiding: false,
		cell: ({ row }: { row: Row<TData> }) => {
			return <div className="flex items-center">{actions(row.original)}</div>;
		}
	};
}
