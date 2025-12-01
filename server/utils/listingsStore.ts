// server/utils/listingsStore.ts
export type Listing = {
  id: number | string;
  userId?: string;
  middlemanId?: string;
  middleman?: {
    id: string;
    name: string;
    email: string;
    link?: string;
  };
  nickname: string;
  server: string;
  growthPower: string;
  classesList: string[];
  askingPrice: string;
  contactLink: string;
  contactNumber: string;
  images: string[];
  status?: 'pending' | 'approved' | 'rejected' | 'sold';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
};

const listings: Listing[] = [];
let nextId = 1;

export function addListing(input: Omit<Listing, "id" | "createdAt">): Listing {
  const listing: Listing = {
    id: nextId++,
    createdAt: new Date().toISOString(),
    ...input,
  };

  listings.unshift(listing);
  return listing;
}

export function getListings(): Listing[] {
  return listings;
}

export function getListingById(id: number): Listing | undefined {
  return listings.find((listing) => listing.id === id);
}