import type { Booking, ClientBooking } from "../types";
import { formatDate } from "../utils/dates";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Finalised: { bg: "#22c55e", text: "#fff" },
  Confirmed: { bg: "#3b82f6", text: "#fff" },
  Provisional: { bg: "#f59e0b", text: "#fff" },
  Pencilled: { bg: "#94a3b8", text: "#fff" },
};

export function BookingTooltipContent({ booking }: { booking: Booking }) {
  const statusStyle = STATUS_COLORS[booking.status] ?? STATUS_COLORS.Pencilled;

  return (
    <div className="min-w-[260px]">
      <div className="font-bold text-sm mb-2">{booking.id}</div>
      <table className="text-xs w-full">
        <tbody>
          <Row label="Customer:" value={booking.customer} />
          <Row label="Dept:" value={booking.department} />
          <Row label="Category:" value={booking.categoryItem} />
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 align-top">Status:</td>
            <td className="py-0.5">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                }}
              >
                {booking.status}
              </span>
            </td>
          </tr>
          <Row label="Salesperson:" value={booking.salesperson} />
          <Row label="Contact:" value={booking.primaryContact} />
          <Row
            label="Gross:"
            value={`£${booking.grossPrice.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
          />
        </tbody>
      </table>
    </div>
  );
}

export function ClientBookingTooltipContent({ booking }: { booking: ClientBooking }) {
  const statusStyle = STATUS_COLORS[booking.status] ?? STATUS_COLORS.Pencilled;

  return (
    <div className="min-w-[260px]">
      <div className="font-bold text-sm mb-2">{booking.id}</div>
      <table className="text-xs w-full">
        <tbody>
          <Row label="Customer:" value={booking.customer} />
          <Row label="Dept:" value={booking.department} />
          <Row label="Category:" value={booking.categoryItem} />
          <tr>
            <td className="py-0.5 pr-3 text-gray-500 align-top">Status:</td>
            <td className="py-0.5">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.text,
                }}
              >
                {booking.status}
              </span>
            </td>
          </tr>
          <Row label="Salesperson:" value={booking.salesperson} />
          <Row label="Contact:" value={booking.primaryContact} />
          <Row
            label="Gross:"
            value={`£${booking.grossPrice.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
          />
          <Row label="Venue:" value={`${booking.venueName}, ${booking.venueLocation}`} />
          <Row label="Space:" value={booking.spaceName} />
        </tbody>
      </table>
    </div>
  );
}

export function BlackoutTooltipContent({
  blackout,
}: {
  blackout: { reason: string; startDate: string; endDate: string; addedBy: string };
}) {
  return (
    <div className="min-w-[220px]">
      <div className="font-bold text-sm mb-2">Blackout</div>
      <table className="text-xs w-full">
        <tbody>
          <Row label="Reason:" value={blackout.reason} />
          <Row label="From:" value={formatDate(blackout.startDate)} />
          <Row label="To:" value={formatDate(blackout.endDate)} />
          <Row label="Added by:" value={blackout.addedBy} />
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-0.5 pr-3 text-gray-500 whitespace-nowrap align-top">
        {label}
      </td>
      <td className="py-0.5 font-medium">{value}</td>
    </tr>
  );
}
