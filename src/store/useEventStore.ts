import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type GuestStatus = "attending" | "pending" | "declined";

export interface Guest {
  id: string;
  name: string;
  status: GuestStatus;
  tableId: string | null;
  seatIndex: number | null;
  dietary: string;
  vip?: boolean;
  checkedIn?: boolean;
  checkInTime?: string;
  notes?: string;
  plusOneCount?: number;
}

export interface ChecklistTask {
  id: string;
  category: "Venue & Catering" | "Florals & Decor" | "Audio & Lighting" | "Guest Experience" | "Logistics";
  title: string;
  completed: boolean;
  progressPercentage: number;
}

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated: number;
  actual: number;
}

export interface BudgetData {
  totalBudget: number;
  expenses: BudgetItem[];
}

export type FloorItemType = "round-table" | "rect-table" | "stage" | "dance-floor" | "bar";

export interface FloorItem {
  id: string;
  type: FloorItemType;
  x: number;
  y: number;
  rotation: number;
  capacity: number;
  label: string;
}

export type TableclothTheme = "teal-velvet" | "classic-white" | "champagne";

export interface EventData {
  id: string;
  title: string;
  eventType: "Wedding" | "Corporate" | "Gala";
  date: string;
  venueName: string;
  vibe: "Modern" | "Classic" | "Rustic";
  targetGuestCount: number;
  tableclothTheme: TableclothTheme;
  checklist: ChecklistTask[];
  guests: Guest[];
  budget: BudgetData;
  floorPlan: FloorItem[];
}

interface EventState {
  activeEventId: string;
  events: Record<string, EventData>;
  
  // Actions
  setActiveEventId: (id: string) => void;
  resetToDefaults: () => void;
  
  // Checklist
  toggleTask: (taskId: string) => void;
  addTask: (task: Omit<ChecklistTask, "id" | "completed" | "progressPercentage">) => void;
  deleteTask: (taskId: string) => void;
  
  // Guests & Seating
  assignSeat: (guestId: string, tableId: string, seatIndex: number) => void;
  unseatGuest: (guestId: string) => void;
  addGuest: (guest: Omit<Guest, "id" | "tableId" | "seatIndex">) => void;
  updateGuestStatus: (guestId: string, status: GuestStatus) => void;
  toggleCheckIn: (guestId: string) => void;
  updateGuestDetails: (guestId: string, updates: Partial<Omit<Guest, "id">>) => void;
  
  // Floor Plan
  addFloorItem: (item: Omit<FloorItem, "id">) => void;
  updateFloorItemPosition: (id: string, x: number, y: number) => void;
  updateFloorItemRotation: (id: string, rotation: number) => void;
  deleteFloorItem: (id: string) => void;
  
  // Budget Management & Planning
  updateTotalBudget: (totalBudget: number) => void;
  addBudgetItem: (item: Omit<BudgetItem, "id">) => void;
  updateBudgetItem: (id: string, updates: Partial<Omit<BudgetItem, "id">>) => void;
  deleteBudgetItem: (id: string) => void;

  // Event Lifecycle & Budget Allocation
  createEvent: (data: {
    title: string;
    eventType: "Wedding" | "Corporate" | "Gala";
    date?: string;
    venueName?: string;
    vibe?: "Modern" | "Classic" | "Rustic";
    targetGuestCount?: number;
    totalBudget: number;
  }) => string;

  // Decor / Stager
  setTableclothTheme: (theme: TableclothTheme) => void;
  
  // Selectors / Helpers
  getActiveEvent: () => EventData;
}

