'use client';

import axios from 'axios';
import { use, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

export default function QuizPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = sessionStorage.getItem(JWT_STORAGE_KEY);
        const res = await axios.get(`/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(res.data.quiz);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'خطا در دریافت آزمون');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem(JWT_STORAGE_KEY);
      const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      }));

      const res = await axios.post(
        '/api/attempts',
        { quizId: id, answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push(`/dashboard/results/${res.data.attempt.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'خطا در ثبت آزمون');
      setSubmitting(false);
    }
  };

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

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === quiz.questions.length;

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {quiz.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary">
            {currentQuestion + 1} از {quiz.questions.length}
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            سوال {question.order}: {question.text}
          </Typography>

          <RadioGroup
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          >
            {question.options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio />}
                label={option.text}
                sx={{
                  mb: 1,
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: answers[question.id] === option.id ? 'primary.main' : 'divider',
                  bgcolor: answers[question.id] === option.id ? 'primary.lighter' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          startIcon={<Iconify icon="mdi:chevron-right" />}
        >
          سوال قبلی
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              loading={submitting}
              startIcon={<Iconify icon="mdi:check" />}
            >
              ثبت آزمون ({answeredCount}/{quiz.questions.length})
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<Iconify icon="mdi:chevron-left" />}
            >
              سوال بعدی
            </Button>
          )}
        </Box>
      </Box>
    </DashboardContent>
  );
}
