export enum UserType {
  WRITER = 'WRITER',
  FILMMAKER = 'FILMMAKER',
  BOTH = 'BOTH'
}

export enum Genre {
  ACTION = 'Action',
  COMEDY = 'Comedy',
  DRAMA = 'Drama',
  HORROR = 'Horror',
  SCI_FI = 'Sci-Fi',
  THRILLER = 'Thriller',
  ROMANCE = 'Romance'
}

export enum ScriptFormat {
  SCREENPLAY = 'Screenplay',
  STAGE_PLAY = 'Stage Play',
  WEB_SERIES = 'Web Series'
}

export interface User {
  id: string;
  name: string;
  type: UserType;
  avatar: string;
  bio: string;
  badges: string[];
  walletAddress?: string;
}

export interface Script {
  id: string;
  title: string;
  logline: string;
  genre: Genre;
  format: ScriptFormat;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  hearts: number;
  views: number;
  isVerified: boolean; // Blockchain verification
  txHash?: string; // Polygon transaction hash
  price?: number; // In MATIC/Tokens
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface GenerationParams {
  genre: Genre;
  style: string;
  hero: string;
  villain: string;
  plot: string;
  setting: string;
}

export interface Note {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
}

export interface Revision {
  id: string;
  timestamp: string;
  content: string;
  summary: string;
  authorName: string;
}