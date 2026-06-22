import { createSlice } from "@reduxjs/toolkit";

/**
 * UserProfile Slice
 */
export const UserProfileSlice = createSlice({
    name:"userProfile",
    initialState:{        
        isAuthenticated: false,
        authReady: false,
        userProfile: null,
        token: null  
    },
    reducers:{                  
        setIsAuthenticated:(state, action)=>{                   
            state.isAuthenticated=action.payload;                                                   
        },        
        setUserProfile:(state, action)=>{                   
            state.userProfile=action.payload;            
        },
        setToken:(state, action)=>{                   
            state.token=action.payload;            
        },
        setAuthReady:(state, action) => {
            state.authReady=action.payload;
        }        
    }
});

export const {setUserProfile, setIsAuthenticated, setAuthReady, setToken} = UserProfileSlice.actions;

export default UserProfileSlice.reducer;


