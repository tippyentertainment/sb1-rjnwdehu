export interface AccessRequest {
  id: string;
  profile_id: string;
  requester_id: string;
  request_for_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  comments?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  profile?: {
    name: string;
    description: string;
  };
  reviewer?: {
    full_name: string;
  };
}