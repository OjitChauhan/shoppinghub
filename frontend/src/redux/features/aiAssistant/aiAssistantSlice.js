import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  messages: [],
  isTyping: false,
};

const aiAssistantSlice = createSlice({
  name: "aiAssistant",
  initialState,
  reducers: {
    toggleAssistant: (state) => {
      state.isOpen = !state.isOpen;
    },
    openAssistant: (state) => {
      state.isOpen = true;
    },
    closeAssistant: (state) => {
      state.isOpen = false;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  toggleAssistant,
  openAssistant,
  closeAssistant,
  addMessage,
  setTyping,
  clearMessages,
} = aiAssistantSlice.actions;

export default aiAssistantSlice.reducer;
