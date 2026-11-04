/**
 * Format ISO 8601 string to 'dd MMM yyyy, HH:mm' or 'dd MMM yyyy, HH:mm:ss'
 * Menggunakan zona waktu lokal pengguna dan locale Bahasa Indonesia.
 */
export function formatDate(isoString: string | null | undefined, includeSeconds = false): string {
  if (!isoString) return "-";
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return "-";
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];

  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  if (includeSeconds) {
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
  }

  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

/**
 * Format bytes to readable string (B, KB, MB)
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Format confidence score (0..1) to percentage string (e.g. 94%)
 */
export function formatConfidence(score: number): string {
  if (isNaN(score)) return "0%";
  const clamped = Math.max(0, Math.min(1, score));
  return `${Math.round(clamped * 100)}%`;
}

