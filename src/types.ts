export interface CategoryGroup {
  name: string;
  items: CategoryItem[];
}

export interface CategoryItem {
  name: string;
  color: string;
  textColor?: string;
}

export interface Booking {
  id: string;
  customer: string;
  department: string;
  classification: string;
  status: "Finalised" | "Provisional" | "Confirmed" | "Pencilled";
  salesperson: string;
  primaryContact: string;
  grossPrice: number;
  startDate: string;
  endDate: string;
  categoryGroup: string;
  categoryItem: string;
}

export interface Blackout {
  reason: string;
  startDate: string;
  endDate: string;
  addedBy: string;
}

export interface Space {
  id: string;
  name: string;
  bookings: Booking[];
  blackouts: Blackout[];
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  portfolio: string;
  spaces: Space[];
}

export interface ExternalVenue {
  id: string;
  name: string;
  spaces: Space[];
}

export interface ClientBooking extends Booking {
  venueName: string;
  venueLocation: string;
  spaceName: string;
}

export interface Client {
  name: string;
  bookings: ClientBooking[];
}
