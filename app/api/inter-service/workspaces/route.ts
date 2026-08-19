import { NextResponse } from 'next/server'
import { verifyInterServiceRequest } from '@/lib/sso/inter-service'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-lam-signature')
    const timestamp = request.headers.get('x-lam-timestamp')
    const nonce = request.headers.get('x-lam-nonce')

    const verification = await verifyInterServiceRequest(signature, timestamp, nonce, rawBody)
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const { calling_client_id, workspace_id, workspace_code } = payload

    if (!calling_client_id || (!workspace_id && !workspace_code)) {
      return NextResponse.json({
        error: 'Missing required parameters: calling_client_id, and either workspace_id or workspace_code.'
      }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 1. Authenticate Calling Product via Central Product Registry
    const { data: callingProd } = await supabase
      .from('lam_products')
      .select('slug, name, identity_mode')
      .eq('client_id', calling_client_id)
      .maybeSingle()

    if (!callingProd || callingProd.identity_mode !== 'lam_sso') {
      return NextResponse.json({
        error: 'Unregistered or non-SSO calling product client_id.'
      }, { status: 403 })
    }

    // 2. Query Target Workspace
    let query = supabase.from('lam_product_workspaces').select('*')
    if (workspace_id) {
      query = query.eq('id', workspace_id)
    } else {
      query = query.ilike('workspace_code', workspace_code)
    }

    const { data: workspace, error: wsErr } = await query.maybeSingle()

    if (wsErr || !workspace) {
      return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 })
    }

    // 3. STRICT PRODUCT ISOLATION: Reject Cross-Product Workspace Queries
    if (workspace.product_slug !== callingProd.slug) {
      return NextResponse.json({
        error: `Cross-product access denied. Client '${calling_client_id}' (${callingProd.name}) cannot query workspaces belonging to ${workspace.product_slug.toUpperCase()}.`
      }, { status: 403 })
    }

    // 4. Calculate Active Seat Usage
    const { count: activeSeats } = await supabase
      .from('lam_workspace_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspace.id)
      .eq('status', 'active')

    // Return minimal workspace status payload
    return NextResponse.json({
      success: true,
      workspace_id: workspace.id,
      workspace_code: workspace.workspace_code,
      product: workspace.product_slug,
      status: workspace.status,
      plan_tier: workspace.plan_tier,
      max_seats: workspace.max_seats,
      active_seats: activeSeats || 0
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Inter-service workspaces query error' }, { status: 500 })
  }
}
