import { configureStore } from "@reduxjs/toolkit";
import UserProfileSlice from "./UserProfileSlice";

export default configureStore({
    reducer:{        
        userProfile:UserProfileSlice        
    }
})