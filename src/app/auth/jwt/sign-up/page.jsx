import { CONFIG } from 'src/global-config';

import { JwtSignUpView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

export const metadata = { title: `ثبت‌نام - ${CONFIG.appName}` };

export default function Page() {
  return <JwtSignUpView />;
}
