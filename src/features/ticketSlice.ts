import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TicketData {
  bookingCode: string;
  ticketNumber: string;
  usageStatus: string;
  usageDate: string;
  ticketDate: string;
  checkInGate: string;
  ticketType: String;
  nameEvent: String;
}

interface TicketState {
  filterValue: string[];
  defaultValue: string;
  tickets: TicketData[];
  showOverlay: boolean;
  showDateChangeOverlay: boolean;
}

const initialState: TicketState = {
  filterValue: [],
  defaultValue: "tatca",
  tickets: [],
  showOverlay: false,
  showDateChangeOverlay: false,
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    setFilterValue: (state, action: PayloadAction<string[]>) => {
      if (action.payload.includes("tatcacong")) {
        state.filterValue = ["tatcacong"];
      } else {
        state.filterValue = action.payload;
      }
    },
    setDefaultValue: (state, action: PayloadAction<string>) => {
      state.defaultValue = action.payload;
    },
    setTickets: (state, action: PayloadAction<TicketData[]>) => {
      state.tickets = action.payload;
    },
    setShowOverlay: (state, action: PayloadAction<boolean>) => {
      state.showOverlay = action.payload;
    },
    setShowDateChangeOverlay: (state, action: PayloadAction<boolean>) => {
      state.showDateChangeOverlay = action.payload;
    },
  },
});

export const setFilterValues = (
  filterValue: string[],
  defaultValue: string
) => ({
  type: "ticket/setFilterValues",
  payload: { filterValue, defaultValue },
});

export const {
  setFilterValue,
  setDefaultValue,
  setTickets,
  setShowOverlay,
  setShowDateChangeOverlay,
} = ticketSlice.actions;

export default ticketSlice.reducer;
