import { useState } from "react"
import type { Client, ClientBooking } from "../types"
import type { MonthColumn } from "../utils/dates"
import { getWeekDays, isDateInRange, dateToStr, formatDate } from "../utils/dates"
import type { CategoryGroup } from "../types"
import Tooltip from "./Tooltip"
import { ClientBookingTooltipContent } from "./BookingTooltip"

interface ClientSectionProps {
  clients: Client[]
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

function buildBookingLabel(booking: ClientBooking, date: Date): string {
  const dayName = DAY_FULL_LABELS[((date.getDay() + 6) % 7)]
  const dateStr = formatDate(dateToStr(date))
  return `${booking.customer}, ${booking.categoryItem}, ${booking.venueName} - ${booking.spaceName}, ${dayName} ${dateStr}`
}

export default function ClientSection({
  clients,
  months,
  activeCategories,
  categoryGroups,
}: ClientSectionProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggleCollapse = (clientName: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(clientName)) next.delete(clientName)
      else next.add(clientName)
      return next
    })
  }

  const collapseAll = () => {
    if (collapsed.size === clients.length) {
      setCollapsed(new Set())
    } else {
      setCollapsed(new Set(clients.map((c) => c.name)))
    }
  }

  const allWeeks = months.flatMap((m) => m.weeks)
  const allCollapsed = collapsed.size === clients.length

  return (
    <section className="mb-4" aria-label="Client bookings">
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="inline-flex" style={{ minWidth: "100%" }}>
          {/* Client names column */}
          <div className="shrink-0 w-[140px] border-r border-gray-200 bg-white sticky left-0 z-20">
            <div
              className="border-b border-gray-100"
              style={{ height: MONTH_HEADER_H }}
            />
            <div
              className="flex items-center justify-between px-2 border-b border-gray-200"
              style={{ height: WEEK_HEADER_H }}>
              <span className="text-[10px] text-gray-600 uppercase tracking-wide">
                Customer
              </span>
              <button
                onClick={collapseAll}
                aria-label={allCollapsed ? "Expand all customers" : "Collapse all customers"}
                className="text-[10px] text-blue-600 hover:text-blue-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500 rounded">
                Collapse all
              </button>
            </div>

            {clients.map((client) => {
              const isCollapsed = collapsed.has(client.name)
              const height = isCollapsed ? COLLAPSED_H : getExpandedHeight()

              return (
                <div
                  key={client.name}
                  className="border-b border-gray-100 flex items-start px-2 pt-0.5"
                  style={{ height }}>
                  <span className="text-[11px] font-medium text-gray-700 leading-tight">
                    {client.name}
                  </span>
                  <button
                    onClick={() => toggleCollapse(client.name)}
                    aria-expanded={!isCollapsed}
                    aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${client.name}`}
                    className="text-[10px] text-gray-500 hover:text-gray-700 cursor-pointer shrink-0 ml-1 mt-0.5 p-0.5 rounded focus-visible:outline-2 focus-visible:outline-blue-500">
                    {isCollapsed ? "▸" : "▾"}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Day labels column */}
          <div className="shrink-0 bg-white sticky left-[140px] z-10" aria-hidden="true">
            <div
              className="border-b border-gray-100"
              style={{ height: MONTH_HEADER_H }}
            />
            <div
              className="border-b border-gray-200"
              style={{ height: WEEK_HEADER_H }}
            />

            {clients.map((client) => {
              const isCollapsed = collapsed.has(client.name)
              const height = isCollapsed ? COLLAPSED_H : getExpandedHeight()

              return (
                <div
                  key={client.name}
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
          <div className="flex-1 min-w-0" role="grid" aria-label="Client booking calendar">
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

            {/* Client grids */}
            {clients.map((client) => {
              const isCollapsed = collapsed.has(client.name)
              const height = isCollapsed ? COLLAPSED_H : getExpandedHeight()

              return (
                <div
                  key={client.name}
                  className="border-b border-gray-100"
                  style={{ height }}
                  role="rowgroup"
                  aria-label={client.name}>
                  {!isCollapsed && (
                    <ClientGrid
                      bookings={client.bookings}
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
      </div>
    </section>
  )
}

function ClientGrid({
  bookings,
  allWeeks,
  activeCategories,
  categoryGroups,
}: {
  bookings: ClientBooking[]
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

            const cellBorder =
              "border-r border-b border-gray-200 box-border"

            const booking = bookings.find(
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
                  content={<ClientBookingTooltipContent booking={booking} />}>
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
