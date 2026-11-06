export type PillarType = 'WEAR' | 'SCAN' | 'SHARE' | 'GOVERNANCE';

export type TaskStatus = 'pending' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed' | 'blocked';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revised';
export type DropStatus = 'planning' | 'in_production' | 'approved' | 'launched' | 'archived';

export interface Drop {
  id: string;
  title: string;
  theme: string;
  mythology_figure: string;
  status: DropStatus;
  concept_summary?: string;
  qr_code_slug?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  pillar: PillarType;
  role_description: string;
  system_prompt: string;
  requires_approval_for: string[];
  is_active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  drop_id?: string;
  department_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  input_payload?: Record<string, any>;
  output_payload?: Record<string, any>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  task_id: string;
  department_id: string;
  action_type: string;
  summary: string;
  payload: Record<string, any>;
  status: ApprovalStatus;
  founder_decision_at?: string;
  founder_feedback?: string;
  created_at: string;
}

export interface Artifact {
  id: string;
  drop_id?: string;
  department_id: string;
  name: string;
  artifact_type: 'art_concept' | 'tech_pack' | 'lore_document' | 'qr_landing_page' | 'marketing_copy' | 'financial_model' | 'legal_clearance';
  storage_url?: string;
  content_text?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  source: string;
  event_type: string;
  details: string;
  raw_payload?: Record<string, any>;
  created_at: string;
}
