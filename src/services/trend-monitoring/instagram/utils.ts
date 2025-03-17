import type { ScrapedPost } from './types';

export async function parseInstagramPost(html: string): Promise<ScrapedPost | null> {
  try {
    // Implementation would go here
    // This would parse the HTML structure of an Instagram post
    // and extract relevant data
    return null;
  } catch (error) {
    console.error('Error parsing Instagram post:', error);
    return null;
  }
}

export function extractPostId(url: string): string | null {
  const match = url.match(/\/p\/([^/]+)/);
  return match ? match[1] : null;
}

export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

export function parseEngagementCount(text: string): number {
  const number = text.replace(/[^0-9.]/g, '');
  if (text.includes('k')) {
    return parseFloat(number) * 1000;
  }
  if (text.includes('m')) {
    return parseFloat(number) * 1000000;
  }
  return parseFloat(number);
}

export function calculateTimeDifference(timestamp: string): number {
  const postDate = new Date(timestamp);
  const now = new Date();
  return Math.floor((now.getTime() - postDate.getTime()) / 1000 / 60); // Minutes
}
