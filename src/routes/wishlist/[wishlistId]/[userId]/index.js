export async function get({ params, url }) {
  const { wishlistId, userId } = params
  const title = decodeURIComponent(url.searchParams.get('s')) ?? 'Loading...'
  return {
    status: 302,
    headers: {
      location: `https://wishlily.app/wishlist/${wishlistId}/${userId}/${encodeURIComponent(title)}`
    }
  };
}
