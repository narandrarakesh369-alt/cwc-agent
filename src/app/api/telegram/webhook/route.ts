import { NextRequest, NextResponse } from 'next/server';
import { CWCCEOAgent } from '@/lib/agents/ceo';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function getFounderId(): string {
  return (process.env.TELEGRAM_FOUNDER_CHAT_ID || '').replace(/['"]/g, '').trim();
}

function getBotToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN || '').replace(/['"]/g, '').trim();
}

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  const token = getBotToken();
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch (err) {
    console.error('Error answering callback query:', err);
  }
}

async function sendReply(chatId: string | number, text: string) {
  const token = getBotToken();
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not configured on Vercel.');
    return null;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: String(chatId).trim(), text, parse_mode: 'HTML' }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Telegram sendMessage error:', data);
    }
    return data;
  } catch (err) {
    console.error('Error sending reply:', err);
    return null;
  }
}

export async function GET() {
  const token = getBotToken();
  const founderId = getFounderId();

  let botInfo: any = null;
  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      botInfo = await res.json();
    } catch (e: any) {
      botInfo = { error: e.message };
    }
  }

  return NextResponse.json({
    status: 'online',
    hasToken: Boolean(token),
    tokenPrefix: token ? `${token.slice(0, 10)}...` : 'missing',
    founderId: founderId || 'missing',
    botInfo,
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const founderId = getFounderId();

    // 1. Handle Inline Button Clicks (Approvals)
    if (update.callback_query) {
      const cb = update.callback_query;
      const data: string = cb.data || '';
      const fromId = String(cb.from?.id).trim();

      // Verify that only the Founder can tap approval buttons
      if (founderId && fromId !== founderId) {
        await answerCallbackQuery(cb.id, 'Unauthorized: Only the Founder can authorize actions.');
        return NextResponse.json({ ok: true });
      }

      const [action, approvalId] = data.split(':');

      if (action === 'approve' || action === 'reject' || action === 'revise') {
        const decision = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revised';
        await CWCCEOAgent.resolveApproval(approvalId, decision);

        const emoji = decision === 'approved' ? '✅' : decision === 'rejected' ? '❌' : '📝';
        await answerCallbackQuery(cb.id, `${emoji} Action marked as ${decision.toUpperCase()}.`);
        await sendReply(
          fromId,
          `${emoji} <b>Approval ${approvalId.slice(0, 8)}:</b> Decision recorded as <b>${decision.toUpperCase()}</b>.\nThe CEO Agent has resumed execution.`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages / Commands from Founder
    if (update.message && update.message.text) {
      const msg = update.message;
      const text: string = msg.text.trim();
      const chatId = String(msg.chat?.id).trim();

      // If founderId is set, verify Founder identity
      if (founderId && chatId !== founderId) {
        await sendReply(chatId, `⛔ <b>Access Restricted</b>\nYour Chat ID (<code>${chatId}</code>) is not registered as the Founder.`);
        return NextResponse.json({ ok: true });
      }

      // /start command
      if (text === '/start') {
        await sendReply(
          chatId,
          `🏛️ <b>CODE WEAR CONNECT (CWC) - AI WORKFORCE COMMAND</b>\n━━━━━━━━━━━━━━━━━━━━\n"Think as one company. Work as one team. Execute with discipline. Report to the CEO. Answer to the Founder."\n\n<b>Available Commands:</b>\n• <code>/status</code> - Executive overview of all 10 departments\n• <code>/pending</code> - View items waiting for your approval\n• <code>/drop &lt;Name&gt;</code> - Commission a new apparel drop`
        );
        return NextResponse.json({ ok: true });
      }

      // /status command
      if (text === '/status') {
        try {
          const { count: dropsCount } = await supabaseAdmin.from('drops').select('*', { count: 'exact', head: true });
          const { count: pendingApprovals } = await supabaseAdmin.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
          const { count: activeTasks } = await supabaseAdmin.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'in_progress');

          await sendReply(
            chatId,
            `📊 <b>CWC EXECUTIVE STATUS REPORT</b>\n━━━━━━━━━━━━━━━━━━━━\n📦 <b>Active Drops:</b> ${dropsCount || 0}\n⚙️ <b>Tasks in Progress:</b> ${activeTasks || 0}\n🚨 <b>Pending Founder Approvals:</b> ${pendingApprovals || 0}\n🏢 <b>Departments Active:</b> 10 of 10\n━━━━━━━━━━━━━━━━━━━━\n<i>All departments synchronized under CEO coordination.</i>`
          );
        } catch (dbErr: any) {
          await sendReply(chatId, `⚠️ <b>Database Sync Notice:</b> ${dbErr.message}`);
        }
        return NextResponse.json({ ok: true });
      }

      // /pending command
      if (text === '/pending') {
        const { data: pending } = await supabaseAdmin
          .from('approvals')
          .select('id, action_type, summary, department_id')
          .eq('status', 'pending')
          .limit(5);

        if (!pending || pending.length === 0) {
          await sendReply(chatId, '✅ <b>Zero Pending Approvals.</b> All departments have full authorization to continue current internal tasks.');
          return NextResponse.json({ ok: true });
        }

        let reply = `🚨 <b>PENDING APPROVALS (${pending.length}):</b>\n━━━━━━━━━━━━━━━━━━━━\n`;
        pending.forEach((item, idx) => {
          reply += `<b>${idx + 1}. [${item.department_id}]</b>\nAction: <code>${item.action_type}</code>\n${item.summary}\nID: <code>${item.id}</code>\n\n`;
        });
        await sendReply(chatId, reply);
        return NextResponse.json({ ok: true });
      }

      // /drop <Name> command
      if (text.startsWith('/drop')) {
        const dropTitle = text.replace('/drop', '').trim();
        if (!dropTitle) {
          await sendReply(chatId, '⚠️ Please provide a drop concept. Example:\n<code>/drop Karna - Suryaputra Heavyweight Tee</code>');
          return NextResponse.json({ ok: true });
        }

        await sendReply(chatId, `⏳ <b>CEO Acknowledged:</b> Commissioning Drop: "<b>${dropTitle}</b>" across all 10 departments...`);

        try {
          const drop = await CWCCEOAgent.commissionDrop({
            title: dropTitle,
            theme: 'Indian Mythology Anime Streetwear',
            mythologyFigure: dropTitle.split('-')[0].trim() || 'Mythic Legend',
            conceptSummary: `Commissioned via Telegram command by Founder: ${dropTitle}`,
          });

          await sendReply(
            chatId,
            `✨ <b>Drop Initialized:</b> <code>${drop.title}</code>\nTasks distributed to Art, Tech Pack, Lore, QR Tech, and Marketing teams.`
          );
        } catch (dropErr: any) {
          console.error('Error in commissionDrop:', dropErr);
          await sendReply(chatId, `⚠️ <b>Drop Initiation Error:</b> ${dropErr.message}`);
        }
        return NextResponse.json({ ok: true });
      }

      // Unrecognized message
      await sendReply(
        chatId,
        `👋 Greetings Founder. Type:\n• <code>/status</code> for department summary\n• <code>/drop &lt;Name&gt;</code> to start a collection\n• <code>/pending</code> to review gates.`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
