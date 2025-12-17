import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { QuizList } from 'src/sections/quiz';

// ----------------------------------------------------------------------

export const metadata = { title: `آزمون‌ها - ${CONFIG.appName}` };

export default function Page() {
  return (
    <DashboardContent>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          آزمون‌های موجود
        </Typography>
        <Typography variant="body2" color="text.secondary">
          یکی از آزمون‌های زیر را انتخاب کنید و شروع به پاسخگویی کنید
        </Typography>
      </Box>

      <QuizList />
    </DashboardContent>
  );
}
