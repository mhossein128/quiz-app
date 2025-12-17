'use client';

import { useState } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';
import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

const emptyQuestion = () => ({
  text: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
});

export default function CreateQuizPage() {
  const router = useRouter();
  const { user } = useAuthContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Check admin access
  if (user?.role !== 'ADMIN') {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Iconify icon="mdi:lock" width={64} sx={{ color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error">
            دسترسی غیرمجاز
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            فقط مدیران می‌توانند آزمون جدید ایجاد کنند
          </Typography>
          <Button onClick={() => router.push('/dashboard')}>بازگشت به داشبورد</Button>
        </Box>
      </DashboardContent>
    );
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === oIndex,
    }));
    setQuestions(updated);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const token = sessionStorage.getItem(JWT_STORAGE_KEY);
      await axios.post(
        '/api/quizzes',
        { title, description, questions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'خطا در ایجاد آزمون');
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    title && description && questions.every((q) => q.text && q.options.every((o) => o.text));

  return (
    <DashboardContent>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          ایجاد آزمون جدید
        </Typography>
        <Typography variant="body2" color="text.secondary">
          اطلاعات آزمون و سوالات را وارد کنید
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          آزمون با موفقیت ایجاد شد! در حال انتقال...
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            اطلاعات آزمون
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="عنوان آزمون"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="توضیحات"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {questions.map((question, qIndex) => (
        <Card key={qIndex} sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">سوال {qIndex + 1}</Typography>
              {questions.length > 1 && (
                <IconButton color="error" onClick={() => handleRemoveQuestion(qIndex)}>
                  <Iconify icon="mdi:delete" />
                </IconButton>
              )}
            </Box>

            <TextField
              fullWidth
              label="متن سوال"
              value={question.text}
              onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              گزینه‌ها (گزینه صحیح را انتخاب کنید)
            </Typography>

            <RadioGroup>
              {question.options.map((option, oIndex) => (
                <Box key={oIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FormControlLabel
                    value={oIndex}
                    control={
                      <Radio
                        checked={option.isCorrect}
                        onChange={() => handleCorrectChange(qIndex, oIndex)}
                      />
                    }
                    label=""
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={`گزینه ${oIndex + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  />
                </Box>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          onClick={handleAddQuestion}
          startIcon={<Iconify icon="mdi:plus" />}
        >
          افزودن سوال
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => router.push('/dashboard')}>
          انصراف
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          loading={loading}
          startIcon={<Iconify icon="mdi:check" />}
        >
          ایجاد آزمون
        </Button>
      </Box>
    </DashboardContent>
  );
}
