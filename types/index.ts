/**
 * User preference types
 */
export interface UserPreferences {
  visitDuration: number; // in hours (0.5, 1, 1.5, 2+)
  regionOfOrigin: string;
  interests: string[];
}

/**
 * Exhibit types
 */
export interface Exhibit {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  location: {
    floor: number;
    room: string;
  };
  category: string[];
  estimatedTimeMinutes: number;
}

/**
 * Tour route types
 */
export interface TourRoute {
  id: string;
  name: string;
  exhibits: Exhibit[];
  totalDistanceMeters: number;
  estimatedDurationMinutes: number;
}

/**
 * Chat message types
 */
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'audio' | 'link';
    url: string;
    caption?: string;
  }[];
}

/**
 * Guide profile type
 */
export interface GuideProfile {
  name: string;
  avatar?: string;
  specialties: string[];
  description: string;
}