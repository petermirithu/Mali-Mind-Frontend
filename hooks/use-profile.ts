import Store from '@/redux/Store';
import { setUserProfile } from '@/redux/UserProfileSlice';
import { api } from '@/services/api';
import { useMutation } from '@tanstack/react-query';

type UpdateProfilePayload = {
	fullname: string;	
    id: number;
};

type ChangePasswordPayload = {
	current_password: string;
	new_password: string;
};

export function useProfile() {
	const updateProfile = useMutation({
		mutationFn: async (payload: UpdateProfilePayload) => {
			const token = Store.getState().userProfile.token;
			const { data } = await api.put('/profile/update-profile', payload, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const user = data?.data ?? data;
			Store.dispatch(setUserProfile(user));
			return user;
		},
	});

	const changePassword = useMutation({
		mutationFn: async (payload: ChangePasswordPayload) => {
			const token = Store.getState().userProfile.token;
			const { data } = await api.post('/auth/change-password', payload, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			return data;
		},
	});

	return {
		updateProfile,
		changePassword,
	};
}
