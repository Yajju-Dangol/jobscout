/**
 * Helper to format job posting timestamps into clean, human-readable relative/calendar dates
 * e.g., "Just now", "25m ago", "3h ago", "Yesterday", "2d ago", "Aug 28"
 */
export function formatPostDate(dateStr?: string | null): string {
  if (!dateStr) return 'Recently';

  // If already relative string
  if (
    dateStr === 'Just now' ||
    dateStr.includes('ago') ||
    dateStr === 'Yesterday' ||
    dateStr === 'Recently' ||
    dateStr === 'Today'
  ) {
    return dateStr;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Future dates or negative diffs
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
