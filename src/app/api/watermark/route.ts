const USER_PERMIT_API_PATH = '/v1.0/end-user/services/vibe/user-permit';

export const dynamic = 'force-dynamic';

function watermarkLink(): string {
  return process.env.REGION?.toUpperCase() === 'AY' ? 'https://coding.tuyasmart.com' : 'https://coding.tuya.ai';
}

export async function GET() {
  // 项目方要求移除「Built with Tuya AI」角标，始终不展示
  return Response.json({ show: false, link: watermarkLink() });
}

// 保留原始上游检查逻辑备查（当前不执行）
export async function _GET_upstream_check_disabled() {
  const link = watermarkLink();
  const baseUrl = process.env.TUYA_OPEN_API_BASE_URL?.replace(/\/+$/, '');
  const authKey = process.env.TUYA_OPEN_API_AUTH_KEY;
  if (!baseUrl || !authKey) {
    return Response.json({ show: true, link });
  }

  try {
    const resp = await fetch(`${baseUrl}${USER_PERMIT_API_PATH}`, {
      headers: { Authorization: `Bearer ${authKey}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (!resp.ok) {
      return Response.json({ show: true, link });
    }

    const data = await resp.json();
    const hide = data?.success === true && data.result?.watermark === false;
    return Response.json({ show: !hide, link });
  } catch {
    return Response.json({ show: true, link });
  }
}
