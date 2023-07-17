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
}

const initialState: TicketState = {
  filterValue: [],
  defaultValue: "tatca",
  tickets: [],
  showOverlay: false,
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
  },
});

export const { setFilterValue, setDefaultValue, setTickets, setShowOverlay } =
  ticketSlice.actions;

export default ticketSlice.reducer;
