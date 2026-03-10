import { useState } from "react"
import type { Booking, Blackout, ExternalVenue } from "../types"
import type { MonthColumn } from "../utils/dates"
import { getWeekDays, isDateInRange, dateToStr, formatDate } from "../utils/dates"
import Tooltip from "./Tooltip"

interface ExternalVenueSectionProps {
  venue: ExternalVenue
  months: MonthColumn[]
}

const STATUS_COLORS: Record<string, string> = {
  Confirmed: "#22c55e",
  Finalised: "#22c55e",
  Provisional: "#3b82f6",
  Pencilled: "#93c5fd",
}

const BLACKOUT_COLOR = "#374151"

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

function ExternalBookingTooltip({ booking }: { booking: Booking }) {
  const color = STATUS_COLORS[booking.status] ?? "#94a3b8"
  return (
    <div className="min-w-[200px]">
      <div className="font-bold text-sm mb-2">{booking.id}</div>
      <table className="text-xs w-full">
        <tbody>
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 whitespace-nowrap align-top">Status:</td>
            <td className="py-0.5">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: color }}>
                {booking.status}
              </span>
            </td>
          </tr>
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 whitespace-nowrap align-top">From:</td>
            <td className="py-0.5 font-medium">{formatDate(booking.startDate)}</td>
          </tr>
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 whitespace-nowrap align-top">To:</td>
            <td className="py-0.5 font-medium">{formatDate(booking.endDate)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ExternalBlackoutTooltip({ blackout }: { blackout: Blackout }) {
  return (
    <div className="min-w-[200px]">
      <div className="font-bold text-sm mb-2">Blackout</div>
      <table className="text-xs w-full">
        <tbody>
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 whitespace-nowrap align-top">Reason:</td>
            <td className="py-0.5 font-medium">{blackout.reason}</td>
          </tr>
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 whitespace-nowrap align-top">From:</td>
            <td className="py-0.5 font-medium">{formatDate(blackout.startDate)}</td>
          </tr>
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 whitespace-nowrap align-top">To:</td>
            <td className="py-0.5 font-medium">{formatDate(blackout.endDate)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function ExternalVenueSection({
  venue,
  months,
}: ExternalVenueSectionProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const totalBookings = venue.spaces.reduce((sum, s) => sum + s.bookings.length, 0)

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
    <section className="mb-4" aria-label={venue.name}>
      <div className="px-4 py-2">
        <h2 className="text-sm font-bold text-gray-900 inline">
          {venue.name}
        </h2>
        <span className="text-xs text-gray-500 ml-3">
          {venue.spaces.length} spaces &middot; {totalBookings} bookings
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-hidden">
        <div className="inline-flex" style={{ minWidth: "100%" }}>
          {/* Space names column */}
          <div className="shrink-0 w-[140px] border-r border-gray-200 bg-white sticky left-0 z-20">
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
                    <ExternalSpaceGrid space={space} allWeeks={allWeeks} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 flex items-center gap-6">
        <LegendDot color={STATUS_COLORS.Provisional} label="Provisional" />
        <LegendDot color={STATUS_COLORS.Confirmed} label="Confirmed" />
        <LegendDot color={BLACKOUT_COLOR} label="Blackout" />
      </div>
    </section>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-xs text-gray-700">{label}</span>
    </div>
  )
}

function buildBookingLabel(booking: Booking, date: Date): string {
  const dayName = DAY_FULL_LABELS[((date.getDay() + 6) % 7)]
  const dateStr = formatDate(dateToStr(date))
  return `${booking.status}, ${dayName} ${dateStr}`
}

function buildBlackoutLabel(blackout: Blackout, date: Date): string {
  const dayName = DAY_FULL_LABELS[((date.getDay() + 6) % 7)]
  const dateStr = formatDate(dateToStr(date))
  return `Blackout: ${blackout.reason}, ${dayName} ${dateStr}`
}

function ExternalSpaceGrid({
  space,
  allWeeks,
}: {
  space: { bookings: Booking[]; blackouts: Blackout[] }
  allWeeks: { weekStart: Date; label: string }[]
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

            const cellBorder = "border-r border-b border-gray-200 box-border"

            if (blackout) {
              return (
                <Tooltip
                  key={wi}
                  label={buildBlackoutLabel(blackout, date)}
                  content={<ExternalBlackoutTooltip blackout={blackout} />}>
                  <div
                    className={cellBorder}
                    role="gridcell"
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      backgroundColor: BLACKOUT_COLOR,
                    }}
                  />
                </Tooltip>
              )
            }

            const booking = space.bookings.find((b) =>
              isDateInRange(date, b.startDate, b.endDate),
            )

            if (booking) {
              const color = STATUS_COLORS[booking.status] ?? "#94a3b8"
              return (
                <Tooltip
                  key={wi}
                  label={buildBookingLabel(booking, date)}
                  content={<ExternalBookingTooltip booking={booking} />}>
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
