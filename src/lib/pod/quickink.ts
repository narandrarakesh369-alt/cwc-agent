/**
 * Qikink (Quickink) Print-On-Demand (POD) API Client
 * Supports sandbox and production environments for automated Indian apparel fulfillment.
 * Integrates into CWC: WEAR & Production Pillar.
 */

export interface QuickinkOrderAddress {
  firstName: string;
  lastName?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string; // defaults to 'India'
  phone: string;
  email?: string;
}

export interface QuickinkOrderItem {
  sku: string;               // e.g. 'CWC-TS-KARNA-OVSZ-BLK-L'
  quantity: number;
  price?: number;            // Retail price
  printType?: 'DTG' | 'Screen' | 'Puff' | 'Embroidery';
  frontPrintUrl?: string;    // High-res vector/PNG print file
  backPrintUrl?: string;     // High-res vector/PNG print file
  neckLabelUrl?: string;     // Custom CWC branding label
}

export interface QuickinkCreateOrderParams {
  orderNumber: string;       // CWC Order / Drop ID
  paymentType: 'Prepaid' | 'COD';
  shippingAddress: QuickinkOrderAddress;
  items: QuickinkOrderItem[];
  codAmount?: number;
  customBoxPackaging?: boolean;
}

export class QuickinkClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private token: string | null = null;

  constructor() {
    const isSandbox = process.env.QUICKINK_ENV !== 'production';
    this.baseUrl = isSandbox
      ? process.env.QUICKINK_BASE_URL || 'https://sandbox.qikink.com'
      : 'https://api.qikink.com';
    this.clientId = process.env.QUICKINK_CLIENT_ID || '';
    this.clientSecret = process.env.QUICKINK_CLIENT_SECRET || '';
  }

  /**
   * Retrieves or refreshes OAuth / API access token from Qikink
   */
  async getAccessToken(): Promise<string> {
    if (this.token) return this.token;

    // Support static API Key if provided directly
    if (process.env.QUICKINK_API_KEY) {
      this.token = process.env.QUICKINK_API_KEY;
      return this.token;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Quickink API credentials (QUICKINK_CLIENT_ID & QUICKINK_CLIENT_SECRET) missing.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Quickink Auth failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      this.token = data.access_token || data.token;
      return this.token as string;
    } catch (err: any) {
      console.error('Quickink Authentication Error:', err);
      throw err;
    }
  }

  /**
   * Places a Print-on-Demand order with Qikink
   * NOTE: This is an EXTERNAL/FINANCIAL ACTION and must be gated by the Founder Approval Gatekeeper!
   */
  async createOrder(params: QuickinkCreateOrderParams) {
    const token = await this.getAccessToken();
    const isSandbox = process.env.QUICKINK_ENV !== 'production';

    // Qikink expects order_number to be <= 15 chars
    const sanitizedOrderNumber = (params.orderNumber || `CWC${Date.now().toString(36)}`).slice(0, 15);

    const payload = {
      order_number: sanitizedOrderNumber,
      search_from_my_products: isSandbox ? 0 : 1,
      payment_type: params.paymentType.toLowerCase(),
      shipping_address: {
        first_name: params.shippingAddress.firstName,
        last_name: params.shippingAddress.lastName || '',
        address1: params.shippingAddress.address1,
        address2: params.shippingAddress.address2 || '',
        city: params.shippingAddress.city,
        state: params.shippingAddress.state,
        pincode: params.shippingAddress.pincode,
        country: params.shippingAddress.country || 'India',
        phone: params.shippingAddress.phone,
        email: params.shippingAddress.email || '',
      },
      line_items: params.items.map((item) => ({
        sku: item.sku,
        quantity: String(item.quantity),
        price: String(item.price || 0),
        print_type: item.printType || 'DTG',
        design_front: item.frontPrintUrl || '',
        design_back: item.backPrintUrl || '',
        custom_neck_label: item.neckLabelUrl || '',
      })),
      cod_amount: params.paymentType === 'COD' ? String(params.codAmount || 0) : '0',
      packaging: params.customBoxPackaging ? 'cwc_custom_box' : 'standard',
    };

    const res = await fetch(`${this.baseUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Quickink Order Creation Failed (${res.status}): ${errorText}`);
    }

    return await res.json();
  }

  /**
   * Fetches real-time fulfillment and tracking status from Qikink
   */
  async getOrderStatus(orderNumberOrId: string) {
    const token = await this.getAccessToken();

    const res = await fetch(`${this.baseUrl}/api/v1/orders/${orderNumberOrId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Quickink order status for ${orderNumberOrId}`);
    }

    return await res.json();
  }
}

export const quickink = new QuickinkClient();
