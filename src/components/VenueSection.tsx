import { useState } from "react"
import type { Venue, Booking, Blackout } from "../types"
import type { MonthColumn } from "../utils/dates"
import { getWeekDays, isDateInRange, dateToStr, formatDate } from "../utils/dates"
import type { CategoryGroup } from "../types"
import Tooltip from "./Tooltip"
import { BookingTooltipContent, BlackoutTooltipContent } from "./BookingTooltip"

interface VenueSectionProps {
  venue: Venue
  months: MonthColumn[]
  activeCategories: Set<string>
  categoryGroups: CategoryGroup[]
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const DAY_FULL_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const CELL_W = 21
const CELL_H = 15
const COLLAPSED_H = 24
const MONTH_HEADER_H = 22
const WEEK_HEADER_H = 18

function getExpandedHeight() {
  return 7 * CELL_H
}

function getCategoryColor(
  categoryItem: string,
  categoryGroups: CategoryGroup[],
): string {
  for (const group of categoryGroups) {
    for (const item of group.items) {
      if (item.name === categoryItem) return item.color
    }
  }
  return "#94a3b8"
}

export default function VenueSection({
  venue,
  months,
  activeCategories,
  categoryGroups,
}: VenueSectionProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [venueCollapsed, setVenueCollapsed] = useState(false)

  const totalBookings = venue.spaces.reduce(
    (sum, s) => sum + s.bookings.length,
    0,
  )

  const toggleCollapse = (spaceId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(spaceId)) next.delete(spaceId)
      else next.add(spaceId)
      return next
    })
  }

  const collapseAll = () => {
    if (collapsed.size === venue.spaces.length) {
      setCollapsed(new Set())
    } else {
      setCollapsed(new Set(venue.spaces.map((s) => s.id)))
    }
  }

  const allWeeks = months.flatMap((m) => m.weeks)
  const allSpacesCollapsed = collapsed.size === venue.spaces.length

  return (
    <section className="mb-4" aria-label={`${venue.name}, ${venue.location}`}>
      <button
        onClick={() => setVenueCollapsed((v) => !v)}
        aria-expanded={!venueCollapsed}
        className="flex items-center justify-between w-full px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors rounded focus-visible:outline-2 focus-visible:outline-blue-500 text-left">
        <h2 className="text-sm font-bold text-gray-900">
          {venue.name}, {venue.location}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-600">{venue.spaces.length} spaces</span>
          <span className="text-xs text-gray-600">{totalBookings} bookings</span>
          <span className="text-gray-500 text-xs" aria-hidden="true">
            {venueCollapsed ? "▸" : "▾"}
          </span>
        </div>
      </button>

      {!venueCollapsed && <div className="overflow-x-auto overflow-y-hidden">
        <div className="inline-flex" style={{ minWidth: "100%" }}>
          {/* Space names column */}
          <div className="flex-shrink-0 w-[140px] border-r border-gray-200 bg-white sticky left-0 z-20">
            <div
              className="border-b border-gray-100"
              style={{ height: MONTH_HEADER_H }}
            />
            <div
              className="flex items-center justify-between px-2 border-b border-gray-200"
              style={{ height: WEEK_HEADER_H }}>
              <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                Space
              </span>
              <button
                onClick={collapseAll}
                aria-label={allSpacesCollapsed ? "Expand all spaces" : "Collapse all spaces"}
                className="text-[10px] text-blue-600 hover:text-blue-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500 rounded">
                Collapse all
              </button>
            </div>

            {venue.spaces.map((space) => {
              const isCollapsed = collapsed.has(space.id)
              const height = isCollapsed ? COLLAPSED_H : getExpandedHeight()

              return (
                <div
                  key={space.id}
                  className="border-b border-gray-100 flex items-start px-2 pt-0.5"
                  style={{ height }}>
                  <span className="text-[11px] font-medium text-gray-700 leading-tight">
                    {space.name}
                  </span>
                  <button
                    onClick={() => toggleCollapse(space.id)}
                    aria-expanded={!isCollapsed}
                    aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${space.name}`}
                    className="text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer flex-shrink-0 ml-1 mt-0.5 p-0.5 rounded focus-visible:outline-2 focus-visible:outline-blue-500">
                    {isCollapsed ? "▸" : "▾"}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Day labels column */}
          <div className="flex-shrink-0 bg-white sticky left-[140px] z-10" aria-hidden="true">
            <div
              className="border-b border-gray-100"
              style={{ height: MONTH_HEADER_H }}
            />
            <div
              className="border-b border-gray-200"
              style={{ height: WEEK_HEADER_H }}
            />

            {venue.spaces.map((space) => {
              const isCollapsed = collapsed.has(space.id)
              const height = isCollapsed ? COLLAPSED_H : getExpandedHeight()

              return (
                <div
                  key={space.id}
                  className="border-b border-gray-100 flex flex-col justify-start px-1.5"
                  style={{ height }}>
                  {!isCollapsed &&
                    DAY_LABELS.map((label, i) => (
                      <div
                        key={i}
                        className="text-[10px] text-gray-600 flex items-center justify-center"
                        style={{ height: CELL_H }}>
                        {label}
                      </div>
                    ))}
                </div>
              )
            })}
          </div>

          {/* Timeline grid */}
          <div className="flex-1 min-w-0" role="grid" aria-label="Booking calendar">
            {/* Month headers */}
            <div
              className="flex border-b border-gray-100"
              style={{ height: MONTH_HEADER_H }}
              role="row">
              {months.map((month) => (
                <div
                  key={`${month.year}-${month.month}`}
                  role="columnheader"
                  className="text-[11px] font-semibold text-gray-700 border-r border-gray-100 flex items-center pl-2"
                  style={{ width: month.weeks.length * CELL_W }}>
                  {month.name}
                </div>
              ))}
            </div>

            {/* Week date headers */}
            <div
              className="flex border-b border-gray-200"
              style={{ height: WEEK_HEADER_H }}
              role="row">
              {allWeeks.map((week, wi) => (
                <div
                  key={wi}
                  role="columnheader"
                  className="text-[9px] text-gray-500 flex items-center justify-center"
                  style={{ width: CELL_W }}>
                  {week.label}
                </div>
              ))}
            </div>

            {/* Space grids */}
            {venue.spaces.map((space) => {
              const isCollapsed = collapsed.has(space.id)
              const height = isCollapsed ? COLLAPSED_H : getExpandedHeight()

              return (
                <div
                  key={space.id}
                  className="border-b border-gray-100"
                  style={{ height }}
                  role="rowgroup"
                  aria-label={space.name}>
                  {!isCollapsed && (
                    <SpaceGrid
                      space={space}
                      allWeeks={allWeeks}
                      activeCategories={activeCategories}
                      categoryGroups={categoryGroups}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>}
    </section>
  )
}

function buildBookingLabel(booking: Booking, date: Date): string {
  const dayName = DAY_FULL_LABELS[((date.getDay() + 6) % 7)]
  const dateStr = formatDate(dateToStr(date))
  return `${booking.customer}, ${booking.categoryItem}, ${dayName} ${dateStr}`
}

function buildBlackoutLabel(blackout: Blackout, date: Date): string {
  const dayName = DAY_FULL_LABELS[((date.getDay() + 6) % 7)]
  const dateStr = formatDate(dateToStr(date))
  return `Blackout: ${blackout.reason}, ${dayName} ${dateStr}`
}

function SpaceGrid({
  space,
  allWeeks,
  activeCategories,
  categoryGroups,
}: {
  space: { bookings: Booking[]; blackouts: Blackout[] }
  allWeeks: { weekStart: Date; label: string }[]
  activeCategories: Set<string>
  categoryGroups: CategoryGroup[]
}) {
  return (
    <div className="border-l border-t border-gray-200">
      {DAY_LABELS.map((_label, dayIndex) => (
        <div key={dayIndex} className="flex" style={{ height: CELL_H }} role="row">
          {allWeeks.map((week, wi) => {
            const days = getWeekDays(week.weekStart)
            const date = days[dayIndex]

            const blackout = space.blackouts.find((bl) =>
              isDateInRange(date, bl.startDate, bl.endDate),
            )

            const cellBorder =
              "border-r border-b border-gray-200 box-border"

            if (blackout) {
              return (
                <Tooltip
                  key={wi}
                  label={buildBlackoutLabel(blackout, date)}
                  content={<BlackoutTooltipContent blackout={blackout} />}>
                  <div
                    className={cellBorder}
                    role="gridcell"
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      backgroundColor: "#374151",
                    }}
                  />
                </Tooltip>
              )
            }

            const booking = space.bookings.find(
              (b) =>
                activeCategories.has(b.categoryItem) &&
                isDateInRange(date, b.startDate, b.endDate),
            )

            if (booking) {
              const color = getCategoryColor(
                booking.categoryItem,
                categoryGroups,
              )
              return (
                <Tooltip
                  key={wi}
                  label={buildBookingLabel(booking, date)}
                  content={<BookingTooltipContent booking={booking} />}>
                  <div
                    className={cellBorder}
                    role="gridcell"
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      backgroundColor: color,
                    }}
                  />
                </Tooltip>
              )
            }

            return (
              <div
                key={wi}
                className={cellBorder}
                role="gridcell"
                style={{ width: CELL_W, height: CELL_H }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
