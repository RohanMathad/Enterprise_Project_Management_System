import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types/global.types';

// Extended state to include loading
export interface ExtendedAuthState extends AuthState {
  isLoading: boolean;
}

const initialState: ExtendedAuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  isLoading: true, // Start true while Firebase auth state is checking
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { login, logout, setLoading, updateUser } = authSlice.actions;
export default authSlice.reducer;
