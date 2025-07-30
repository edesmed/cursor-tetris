import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
  name: 'socket',
  initialState: {},
  reducers: {
    // This slice is mainly for action types
    // Actual socket handling is done in middleware
  }
});

export const socketActions = socketSlice.actions;
export default socketSlice.reducer; 