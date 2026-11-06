import { NextRequest, NextResponse } from 'next/server';
import { CWCCEOAgent, DropDirective } from '@/lib/agents/ceo';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: drops } = await supabaseAdmin.from('drops').select('*').order('created_at', { ascending: false });
    const { data: tasks } = await supabaseAdmin.from('tasks').select('*').order('created_at', { ascending: false }).limit(20);
    const { data: approvals } = await supabaseAdmin.from('approvals').select('*').order('created_at', { ascending: false });
    const { data: artifacts } = await supabaseAdmin.from('artifacts').select('*').order('created_at', { ascending: false }).limit(20);
    const { data: logs } = await supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(25);

    return NextResponse.json({
      drops: drops || [],
      tasks: tasks || [],
      approvals: approvals || [],
      artifacts: artifacts || [],
      logs: logs || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: DropDirective = await req.json();

    if (!body.title || !body.mythologyFigure) {
      return NextResponse.json({ error: 'Title and mythologyFigure are required' }, { status: 400 });
    }

    const drop = await CWCCEOAgent.commissionDrop(body);
    return NextResponse.json({ success: true, drop });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
