export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: { id: string; user_id: string; title: string; client: string; description: string; estimate: number; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; title: string; client: string; description?: string; estimate: number; created_at?: string; updated_at?: string };
        Update: { id?: string; user_id?: string; title?: string; client?: string; description?: string; estimate?: number; created_at?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
