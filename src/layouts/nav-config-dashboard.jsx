import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  dashboard: icon('ic-dashboard'),
  course: icon('ic-course'),
  analytics: icon('ic-analytics'),
  folder: icon('ic-folder'),
  user: icon('ic-user'),
};

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
        icon: ICONS.course,
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
        icon: ICONS.folder,
        roles: ['ADMIN'],
      },
    ],
  },
];
