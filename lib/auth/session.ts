type AuthLike = { auth: { getUser: () => Promise<{ data: { user: { id: string } | null } }> } };

export async function getCurrentUserId(client: AuthLike): Promise<string | null> {
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}
