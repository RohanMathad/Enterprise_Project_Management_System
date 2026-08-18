import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  searchQuery: string;
  hasSeenViewerModal: boolean;
}

const initialState: UiState = {
  searchQuery: '',
  hasSeenViewerModal: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    setHasSeenViewerModal: (state) => {
      state.hasSeenViewerModal = true;
    },
  },
});

export const { setSearchQuery, clearSearchQuery, setHasSeenViewerModal } = uiSlice.actions;
export default uiSlice.reducer;
