import { NextRequest, NextResponse } from 'next/server';
import { quickink } from '@/lib/pod/quickink';
import { CWCCEOAgent } from '@/lib/agents/ceo';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get('orderNumber');

  if (!orderNumber) {
    return NextResponse.json({
      status: 'online',
      provider: 'Qikink (Quickink) Print-On-Demand',
      environment: process.env.QUICKINK_ENV || 'sandbox',
    });
  }

  try {
    const status = await quickink.getOrderStatus(orderNumber);
    return NextResponse.json({ orderNumber, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dropId, sampleName, shippingAddress, items, immediate } = body;

    // Create a corresponding task in Supabase under Garment Production
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert({
        drop_id: dropId || null,
        department_id: 'garment_production',
        title: `Qikink POD Order: ${sampleName || 'Sample Garment Run'}`,
        description: `Print-on-demand order submission via Qikink API. Items: ${items?.length || 1} SKU(s).`,
        status: 'pending',
        priority: 'high',
        input_payload: body,
      })
      .select()
      .single();

    if (error || !task) throw new Error(error?.message || 'Failed to create task');

    // Route through the Founder Approval Gatekeeper!
    const result = await CWCCEOAgent.requestDepartmentAction({
      taskId: task.id,
      departmentId: 'garment_production',
      actionType: 'place_quickink_order',
      summary: `Place Qikink POD order for "${sampleName || 'Apparel Run'}" (${items?.length || 1} item(s))`,
      payload: {
        orderNumber: `CWC-${Date.now().toString(36).toUpperCase()}`,
        paymentType: 'Prepaid',
        shippingAddress: shippingAddress || {
          firstName: 'CWC Warehouse / Founder Sample',
          address1: 'Studio CWC',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          phone: '9999999999',
        },
        items: items || [
          {
            sku: 'CWC-TS-OVSZ-280GSM-BLK-L',
            quantity: 1,
            printType: 'DTG',
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      taskId: task.id,
      gatekeeper: result,
      message: 'POD order captured and submitted to Founder Approval Gatekeeper on Telegram.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
