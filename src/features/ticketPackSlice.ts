import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TicketPack {
  applicationDate: string;
  comboPrice: string;
  expirationDate: string;
  packageCode: string;
  packageName: string;
  status: string;
  ticketPrice: string;
}

interface TicketpackState {
  ticketPacks: TicketPack[];
  currentPage: number;
}

const initialState: TicketpackState = {
  ticketPacks: [],
  currentPage: 1,
};

const ticketpackSlice = createSlice({
  name: "ticketpack",
  initialState,
  reducers: {
    setTicketPacks: (state, action: PayloadAction<TicketPack[]>) => {
      state.ticketPacks = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { setTicketPacks, setCurrentPage } = ticketpackSlice.actions;

export default ticketpackSlice.reducer;
