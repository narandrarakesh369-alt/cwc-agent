import { supabaseAdmin } from '@/lib/supabase/server';
import { CWC_DEPARTMENTS, isRestrictedAction } from './departments';
import { sendApprovalRequest, sendDropMilestone, sendTelegramMessage } from '@/lib/telegram/bot';
import { quickink } from '@/lib/pod/quickink';

export interface DropDirective {
  title: string;
  theme: string;
  mythologyFigure: string;
  conceptSummary: string;
}

export class CWCCEOAgent {
  /**
   * Initializes a new drop commissioned by the Founder
   */
  static async commissionDrop(directive: DropDirective) {
    const slug = directive.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 1. Insert new Drop record in Supabase
    const { data: drop, error: dropError } = await supabaseAdmin
      .from('drops')
      .insert({
        title: directive.title,
        theme: directive.theme,
        mythology_figure: directive.mythologyFigure,
        concept_summary: directive.conceptSummary,
        qr_code_slug: `${slug}-${Date.now().toString(36)}`,
        status: 'planning',
      })
      .select()
      .single();

    if (dropError || !drop) {
      throw new Error(`Failed to create drop: ${dropError?.message}`);
    }

    // 2. Log CEO action to audit log
    await this.logEvent({
      source: 'CEO',
      eventType: 'DROP_COMMISSIONED',
      details: `CEO initiated Drop: "${drop.title}" (${drop.mythology_figure}) - Theme: ${drop.theme}`,
      payload: { dropId: drop.id, directive },
    });

    // 3. Decompose directive into tasks for the 10 departments
    const tasksToCreate = [
      {
        deptId: 'cultural_lore',
        title: `Draft Mythic Lore: ${directive.mythologyFigure}`,
        description: `Formulate authentic philosophical backstory and character arc for ${directive.mythologyFigure} suited for CWC anime apparel.`,
        priority: 'high',
      },
      {
        deptId: 'art_studio',
        title: `Character Concept & Anime Art Specifications`,
        description: `Generate visual moodboard, color palette, and vector artwork requirements combining ${directive.mythologyFigure} with cyber-anime aesthetics.`,
        priority: 'high',
      },
      {
        deptId: 'garment_production',
        title: `Manufacturing Tech Pack Formulation`,
        description: `Define garment GSM (280 GSM French Terry), oversize streetwear fit, print placement (back full graphic + chest typography), and stitch specs.`,
        priority: 'medium',
      },
      {
        deptId: 'qr_digital_experience',
        title: `Phygital QR Experience Staging`,
        description: `Create mobile-optimized digital experience unlocked by garment QR: animated lore, proof of authenticity, and soundtrack integration.`,
        priority: 'medium',
      },
      {
        deptId: 'ecommerce_storefront',
        title: `Draft Storefront Listing & Copy`,
        description: `Write high-converting product description, feature highlights, and size guide recommendations.`,
        priority: 'medium',
      },
      {
        deptId: 'drop_marketing',
        title: `Create Viral Launch Campaign & Anime Reels Script`,
        description: `Script 3 Instagram Reels / YouTube Shorts hooks highlighting the mythic lore and street style.`,
        priority: 'medium',
      },
      {
        deptId: 'customer_delight',
        title: `Pre-Drop Collector FAQ & Care Guide`,
        description: `Prepare garment care instructions (cold wash, inside out) and sizing recommendation guidelines.`,
        priority: 'low',
      },
      {
        deptId: 'supply_chain_ops',
        title: `Custom Packaging & Unboxing Specifications`,
        description: `Design custom matte black & gold collector box with anime sleeve and custom QR hangtag.`,
        priority: 'medium',
      },
      {
        deptId: 'finance_economics',
        title: `Unit Economics & Profit Margin Analysis`,
        description: `Model COGS, packaging, logistics, and target retail pricing to guarantee 65%+ gross margin.`,
        priority: 'high',
      },
      {
        deptId: 'legal_ip_council',
        title: `Cultural Reverence Audit & Trademark Clearance`,
        description: `Verify that visual representations maintain cultural respect and ensure original CWC anime design copyrights.`,
        priority: 'critical',
      },
    ];

    // 4. Insert tasks into Supabase
    for (const t of tasksToCreate) {
      await supabaseAdmin.from('tasks').insert({
        drop_id: drop.id,
        department_id: t.deptId,
        title: t.title,
        description: t.description,
        status: 'pending',
        priority: t.priority,
        input_payload: { dropDirective: directive },
      });
    }

    // 5. Notify Founder on Telegram
    await sendDropMilestone({
      dropTitle: drop.title,
      milestone: 'DEPARTMENTS MOBILIZED',
      details: `10 specialized AI departments have been commissioned to develop the "${drop.title}" collection.`,
    });

    return drop;
  }

