export const currentUser = useState('currentUser', () => null);

export const restoreSession = async () => {
  const { $supabase } = useNuxtApp();
  const { data } = await $supabase.auth.getSession();
  currentUser.value = data.session?.user || null;
}
