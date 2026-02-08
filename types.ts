
// Security & Authentication
export interface TwoStepAuth {
  id: string;
  user_id: string;
  method: 'authenticator' | 'security_key' | 'phone' | 'backup_code';
  identifier: string; // phone number, authenticator name, security key ID
  verified: boolean;
  created_at: string;
}

export interface RecoveryOption {
  id: string;
  user_id: string;
  type: 'phone' | 'streekx_id' | 'backup_codes';
  value: string; // encrypted phone or backup codes
  created_at: string;
}

export interface SecurityCode {
  user_id: string;
  code: string;
  created_at: string;
  expires_at: string;
}

export interface PasswordEntry {
  id: string;
  user_id: string;
  website: string;
  username: string;
  password: string; // encrypted
  created_at: string;
  updated_at: string;
}

export interface DeviceInfo {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  last_active: string;
  is_current: boolean;
  created_at: string;
}

export interface ThirdPartyConnection {
  id: string;
  user_id: string;
  platform: string; // google, github, microsoft, apple, etc.
  account_email: string;
  account_name?: string;
  connected_at: string;
  last_used?: string;
}

// User & Profile
export interface UserProfile {
  id: string;
  streekx_id: string; // Auth Identity (Format: user/streekx.not) - NOT an email
  username: string;   // Public Profile Handle (e.g. @explorer)
  full_name: string;
  avatar_url?: string;
  bio?: string;       // Public Bio
  job_title?: string; // For Workspace context
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  mobile?: string;
  recovery_id?: string;
  two_step_enabled?: boolean;
  two_step_auth?: TwoStepAuth[];
  recovery_options?: RecoveryOption[];
  security_code?: SecurityCode;
  devices?: DeviceInfo[];
  connections?: ThirdPartyConnection[];
  created_at: string;
}

// Project / Workspace (Perplexity Collections Style)
export interface Project {
  id: string;
  title: string;
  emoji: string;
  description: string;
  ai_prompt: string; // Custom System Instruction for this collection
  visibility: 'Public' | 'Private';
  created_at: number;
  updated_at: number;
}

export interface Workspace {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  type: 'Personal' | 'Team' | 'Education';
  is_active: boolean;
  members?: string[]; // IDs of users
}

// Search & AI
export type SearchMode = 'Standard' | 'Pro' | 'Research' | 'Labs';

export interface SourceFlags {
    web: boolean;
    academic: boolean;
    finance: boolean;
    social: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string; // Base64
  name: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  favicon?: string;
  source: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  sources?: SearchResult[]; // Updated to hold full search results
  attachments?: Attachment[];
  relatedQuestions?: string[]; // For follow-up suggestions
}

export interface SearchSession {
  id: string;
  query: string;
  timestamp: number;
  messages: ChatMessage[];
  projectId?: string; // Link to a project context
  mode?: SearchMode; // Store which mode was used
  sourceFlags?: SourceFlags;
}

// Weather
export interface WeatherData {
  temp: number;
  condition: string;
  city: string;
}

// App State
export type Screen = 
  | 'INTRO' 
  | 'AUTH' 
  | 'HOME' 
  | 'SEARCH' 
  | 'ASSISTANT'
  | 'PROFILE' 
  | 'EDIT_PROFILE'
  | 'SETTINGS'
  | 'ACCOUNT'
  | 'PROJECTS'
  | 'PROJECT_DETAIL' // View inside a project
  | 'WORKSPACE'
  | 'FEEDBACK'
  | 'DISCOVERY'
  | 'HISTORY'
  | 'NOTIFICATIONS';

export interface AppState {
  currentScreen: Screen;
  user: UserProfile | null;
  theme: 'light' | 'dark';
  currentSearchId: string | null;
}
