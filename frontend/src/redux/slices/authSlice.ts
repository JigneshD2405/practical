import { createSlice } from "@reduxjs/toolkit";

interface InitialState {
  user: {
    user_id?: string;
    token?: string;
    userName: string;
    role: string;
  } | null;
}

const initialState: InitialState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
    },

    logout: () => initialState,
  },
  selectors: {
    selectUser: (state) => state.user,
  },
});

export const { setUser, logout } = authSlice.actions;
export const { selectUser } = authSlice.selectors;

export default authSlice;
