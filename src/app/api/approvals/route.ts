import { NextRequest, NextResponse } from 'next/server';
import { CWCCEOAgent } from '@/lib/agents/ceo';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: approvals, error } = await supabaseAdmin
      .from('approvals')
      .select('*, tasks(title, drop_id)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ approvals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { approvalId, decision, feedback } = await req.json();

    if (!approvalId || !decision) {
      return NextResponse.json({ error: 'approvalId and decision are required' }, { status: 400 });
    }

    if (!['approved', 'rejected', 'revised'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const updated = await CWCCEOAgent.resolveApproval(approvalId, decision, feedback);
    return NextResponse.json({ success: true, approval: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
