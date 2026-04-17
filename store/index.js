import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import userReducer from "./slices/userSlice";
import homeReducer from "./slices/homeSlice";
import patientReducer from "./slices/patientSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    users: userReducer,
    home: homeReducer,
    patients: patientReducer,
  },
});

export default store;