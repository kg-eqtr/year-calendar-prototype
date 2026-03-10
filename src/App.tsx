import { useState } from "react";
import FilterBar from "./components/FilterBar";
import type { Filters, SortOption, PeriodOption, ViewMode } from "./components/FilterBar";
import CategoryBar from "./components/CategoryBar";
import VenueSection from "./components/VenueSection";
import ClientSection from "./components/ClientSection";
import ExternalVenueSection from "./components/ExternalVenueSection";
import { categoryGroups, venues, externalVenue } from "./data";
import { getMonthsInRange } from "./utils/dates";
import type { Venue, Client, ClientBooking, ExternalVenue } from "./types";

function getAllCategoryNames(): Set<string> {
  const names = new Set<string>();
  for (const group of categoryGroups) {
    for (const item of group.items) {
      names.add(item.name);
    }
  }
  return names;
}

const portfolios = [...new Set(venues.map((v) => v.portfolio))].sort();

const salespeople = [
  ...new Set(
    venues.flatMap((v) =>
      v.spaces.flatMap((s) => s.bookings.map((b) => b.salesperson))
    )
  ),
].sort();

const VALID_SORTS: SortOption[] = ["nameAsc", "nameDesc", "bookingsDesc", "bookingsAsc"];
const VALID_PERIODS: PeriodOption[] = ["next12", "2025", "2026", "2027"];

function filtersFromUrl(): Filters {
  const p = new URLSearchParams(window.location.search);
  const sort = p.get("sort");
  const period = p.get("period");
  return {
    period: period && VALID_PERIODS.includes(period as PeriodOption) ? (period as PeriodOption) : "next12",
    status: p.get("status") ?? "all",
    venue: p.get("venue") ?? "",
    portfolio: p.get("portfolio") ?? "all",
    salesperson: p.get("salesperson") ?? "all",
    sort: sort && VALID_SORTS.includes(sort as SortOption) ? (sort as SortOption) : "nameAsc",
  };
}

function filtersToUrl(f: Filters) {
  const url = new URL(window.location.href);
  const defaults: Record<string, string> = {
    period: "next12",
    status: "all",
    venue: "",
    portfolio: "all",
    salesperson: "all",
    sort: "nameAsc",
  };
  for (const [key, defaultVal] of Object.entries(defaults)) {
    const val = f[key as keyof Filters];
    if (val === defaultVal) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, val);
    }
  }
  window.history.replaceState({}, "", url.toString());
}

function getMonthsForPeriod(period: PeriodOption) {
  if (period === "next12") {
    const now = new Date();
    return getMonthsInRange(new Date(now.getFullYear(), now.getMonth(), 1), 12);
  }
  const year = parseInt(period);
  return getMonthsInRange(new Date(year, 0, 1), 12);
}

function sortVenues(list: Venue[], sort: SortOption): Venue[] {
  const sorted = [...list];
  switch (sort) {
    case "nameAsc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "nameDesc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "bookingsDesc":
      return sorted.sort(
        (a, b) =>
          b.spaces.reduce((s, sp) => s + sp.bookings.length, 0) -
          a.spaces.reduce((s, sp) => s + sp.bookings.length, 0)
      );
    case "bookingsAsc":
      return sorted.sort(
        (a, b) =>
          a.spaces.reduce((s, sp) => s + sp.bookings.length, 0) -
          b.spaces.reduce((s, sp) => s + sp.bookings.length, 0)
      );
  }
}

function sortClients(list: Client[], sort: SortOption): Client[] {
  const sorted = [...list];
  switch (sort) {
    case "nameAsc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "nameDesc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "bookingsDesc":
      return sorted.sort((a, b) => b.bookings.length - a.bookings.length);
    case "bookingsAsc":
      return sorted.sort((a, b) => a.bookings.length - b.bookings.length);
  }
}

