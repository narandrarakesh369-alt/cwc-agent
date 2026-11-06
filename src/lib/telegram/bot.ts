/**
 * Telegram Bot Client for Code Wear Connect (CWC)
 * Handles Founder notifications and interactive Human-in-the-Loop approval requests.
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const FOUNDER_CHAT_ID = process.env.TELEGRAM_FOUNDER_CHAT_ID || '';

const API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN || !FOUNDER_CHAT_ID) {
    console.warn('Telegram bot token or Founder chat ID not configured.');
    return null;
  }

  const payload: Record<string, any> = {
    chat_id: FOUNDER_CHAT_ID,
    text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return null;
  }
}

/**
 * Sends an interactive approval notification to the Founder with inline buttons
 */
export async function sendApprovalRequest(params: {
  approvalId: string;
  departmentName: string;
  actionType: string;
  summary: string;
  details?: string;
}) {
  const { approvalId, departmentName, actionType, summary, details } = params;

  const text = `
🚨 <b>FOUNDER APPROVAL REQUIRED</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>Department:</b> ${departmentName}
⚡ <b>Action:</b> <code>${actionType}</code>
📋 <b>Summary:</b> ${summary}
${details ? `\n🔍 <b>Details:</b>\n<i>${details}</i>` : ''}
━━━━━━━━━━━━━━━━━━━━
<i>As Founder, your authorization is required before this external action can proceed.</i>
`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `approve:${approvalId}` },
        { text: '❌ Reject', callback_data: `reject:${approvalId}` },
      ],
      [
        { text: '📝 Request Revision', callback_data: `revise:${approvalId}` },
      ],
    ],
  };

  return sendTelegramMessage(text, inlineKeyboard);
}

/**
 * Notifies the Founder when a drop task sequence completes or reaches an important milestone
 */
export async function sendDropMilestone(params: {
  dropTitle: string;
  milestone: string;
  details: string;
}) {
  const text = `
🎯 <b>CWC DROP UPDATE</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>Collection:</b> ${params.dropTitle}
🚀 <b>Milestone:</b> ${params.milestone}
📝 <b>Status:</b> ${params.details}
━━━━━━━━━━━━━━━━━━━━
<i>"Think as one company. Work as one team. Execute with discipline."</i>
`;
  return sendTelegramMessage(text);
}
