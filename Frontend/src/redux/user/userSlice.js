import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
} // membuat awal state untuk kosong dan loading false

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    }, // menambahkan state loading dan error
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    }, // menambahkan state currentUser apabila user berhasil sign-in
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }, // menambahkan state error apabila user gagal sign-in
    updateStart: (state) => {
      state.loading = true;
      state.error = null;
    }, // menambahkan state untuk memulai update
    updateSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    }, // menambahkan state currentUser apabila user berhasil update
    updateFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }, // menambahkan state error apabila user gagal update
  },
});

export const {signInStart, signInSuccess, signInFailure, updateStart, updateSuccess, updateFailure} = userSlice.actions;
export default userSlice.reducer