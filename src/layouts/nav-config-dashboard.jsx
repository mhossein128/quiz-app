import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  /**
   * آزمون‌ها
   */
  {
    subheader: 'آزمون‌ها',
    items: [
      {
        title: 'لیست آزمون‌ها',
        path: paths.dashboard.root,
        icon: <Iconify icon="mdi:clipboard-text-outline" width={24} />,
      },
    ],
  },
  /**
   * مدیریت (فقط ادمین)
   */
  {
    subheader: 'مدیریت',
    items: [
      {
        title: 'ایجاد آزمون',
        path: '/dashboard/admin/create-quiz',
        icon: <Iconify icon="mdi:plus-circle-outline" width={24} />,
        roles: ['ADMIN'],
      },
    ],
  },
];