function buildClientList(venueList: Venue[]): Client[] {
  const map = new Map<string, ClientBooking[]>();
  for (const venue of venueList) {
    for (const space of venue.spaces) {
      for (const booking of space.bookings) {
        const list = map.get(booking.customer) ?? [];
        list.push({
          ...booking,
          venueName: venue.name,
          venueLocation: venue.location,
          spaceName: space.name,
        });
        map.set(booking.customer, list);
      }
    }
  }
  return Array.from(map.entries()).map(([name, bookings]) => ({ name, bookings }));
}

function applyVenueFilters(filters: Filters) {
  let result = [...venues];

  if (filters.venue.trim()) {
    const q = filters.venue.trim().toLowerCase();
    result = result.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
    );
  }

  if (filters.portfolio !== "all") {
    result = result.filter((v) => v.portfolio === filters.portfolio);
  }

  if (filters.salesperson !== "all") {
    result = result
      .map((v) => ({
        ...v,
        spaces: v.spaces.map((s) => ({
          ...s,
          bookings: s.bookings.filter(
            (b) => b.salesperson === filters.salesperson
          ),
        })),
      }))
      .filter((v) => v.spaces.some((s) => s.bookings.length > 0));
  }

  if (filters.status !== "all") {
    result = result
      .map((v) => ({
        ...v,
        spaces: v.spaces.map((s) => ({
          ...s,
          bookings: s.bookings.filter((b) => b.status === filters.status),
        })),
      }))
      .filter((v) => v.spaces.some((s) => s.bookings.length > 0));
  }

  return sortVenues(result, filters.sort);
}

function applyClientFilters(filters: Filters): Client[] {
  let venueResult = [...venues];

  if (filters.portfolio !== "all") {
    venueResult = venueResult.filter((v) => v.portfolio === filters.portfolio);
  }

  if (filters.salesperson !== "all") {
    venueResult = venueResult
      .map((v) => ({
        ...v,
        spaces: v.spaces.map((s) => ({
          ...s,
          bookings: s.bookings.filter(
            (b) => b.salesperson === filters.salesperson
          ),
        })),
      }))
      .filter((v) => v.spaces.some((s) => s.bookings.length > 0));
  }

  if (filters.status !== "all") {
    venueResult = venueResult
      .map((v) => ({
        ...v,
        spaces: v.spaces.map((s) => ({
          ...s,
          bookings: s.bookings.filter((b) => b.status === filters.status),
        })),
      }))
      .filter((v) => v.spaces.some((s) => s.bookings.length > 0));
  }

  let clients = buildClientList(venueResult);

  if (filters.venue.trim()) {
    const q = filters.venue.trim().toLowerCase();
    clients = clients.filter((c) => c.name.toLowerCase().includes(q));
  }

  return sortClients(clients, filters.sort);
}

function applyExternalFilters(filters: Filters): ExternalVenue {
  if (filters.status === "all") return externalVenue;
  return {
    ...externalVenue,
    spaces: externalVenue.spaces.map((s) => ({
      ...s,
      bookings: s.bookings.filter((b) => b.status === filters.status),
    })),
  };
}

