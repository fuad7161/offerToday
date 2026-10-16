// Formatting and computation helpers. Kept pure and dependency-free.

/** "50" -> "50%", "11.1" -> "11.1%". */
export function formatDiscount(value) {
  if (value === null || value === undefined) return '0%'
  const n = Number(value)
  if (!Number.isFinite(n)) return '0%'
  return `${n}%`
}

/** Bangladeshi Taka, rounded to a whole amount. "45000" -> "৳45,000". */
export function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return `৳${Math.round(n).toLocaleString('en-US')}`
}

/** Final price after a percentage discount, rounded to a whole amount. */
export function discountedPrice(regularPrice, percentOff) {
  const price = Number(regularPrice)
  if (!Number.isFinite(price)) return null
  const pct = Number(percentOff) || 0
  return Math.round(price * (1 - pct / 100))
}

/** Human countdown to an offer's end time. */
export function timeLeft(endsAt) {
  const end = new Date(endsAt).getTime()
  if (!Number.isFinite(end)) return { text: '', expired: true }

  const diff = end - Date.now()
  if (diff <= 0) return { text: 'Ended', expired: true }

  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days >= 1) return { text: `Ends in ${days} day${days === 1 ? '' : 's'}`, expired: false }
  if (hours >= 1) return { text: `Ends in ${hours} hour${hours === 1 ? '' : 's'}`, expired: false }
  if (mins >= 1) return { text: `Ends in ${mins} min${mins === 1 ? '' : 's'}`, expired: false }
  return { text: 'Ends in under a minute', expired: false }
}
