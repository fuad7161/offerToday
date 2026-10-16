import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

/**
 * Share a shop's deal via the native share sheet (mobile) or copy to clipboard
 * (desktop fallback). Drives organic growth through word-of-mouth sharing.
 */
export default function ShareButton({ shopName, discount }) {
  const [copied, setCopied] = useState(false)

  const shareText = `🔥 ${shopName} has up to ${discount}% OFF today! Check it out on Offer Today.`
  const shareUrl = window.location.href

  const fallbackCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available — fail silently
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shopName} — ${discount}% OFF`,
          text: shareText,
          url: shareUrl,
        })
      } catch (e) {
        // User cancelled the share sheet — not an error
        if (e.name !== 'AbortError') fallbackCopy()
      }
    } else {
      fallbackCopy()
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 text-sm font-medium text-muted transition hover:border-accent-600 hover:text-accent-700 active:scale-[0.97]"
    >
      {copied ? (
        <>
          <Check size={14} className="text-accent-700" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Share2 size={14} aria-hidden="true" />
          Share deal
        </>
      )}
    </button>
  )
}