export const INITIAL_EVENTS: Record<string, EventData> = {
  "sharma-verma-wedding": {
    id: "sharma-verma-wedding",
    title: "Sharma-Verma Wedding Gala",
    eventType: "Wedding",
    date: "October 18, 2026",
    venueName: "Rosewood Glass Pavilion, Napa Valley",
    vibe: "Classic",
    targetGuestCount: 120,
    tableclothTheme: "teal-velvet",
    checklist: [
      { id: "c1", category: "Venue & Catering", title: "Finalize Grand Tasting Menu & Wine Pairing", completed: true, progressPercentage: 100 },
      { id: "c2", category: "Florals & Decor", title: "Review White Peony & Evergreen Floral Prototypes", completed: true, progressPercentage: 100 },
      { id: "c3", category: "Audio & Lighting", title: "Sign Acoustic String Quartet & Lighting Engineer Contract", completed: false, progressPercentage: 60 },
      { id: "c4", category: "Guest Experience", title: "Confirm Artisan Welcome Gift Baskets Delivery", completed: false, progressPercentage: 40 },
      { id: "c5", category: "Logistics", title: "Schedule Valet & Chauffeur Fleet Operations", completed: false, progressPercentage: 20 },
    ],
    guests: [
      { id: "g1", name: "Shalini Singhania", status: "attending", tableId: "table-1", seatIndex: 0, dietary: "Gluten-Free", vip: true, checkedIn: true, checkInTime: "18:45" },
      { id: "g2", name: "Rajiv Singhania", status: "attending", tableId: "table-1", seatIndex: 1, dietary: "Standard", vip: true, checkedIn: true, checkInTime: "18:47" },
      { id: "g3", name: "Meera Iyer", status: "attending", tableId: "table-1", seatIndex: 2, dietary: "Vegan", vip: false, checkedIn: false },
      { id: "g4", name: "Aarav Kapoor", status: "attending", tableId: "table-1", seatIndex: 3, dietary: "Halal", vip: false, checkedIn: false },
      { id: "g5", name: "Kavita Reddy", status: "attending", tableId: "table-1", seatIndex: 4, dietary: "Vegetarian", vip: false, checkedIn: true, checkInTime: "19:10" },
      { id: "g6", name: "Arjun Nair", status: "attending", tableId: "table-2", seatIndex: 0, dietary: "Pescatarian", vip: true, checkedIn: false },
      { id: "g7", name: "Sunita Menon", status: "attending", tableId: "table-2", seatIndex: 1, dietary: "Standard", vip: false, checkedIn: false },
      { id: "g8", name: "Diya Sen", status: "pending", tableId: null, seatIndex: null, dietary: "Nut Allergy", vip: false, checkedIn: false },
      { id: "g9", name: "Kabir Mehta", status: "pending", tableId: null, seatIndex: null, dietary: "Standard", vip: false, checkedIn: false },
      { id: "g10", name: "Dr. Rajesh Kulkarni", status: "attending", tableId: null, seatIndex: null, dietary: "Kosher", vip: true, checkedIn: false },
      { id: "g11", name: "Rhea Pillai", status: "attending", tableId: null, seatIndex: null, dietary: "Standard", vip: false, checkedIn: false },
      { id: "g12", name: "Varun Chawla", status: "declined", tableId: null, seatIndex: null, dietary: "None", vip: false, checkedIn: false },
      { id: "g13", name: "Deepika Bhattacharya", status: "attending", tableId: null, seatIndex: null, dietary: "Lactose-Free", vip: false, checkedIn: false },
      { id: "g14", name: "Nikhil Saxena", status: "pending", tableId: null, seatIndex: null, dietary: "Standard", vip: false, checkedIn: false },
    ],
    budget: {
      totalBudget: 8500000,
      expenses: [
        { id: "b1", category: "Venue Rental", name: "Rosewood Glass Pavilion & Palace Grounds", estimated: 2500000, actual: 2450000 },
        { id: "b2", category: "Catering & Bar", name: "Five-Course Royal Feast & Reserve Cellar", estimated: 2800000, actual: 2980000 },
        { id: "b3", category: "Floral Architecture", name: "Suspended Orchid Canopy & Tablescapes", estimated: 1400000, actual: 1520000 },
        { id: "b4", category: "Lighting & Staging", name: "Custom Crystal Chandelier & Pin-spots", estimated: 800000, actual: 780000 },
        { id: "b5", category: "Photography & Cinema", name: "Editorial Heritage Film & Drone Team", estimated: 1000000, actual: 950000 },
      ],
    },
    floorPlan: [
      { id: "table-1", type: "round-table", x: 220, y: 160, rotation: 0, capacity: 8, label: "Imperial Table 1" },
      { id: "table-2", type: "round-table", x: 480, y: 160, rotation: 0, capacity: 8, label: "Grand Table 2" },
      { id: "table-3", type: "rect-table", x: 350, y: 350, rotation: 0, capacity: 10, label: "VIP Banquet Table" },
      { id: "stage-1", type: "stage", x: 350, y: 50, rotation: 0, capacity: 0, label: "Orchestra Stage" },
      { id: "dance-1", type: "dance-floor", x: 350, y: 220, rotation: 0, capacity: 0, label: "Marble Dance Floor" },
      { id: "bar-1", type: "bar", x: 620, y: 360, rotation: 90, capacity: 0, label: "Artisan Cocktail Bar" },
    ],
  },
  "global-tech-summit": {
    id: "global-tech-summit",
    title: "Global Tech Summit 2026",
    eventType: "Corporate",
    date: "November 12, 2026",
    venueName: "The Skyline Atrium, San Francisco",
    vibe: "Modern",
    targetGuestCount: 250,
    tableclothTheme: "classic-white",
    checklist: [
      { id: "c1", category: "Venue & Catering", title: "Confirm Executive VIP Lounge Hospitality", completed: true, progressPercentage: 100 },
      { id: "c2", category: "Audio & Lighting", title: "Calibrate Keynote Holographic Projection & LED Wall", completed: true, progressPercentage: 100 },
      { id: "c3", category: "Logistics", title: "Security Badging & Biometric Registration Desks", completed: false, progressPercentage: 70 },
      { id: "c4", category: "Guest Experience", title: "Deploy AI Networking Lounge & Concierge App", completed: false, progressPercentage: 50 },
    ],
    guests: [
      { id: "gt1", name: "Satya Narayana", status: "attending", tableId: "g-table-1", seatIndex: 0, dietary: "Vegetarian", vip: true },
      { id: "gt2", name: "Roshni Nadar", status: "attending", tableId: "g-table-1", seatIndex: 1, dietary: "Standard", vip: true },
      { id: "gt3", name: "Nandan Nilekani", status: "attending", tableId: null, seatIndex: null, dietary: "Gluten-Free", vip: true },
      { id: "gt4", name: "Radhika Gupta", status: "attending", tableId: null, seatIndex: null, dietary: "Standard", vip: false },
      { id: "gt5", name: "Kunal Shah", status: "pending", tableId: null, seatIndex: null, dietary: "Halal", vip: false },
      { id: "gt6", name: "Isha Ambani", status: "declined", tableId: null, seatIndex: null, dietary: "Vegan", vip: false },
    ],
    budget: {
      totalBudget: 15000000,
      expenses: [
        { id: "gb1", category: "Venue Rental", name: "Skyline Grand Atrium Main Hall", estimated: 4500000, actual: 4400000 },
        { id: "gb2", category: "AV & Broadcast", name: "Keynote Hologram & Global 4K Stream", estimated: 5500000, actual: 5800000 },
        { id: "gb3", category: "Catering", name: "Gala Luncheon & Artisanal Espresso", estimated: 3000000, actual: 2900000 },
        { id: "gb4", category: "Branding", name: "Fabricated Experience Pavilions", estimated: 2000000, actual: 1850000 },
      ],
    },
    floorPlan: [
      { id: "g-stage-1", type: "stage", x: 350, y: 60, rotation: 0, capacity: 0, label: "Keynote Main Stage" },
      { id: "g-table-1", type: "rect-table", x: 220, y: 220, rotation: 0, capacity: 10, label: "Boardroom Table A" },
      { id: "g-table-2", type: "rect-table", x: 480, y: 220, rotation: 0, capacity: 10, label: "Boardroom Table B" },
      { id: "g-bar-1", type: "bar", x: 350, y: 370, rotation: 0, capacity: 0, label: "Press Networking Bar" },
    ],
  },
};

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      activeEventId: "sharma-verma-wedding",
      events: INITIAL_EVENTS,

      setActiveEventId: (id: string) => {
        if (get().events[id]) {
          set({ activeEventId: id });
        }
      },

      resetToDefaults: () => {
        set({
          activeEventId: "sharma-verma-wedding",
          events: JSON.parse(JSON.stringify(INITIAL_EVENTS)),
        });
      },

      getActiveEvent: () => {
        const { events, activeEventId } = get();
        return events[activeEventId] || events["sharma-verma-wedding"] || Object.values(events)[0] || INITIAL_EVENTS["sharma-verma-wedding"];
      },

      toggleTask: (taskId: string) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const updatedChecklist = currentEvent.checklist.map((task) => {
          if (task.id === taskId) {
            const nextCompleted = !task.completed;
            return {
              ...task,
              completed: nextCompleted,
              progressPercentage: nextCompleted ? 100 : 0,
            };
          }
          return task;
        });

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              checklist: updatedChecklist,
            },
          },
        });
      },

      addTask: (task) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const newTask: ChecklistTask = {
          id: `task-${Date.now()}`,
          completed: false,
          progressPercentage: 0,
          ...task,
        };

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              checklist: [newTask, ...currentEvent.checklist],
            },
          },
        });
      },

      deleteTask: (taskId: string) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              checklist: currentEvent.checklist.filter((t) => t.id !== taskId),
            },
          },
        });
      },

      assignSeat: (guestId: string, tableId: string, seatIndex: number) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        // If another guest is already at this seat, unseat them first
        const updatedGuests = currentEvent.guests.map((g) => {
          if (g.tableId === tableId && g.seatIndex === seatIndex && g.id !== guestId) {
            return { ...g, tableId: null, seatIndex: null };
          }
          if (g.id === guestId) {
            return { ...g, tableId, seatIndex, status: "attending" as GuestStatus };
          }
          return g;
        });

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              guests: updatedGuests,
            },
          },
        });
      },

      unseatGuest: (guestId: string) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const updatedGuests = currentEvent.guests.map((g) =>
          g.id === guestId ? { ...g, tableId: null, seatIndex: null } : g
        );

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              guests: updatedGuests,
            },
          },
        });
      },

      addGuest: (guest) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const newGuest: Guest = {
          id: `guest-${Date.now()}`,
          tableId: null,
          seatIndex: null,
          ...guest,
        };

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              guests: [newGuest, ...currentEvent.guests],
            },
          },
        });
      },

      updateGuestStatus: (guestId: string, status: GuestStatus) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const updatedGuests = currentEvent.guests.map((g) => {
          if (g.id === guestId) {
            return {
              ...g,
              status,
              // If declined, automatically vacate seat
              ...(status === "declined" ? { tableId: null, seatIndex: null } : {}),
            };
          }
          return g;
        });

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              guests: updatedGuests,
            },
          },
        });
      },

      toggleCheckIn: (guestId: string) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const updatedGuests = currentEvent.guests.map((g) => {
          if (g.id === guestId) {
            const nextCheckedIn = !g.checkedIn;
            return {
              ...g,
              checkedIn: nextCheckedIn,
              checkInTime: nextCheckedIn ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
            };
          }
          return g;
        });

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              guests: updatedGuests,
            },
          },
        });
      },

      updateGuestDetails: (guestId: string, updates: Partial<Omit<Guest, "id">>) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const updatedGuests = currentEvent.guests.map((g) => {
          if (g.id === guestId) {
            return {
              ...g,
              ...updates,
              ...(updates.status === "declined" ? { tableId: null, seatIndex: null } : {}),
            };
          }
          return g;
        });

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              guests: updatedGuests,
            },
          },
        });
      },

      addFloorItem: (item) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const newItem: FloorItem = {
          id: `item-${Date.now()}`,
          ...item,
        };

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              floorPlan: [...currentEvent.floorPlan, newItem],
            },
          },
        });
      },

      updateFloorItemPosition: (id: string, x: number, y: number) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              floorPlan: currentEvent.floorPlan.map((item) =>
                item.id === id ? { ...item, x, y } : item
              ),
            },
          },
        });
      },

      updateFloorItemRotation: (id: string, rotation: number) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              floorPlan: currentEvent.floorPlan.map((item) =>
                item.id === id ? { ...item, rotation } : item
              ),
            },
          },
        });
      },

      deleteFloorItem: (id: string) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        // Unseat any guest placed at this table
        const updatedGuests = currentEvent.guests.map((g) =>
          g.tableId === id ? { ...g, tableId: null, seatIndex: null } : g
        );

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              guests: updatedGuests,
              floorPlan: currentEvent.floorPlan.filter((item) => item.id !== id),
            },
          },
        });
      },

      // Budget Management
      updateTotalBudget: (totalBudget: number) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              budget: {
                ...currentEvent.budget,
                totalBudget: Math.max(0, totalBudget),
              },
            },
          },
        });
      },

      addBudgetItem: (item) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        const newExpense: BudgetItem = {
          id: `b-${Date.now()}`,
          ...item,
        };

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              budget: {
                ...currentEvent.budget,
                expenses: [...currentEvent.budget.expenses, newExpense],
              },
            },
          },
        });
      },

      updateBudgetItem: (id, updates) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              budget: {
                ...currentEvent.budget,
                expenses: currentEvent.budget.expenses.map((exp) =>
                  exp.id === id ? { ...exp, ...updates } : exp
                ),
              },
            },
          },
        });
      },

      deleteBudgetItem: (id) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              budget: {
                ...currentEvent.budget,
                expenses: currentEvent.budget.expenses.filter((exp) => exp.id !== id),
              },
            },
          },
        });
      },

      createEvent: (data) => {
        const { events } = get();
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "bespoke-event";
        const newId = `${slug}-${Date.now().toString().slice(-4)}`;
        
        const newEvent: EventData = {
          id: newId,
          title: data.title,
          eventType: data.eventType,
          date: data.date || "December 15, 2026",
          venueName: data.venueName || "The Royal Palace & Heritage Courtyard",
          vibe: data.vibe || "Classic",
          targetGuestCount: data.targetGuestCount || 150,
          tableclothTheme: "champagne",
          checklist: [
            { id: `c-${Date.now()}-1`, category: "Venue & Catering", title: "Finalize Grand Tasting Menu & Reserve Cellar", completed: false, progressPercentage: 20 },
            { id: `c-${Date.now()}-2`, category: "Florals & Decor", title: "Design Architectural Floral Canopies & Tablescapes", completed: false, progressPercentage: 0 },
            { id: `c-${Date.now()}-3`, category: "Audio & Lighting", title: "Calibrate Concert Acoustic Lighting & AV Rigs", completed: false, progressPercentage: 0 },
            { id: `c-${Date.now()}-4`, category: "Guest Experience", title: "Curate Bespoke Welcome Gift Hampers", completed: false, progressPercentage: 0 },
          ],
          guests: [
            { id: `g-${Date.now()}-1`, name: "Shalini Singhania", status: "attending", tableId: "table-1", seatIndex: 0, dietary: "Vegetarian", vip: true },
            { id: `g-${Date.now()}-2`, name: "Rajiv Singhania", status: "attending", tableId: "table-1", seatIndex: 1, dietary: "Standard", vip: true },
            { id: `g-${Date.now()}-3`, name: "Aarav Kapoor", status: "attending", tableId: "table-1", seatIndex: 2, dietary: "Standard", vip: false },
            { id: `g-${Date.now()}-4`, name: "Meera Iyer", status: "pending", tableId: null, seatIndex: null, dietary: "Vegan", vip: false },
          ],
          budget: {
            totalBudget: data.totalBudget,
            expenses: [
              { id: `b-${Date.now()}-1`, category: "Venue Rental", name: "Heritage Palace Booking", estimated: Math.round(data.totalBudget * 0.35), actual: Math.round(data.totalBudget * 0.32) },
              { id: `b-${Date.now()}-2`, category: "Catering & Bar", name: "Five-Course Plated Royal Banquet", estimated: Math.round(data.totalBudget * 0.30), actual: Math.round(data.totalBudget * 0.28) },
              { id: `b-${Date.now()}-3`, category: "Decor & Lighting", name: "Custom Floral Mandap & Chandeliers", estimated: Math.round(data.totalBudget * 0.20), actual: Math.round(data.totalBudget * 0.18) },
            ],
          },
          floorPlan: [
            { id: "table-1", type: "round-table", x: 260, y: 180, rotation: 0, capacity: 8, label: "Imperial Table 1" },
            { id: "table-2", type: "round-table", x: 500, y: 180, rotation: 0, capacity: 8, label: "Grand Table 2" },
            { id: "stage-1", type: "stage", x: 380, y: 60, rotation: 0, capacity: 0, label: "Royal Stage" },
            { id: "bar-1", type: "bar", x: 620, y: 360, rotation: 90, capacity: 0, label: "Champagne Bar" },
          ],
        };

        set({
          events: {
            ...events,
            [newId]: newEvent,
          },
          activeEventId: newId,
        });

        return newId;
      },

      setTableclothTheme: (theme: TableclothTheme) => {
        const { activeEventId, events } = get();
        const currentEvent = events[activeEventId];
        if (!currentEvent) return;

        set({
          events: {
            ...events,
            [activeEventId]: {
              ...currentEvent,
              tableclothTheme: theme,
            },
          },
        });
      },
    }),
    {
      name: "aura-events-storage-v4",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