  /**
   * Evaluates a proposed departmental action and enforces the Founder approval gate
   */
  static async requestDepartmentAction(params: {
    taskId: string;
    departmentId: string;
    actionType: string;
    summary: string;
    payload: Record<string, any>;
  }) {
    const { taskId, departmentId, actionType, summary, payload } = params;

    // Check if this action requires Founder authorization
    const needsApproval = isRestrictedAction(departmentId, actionType);

    if (needsApproval) {
      // 1. Update task status to awaiting_approval
      await supabaseAdmin
        .from('tasks')
        .update({ status: 'awaiting_approval' })
        .eq('id', taskId);

      // 2. Create approval record in Supabase
      const { data: approval, error } = await supabaseAdmin
        .from('approvals')
        .insert({
          task_id: taskId,
          department_id: departmentId,
          action_type: actionType,
          summary,
          payload,
          status: 'pending',
        })
        .select()
        .single();

      if (error || !approval) {
        throw new Error(`Failed to create approval entry: ${error?.message}`);
      }

      const dept = CWC_DEPARTMENTS.find((d) => d.id === departmentId);

      // 3. Send interactive Telegram notification with [Approve] / [Reject] buttons to Founder
      await sendApprovalRequest({
        approvalId: approval.id,
        departmentName: dept?.name || departmentId,
        actionType,
        summary,
        details: JSON.stringify(payload, null, 2),
      });

      await this.logEvent({
        source: 'CEO',
        eventType: 'APPROVAL_REQUESTED',
        details: `Held external action "${actionType}" for Founder authorization.`,
        payload: { approvalId: approval.id, taskId, departmentId },
      });

      return { approved: false, status: 'awaiting_founder_authorization', approvalId: approval.id };
    }

    // If safe / internal action, execute directly
    await this.logEvent({
      source: departmentId,
      eventType: 'ACTION_EXECUTED_AUTONOMOUS',
      details: `Autonomous execution of internal action: ${actionType}`,
      payload,
    });

    return { approved: true, status: 'executed' };
  }

  /**
   * Resolves an approval decision made by the Founder (via Telegram button or Web Dashboard)
   */
  static async resolveApproval(approvalId: string, decision: 'approved' | 'rejected' | 'revised', feedback?: string) {
    const { data: approval } = await supabaseAdmin
      .from('approvals')
      .update({
        status: decision,
        founder_decision_at: new Date().toISOString(),
        founder_feedback: feedback || null,
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (!approval) throw new Error('Approval record not found');

    // Update associated task status
    const taskStatus = decision === 'approved' ? 'in_progress' : decision === 'rejected' ? 'blocked' : 'pending';
    await supabaseAdmin
      .from('tasks')
      .update({ status: taskStatus })
      .eq('id', approval.task_id);

    // If this was a Qikink POD order and Founder approved it, dispatch to Qikink API
    if (decision === 'approved' && (approval.action_type === 'place_quickink_order' || approval.action_type === 'trigger_pod_sample')) {
      try {
        const qikinkRes = await quickink.createOrder(approval.payload);

        // Update task with fulfillment output
        await supabaseAdmin
          .from('tasks')
          .update({
            status: 'completed',
            output_payload: { qikinkResponse: qikinkRes },
          })
          .eq('id', approval.task_id);

        await this.logEvent({
          source: 'QIKINK_POD',
          eventType: 'POD_ORDER_DISPATCHED',
          details: `Order successfully transmitted to Qikink. Qikink ID: ${qikinkRes.order_id || qikinkRes.id || 'N/A'}`,
          payload: qikinkRes,
        });

        await sendTelegramMessage(
          `👕 <b>QIKINK POD DISPATCHED</b>\n━━━━━━━━━━━━━━━━━━━━\nOrder successfully placed with Qikink for manufacturing!\nOrder Ref: <code>${approval.payload.orderNumber || approval.id}</code>\nStatus: <b>Sent to Print Queue</b>`
        );
      } catch (err: any) {
        console.error('Qikink execution error:', err);
        await this.logEvent({
          source: 'QIKINK_POD',
          eventType: 'POD_DISPATCH_FAILED',
          details: `Failed to transmit order to Qikink: ${err.message}`,
        });
        await sendTelegramMessage(
          `⚠️ <b>QIKINK POD ERROR</b>\nApproval was granted, but Qikink API returned an error: <i>${err.message}</i>`
        );
      }
    }

    await this.logEvent({
      source: 'FOUNDER',
      eventType: `APPROVAL_${decision.toUpperCase()}`,
      details: `Founder marked approval as ${decision.toUpperCase()}${feedback ? `: ${feedback}` : ''}`,
      payload: { approvalId, decision, feedback },
    });

    return approval;
  }

  /**
   * Writes an immutable event log to Supabase
   */
  static async logEvent(params: {
    source: string;
    eventType: string;
    details: string;
    payload?: Record<string, any>;
  }) {
    await supabaseAdmin.from('audit_logs').insert({
      source: params.source,
      event_type: params.eventType,
      details: params.details,
      raw_payload: params.payload || {},
    });
  }
}