export default function App() {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    () => getAllCategoryNames()
  );

  const [viewMode, setViewMode] = useState<ViewMode>("venues");
  const initial = filtersFromUrl();
  const [pendingFilters, setPendingFilters] = useState<Filters>(initial);
  const [filteredVenues, setFilteredVenues] = useState(() => applyVenueFilters(initial));
  const [filteredClients, setFilteredClients] = useState<Client[]>(() => applyClientFilters(initial));
  const [filteredExtVenue, setFilteredExtVenue] = useState<ExternalVenue>(() => applyExternalFilters(initial));
  const [months, setMonths] = useState(() => getMonthsForPeriod(initial.period));

  const handleRun = () => {
    setFilteredVenues(applyVenueFilters(pendingFilters));
    setFilteredClients(applyClientFilters(pendingFilters));
    setFilteredExtVenue(applyExternalFilters(pendingFilters));
    setMonths(getMonthsForPeriod(pendingFilters.period));
    filtersToUrl(pendingFilters);
  };

  const handleViewSwitch = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const toggleCategory = (name: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleGroup = (groupName: string) => {
    setActiveCategories((prev) => {
      const group = categoryGroups.find((g) => g.name === groupName);
      if (!group) return prev;
      const allActive = group.items.every((item) => prev.has(item.name));
      const next = new Set(prev);
      if (allActive) {
        group.items.forEach((item) => next.delete(item.name));
      } else {
        group.items.forEach((item) => next.add(item.name));
      }
      return next;
    });
  };

  const clearAll = () => {
    setActiveCategories(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#calendar-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
        Skip to calendar
      </a>
      <header className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewSwitch("venues")}
            className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400 ${
              viewMode === "venues"
                ? "bg-white text-slate-800"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            aria-pressed={viewMode === "venues"}>
            Venues
          </button>
          <button
            onClick={() => handleViewSwitch("clients")}
            className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400 ${
              viewMode === "clients"
                ? "bg-white text-slate-800"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            aria-pressed={viewMode === "clients"}>
            Clients
          </button>
          <button
            onClick={() => handleViewSwitch("external")}
            className={`px-4 py-1.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-400 ${
              viewMode === "external"
                ? "bg-white text-slate-800"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            aria-pressed={viewMode === "external"}>
            External
          </button>
        </div>
        <span className="text-xs text-slate-400">
          Calendar &ndash; {viewMode === "external" ? "External (Venue)" : `Internal \u2013 ${viewMode === "venues" ? "Venues" : "Clients"}`}
        </span>
      </header>
      <FilterBar
        filters={pendingFilters}
        onChange={setPendingFilters}
        onRun={handleRun}
        portfolios={portfolios}
        salespeople={salespeople}
        viewMode={viewMode}
      />
      {viewMode !== "external" && (
        <CategoryBar
          groups={categoryGroups}
          activeCategories={activeCategories}
          onToggleCategory={toggleCategory}
          onToggleGroup={toggleGroup}
          onClearAll={clearAll}
        />
      )}
      <main id="calendar-content" className="py-2" aria-label={
        viewMode === "venues" ? "Venue calendars" : viewMode === "clients" ? "Client calendars" : "External venue calendar"
      }>
        {viewMode === "venues" && (
          <>
            <div aria-live="polite" className="sr-only">
              {filteredVenues.length === 0
                ? "No venues match the current filters."
                : `Showing ${filteredVenues.length} venue${filteredVenues.length === 1 ? "" : "s"}.`}
            </div>
            {filteredVenues.length === 0 ? (
              <div className="text-center text-gray-500 py-12 text-sm" role="status">
                No venues match the current filters.
              </div>
            ) : (
              filteredVenues.map((venue) => (
                <VenueSection
                  key={venue.id}
                  venue={venue}
                  months={months}
                  activeCategories={activeCategories}
                  categoryGroups={categoryGroups}
                />
              ))
            )}
          </>
        )}
        {viewMode === "clients" && (
          <>
            <div aria-live="polite" className="sr-only">
              {filteredClients.length === 0
                ? "No clients match the current filters."
                : `Showing ${filteredClients.length} client${filteredClients.length === 1 ? "" : "s"}.`}
            </div>
            {filteredClients.length === 0 ? (
              <div className="text-center text-gray-500 py-12 text-sm" role="status">
                No clients match the current filters.
              </div>
            ) : (
              <ClientSection
                clients={filteredClients}
                months={months}
                activeCategories={activeCategories}
                categoryGroups={categoryGroups}
              />
            )}
          </>
        )}
        {viewMode === "external" && (
          <ExternalVenueSection
            venue={filteredExtVenue}
            months={months}
          />
        )}
      </main>
    </div>
  );
}
