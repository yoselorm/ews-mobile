import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import userReducer from "./slices/userSlice";
import homeReducer from "./slices/homeSlice";
import patientReducer from "./slices/patientSlice";
import alertReducer from "./slices/alertSlice";
import contentReducer from "./slices/contentSlice";
import communityReducer from "./slices/communitySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    users: userReducer,
    home: homeReducer,
    patients: patientReducer,
    alerts: alertReducer,
    content: contentReducer,
    communities: communityReducer,
  },
});

export default store;