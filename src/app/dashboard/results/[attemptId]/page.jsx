'use client';

import axios from 'axios';
import dynamic from 'next/dynamic';
import { use, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// Lazy load chart component
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// ----------------------------------------------------------------------

export default function ResultsPage({ params }) {
  const { attemptId } = use(params);
  const router = useRouter();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const token = sessionStorage.getItem(JWT_STORAGE_KEY);
        const res = await axios.get(`/api/attempts/${attemptId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttempt(res.data.attempt);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'خطا در دریافت نتایج');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId]);

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={() => router.push('/dashboard')} sx={{ mt: 2 }}>
            بازگشت به داشبورد
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  const chartOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['پاسخ صحیح', 'پاسخ غلط'],
    colors: ['#22c55e', '#ef4444'],
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'نمره',
              formatter: () => `${attempt.percentage}%`,
            },
          },
        },
      },
    },
  };

  const chartSeries = [attempt.correctCount, attempt.incorrectCount];

  const isPassed = attempt.percentage >= 60;

  return (
    <DashboardContent>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          نتیجه آزمون
        </Typography>
        <Typography variant="h5" color="text.secondary">
          {attempt.quiz.title}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isPassed ? 'success.lighter' : 'warning.lighter',
                  color: isPassed ? 'success.main' : 'warning.main',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Typography variant="h2">{attempt.percentage}%</Typography>
              </Box>

              <Typography variant="h5" sx={{ mb: 1 }}>
                {isPassed ? 'تبریک! قبول شدید' : 'متأسفانه قبول نشدید'}
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {attempt.correctCount} پاسخ صحیح از {attempt.total} سوال
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                نمودار نتایج
              </Typography>
              <Chart options={chartOptions} series={chartSeries} type="donut" height={280} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify icon="mdi:check-circle" width={32} color="success.main" />
                    <Typography variant="h4">{attempt.correctCount}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      پاسخ صحیح
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify icon="mdi:close-circle" width={32} color="error.main" />
                    <Typography variant="h4">{attempt.incorrectCount}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      پاسخ غلط
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify icon="mdi:help-circle" width={32} color="info.main" />
                    <Typography variant="h4">{attempt.total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      کل سوالات
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Iconify icon="mdi:percent" width={32} color="warning.main" />
                    <Typography variant="h4">{attempt.percentage}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      درصد نمره
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => router.push('/dashboard')}
          startIcon={<Iconify icon="mdi:home" />}
        >
          بازگشت به داشبورد
        </Button>
        <Button
          variant="contained"
          onClick={() => router.push(`/dashboard/quiz/${attempt.quiz.id}`)}
          startIcon={<Iconify icon="mdi:refresh" />}
        >
          شرکت مجدد
        </Button>
      </Box>
    </DashboardContent>
  );
}
