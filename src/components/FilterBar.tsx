export type SortOption = "nameAsc" | "nameDesc" | "bookingsDesc" | "bookingsAsc";
export type PeriodOption = "next12" | "2025" | "2026" | "2027";
export type ViewMode = "venues" | "clients" | "external";

export interface Filters {
  period: PeriodOption;
  status: string;
  venue: string;
  portfolio: string;
  salesperson: string;
  sort: SortOption;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onRun: () => void;
  portfolios: string[];
  salespeople: string[];
  viewMode: ViewMode;
}

const SELECT_CLASS =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus-visible:outline-2 focus-visible:outline-blue-500 appearance-none cursor-pointer";

export default function FilterBar({
  filters,
  onChange,
  onRun,
  portfolios,
  salespeople,
  viewMode,
}: FilterBarProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const isClientMode = viewMode === "clients";
  const isExternal = viewMode === "external";

  return (
    <nav aria-label="Filters" className="flex flex-wrap items-end gap-4 px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex flex-col gap-1">
        <label htmlFor="filter-period" className="text-xs text-gray-600 font-medium">Period</label>
        <select
          id="filter-period"
          className={SELECT_CLASS}
          value={filters.period}
          onChange={(e) => set("period", e.target.value as PeriodOption)}>
          <option value="next12">Next 12 months</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="filter-status" className="text-xs text-gray-600 font-medium">Booking Status</label>
        <select
          id="filter-status"
          className={SELECT_CLASS}
          value={filters.status}
          onChange={(e) => set("status", e.target.value)}>
          <option value="all">All statuses</option>
          {!isExternal && <option value="Finalised">Finalised</option>}
          <option value="Confirmed">Confirmed</option>
          <option value="Provisional">Provisional</option>
          {!isExternal && <option value="Pencilled">Pencilled</option>}
        </select>
      </div>

      {!isExternal && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-venue" className="text-xs text-gray-600 font-medium">
            {isClientMode ? "Customer" : "Venue"}
          </label>
          <input
            id="filter-venue"
            type="text"
            placeholder={isClientMode ? "Search customers..." : "Search venues..."}
            value={filters.venue}
            onChange={(e) => set("venue", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-400 w-48 focus-visible:outline-2 focus-visible:outline-blue-500"
          />
        </div>
      )}

      {!isExternal && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-portfolio" className="text-xs text-gray-600 font-medium">Portfolio</label>
          <select
            id="filter-portfolio"
            className={SELECT_CLASS}
            value={filters.portfolio}
            onChange={(e) => set("portfolio", e.target.value)}>
            <option value="all">All venues ({portfolios.length} portfolios)</option>
            {portfolios.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isExternal && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-salesperson" className="text-xs text-gray-600 font-medium">Salesperson</label>
          <select
            id="filter-salesperson"
            className={SELECT_CLASS}
            value={filters.salesperson}
            onChange={(e) => set("salesperson", e.target.value)}>
            <option value="all">All</option>
            {salespeople.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isExternal && (
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-sort" className="text-xs text-gray-600 font-medium">Sort by</label>
          <select
            id="filter-sort"
            className={SELECT_CLASS}
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value as SortOption)}>
            <option value="nameAsc">Name (A-Z)</option>
            <option value="nameDesc">Name (Z-A)</option>
            <option value="bookingsDesc">Most bookings</option>
            <option value="bookingsAsc">Least bookings</option>
          </select>
        </div>
      )}

      <button
        onClick={onRun}
        className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2">
        Run
      </button>

      {isExternal && (
        <div className="ml-auto">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-blue-500">
            + Add Blackout
          </button>
        </div>
      )}
    </nav>
  );
}
