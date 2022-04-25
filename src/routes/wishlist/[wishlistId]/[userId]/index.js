export async function get({ params, url }) {
  const { wishlistId, userId } = params
  const title = decodeURIComponent(url.searchParams.get('s')) ?? 'Loading...'
  return {
    status: 301,
    headers: {
      Location: `/wishlist/${wishlistId}/${userId}/${encodeURIComponent(title)}`
    }
  };
}
