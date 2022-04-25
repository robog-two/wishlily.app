export async function get({ params, url }) {
  const { wishlistId, userId } = params
  const title = decodeURIComponent(url.searchParams.get('s')) ?? 'Loading...'
  return {
    status: 302,
    redirect: `https://wishlily.app/wishlist/${wishlistId}/${userId}/${encodeURIComponent(title)}`
  };
}
