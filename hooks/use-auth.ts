import Store from "@/redux/Store";
import { setIsAuthenticated, setToken, setUserProfile } from "@/redux/UserProfileSlice";
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";

type SignUpPayload = {
  fullname: string;
  email: string;
  firebase_uid: string;
  token: string;
};

type VerifyEmailPayload = {
  email: string;
  code: string;
};

type ResendVerificationPayload = {
  email: string;
};

type GetMePayload = {
  token: string;
  email: string;
}

type SocialAuthPayload = {
  fullname: string;
  email: string;
  firebase_uid: string;
  token: string;
  photo_url: string
}

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
};

export function useAuth() {
  const signUp = useMutation({
    mutationFn: async (payload: SignUpPayload) => {
      const { token, ...body } = payload;
      const { data } = await api.post("/auth/sign-up", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = data?.data ?? data;
      Store.dispatch(setUserProfile(user));
      Store.dispatch(setToken(token));
      return user;
    },
  });

  const verifyEmail = useMutation({
    mutationFn: async (payload: VerifyEmailPayload) => {
      const token = Store.getState().userProfile.token;
      const { data } = await api.post("/auth/verify-email", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
  });

  const resendVerification = useMutation({
    mutationFn: async (payload: ResendVerificationPayload) => {
      const token = Store.getState().userProfile.token;
      const { data } = await api.post("/auth/resend-verification", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
  });

  const getMe = useMutation({
    mutationFn: async (payload: GetMePayload) => {
      const { data } = await api.get(`/auth/me/${payload.email}`, {
        headers: {
          Authorization: `Bearer ${payload.token}`,
        },
      });
      const user = data?.data ?? data;
      Store.dispatch(setUserProfile(user));
      Store.dispatch(setToken(payload.token));
      Store.dispatch(setIsAuthenticated(true));
      return user;
    },
  });

  const socialAuth = useMutation({
    mutationFn: async (payload: SocialAuthPayload) => {
      const { token, photo_url, ...body } = payload;
      const { data } = await api.post("/auth/social-auth", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = data?.data ?? data;
      Store.dispatch(setUserProfile({ photo_url: photo_url, ...user }));
      Store.dispatch(setToken(token));
      Store.dispatch(setIsAuthenticated(true));
      return user;
    },
  });

  const forgotPassword = useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const { data } = await api.post("/auth/forgot-password", payload);
      return data;
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const { data } = await api.post("/auth/reset-password", payload);
      return data;
    },
  });

  return {
    signUp,
    verifyEmail,
    resendVerification,
    getMe,
    socialAuth,
    forgotPassword,
    resetPassword
  };
}