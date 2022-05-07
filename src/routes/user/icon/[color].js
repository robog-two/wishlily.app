import crypto from 'crypto'

export async function get({ params }) {

  const color = params?.color?.toString() ?? 'ffffff'
  if (!color.match(/^([0-9a-f]{3}){1,2}$/i)) {
    throw new Error('Color must be a valid hex color')
  }

  return {
    status: 200,
    body: `<?xml version="1.0" encoding="UTF-8"?>\
    <svg width="112.98" height="112.98" version="1.1" viewBox="0 0 29.892 29.892" xmlns="http://www.w3.org/2000/svg"><circle cx="14.946" cy="14.946" r="14.946" fill="#${params.color}" stroke-width=".26773"/><g transform="translate(-363.24 44.729)"><path d="m372.01-25.579c-2.9179 0.98762-4.8352 2.2986-4.8352 2.2986s4.9334 3.3741 11.019 3.3741 11.019-3.3741 11.019-3.3741-1.9173-1.3109-4.8354-2.2986m-6.1836-11.338c1.5263-1.6301 2.9001-2.5688 2.9001-2.5688s4.7959 5.5841 4.0053 11.589c-0.79062 6.0053-6.8684 5.0789-6.8684 5.0789m4.0053-6.5105c0.79062 6.0053-4.0053 6.5105-4.0053 6.5105s-6.0777 0.92641-6.8684-5.0789c-0.79062-6.0053 4.0053-11.589 4.0053-11.589s6.0777 4.1525 6.8684 10.158z" fill="none" stroke="#000" stroke-width="1.0583" style="paint-order:markers stroke fill"/></g></svg>`,
    headers: {
      'Content-Type': 'image/svg+xml'
    }
  };
}
