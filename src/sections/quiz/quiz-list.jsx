'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

export function QuizList() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = sessionStorage.getItem(JWT_STORAGE_KEY);
        const res = await axios.get('/api/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(res.data.quizzes);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'خطا در دریافت آزمون‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId) => {
    router.push(`/dashboard/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Iconify
          icon="mdi:clipboard-text-outline"
          width={64}
          sx={{ color: 'text.secondary', mb: 2 }}
        />
        <Typography variant="h6" color="text.secondary">
          هنوز آزمونی وجود ندارد
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {quizzes.map((quiz) => (
        <Grid key={quiz.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h2">
                  {quiz.title}
                </Typography>
                {quiz.userScore !== null && (
                  <Chip
                    label={`${quiz.userScore}%`}
                    color={quiz.userScore >= 60 ? 'success' : 'warning'}
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {quiz.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify icon="mdi:help-circle-outline" width={18} />
                <Typography variant="body2" color="text.secondary">
                  {quiz.questionCount} سوال
                </Typography>
              </Box>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => handleStartQuiz(quiz.id)}
                startIcon={<Iconify icon="mdi:play" />}
              >
                {quiz.userScore !== null ? 'شرکت مجدد' : 'شروع آزمون'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
