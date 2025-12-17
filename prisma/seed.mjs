import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const quizzesData = [
  {
    title: 'آزمون ریاضیات پایه',
    description: 'سوالات پایه‌ای ریاضی',
    questions: [
      { text: '2 + 2 برابر است با:', options: ['3', '4', '5', '6'], correct: 1 },
      { text: '10 - 3 برابر است با:', options: ['5', '6', '7', '8'], correct: 2 },
      { text: '5 * 4 برابر است با:', options: ['15', '18', '20', '25'], correct: 2 },
      { text: '20 / 4 برابر است با:', options: ['4', '5', '6', '7'], correct: 1 },
      { text: '15 + 7 برابر است با:', options: ['20', '21', '22', '23'], correct: 2 },
    ],
  },
  {
    title: 'آزمون علوم طبیعی',
    description: 'سوالات عمومی درباره علوم',
    questions: [
      {
        text: 'بزرگترین سیاره منظومه شمسی کدام است؟',
        options: ['زمین', 'مشتری', 'زحل', 'اورانوس'],
        correct: 1,
      },
      { text: 'فرمول شیمیایی آب چیست؟', options: ['H2O', 'CO2', 'O2', 'NaCl'], correct: 0 },
      {
        text: 'کدام عنصر در هوا بیشترین درصد را دارد؟',
        options: ['اکسیژن', 'نیتروژن', 'کربن', 'هیدروژن'],
        correct: 1,
      },
      { text: 'قلب انسان چند حفره دارد؟', options: ['2', '3', '4', '5'], correct: 2 },
      {
        text: 'کدام سیاره به سیاره سرخ معروف است؟',
        options: ['زهره', 'مریخ', 'عطارد', 'نپتون'],
        correct: 1,
      },
    ],
  },
];

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: { username: 'admin', password: adminPassword, role: 'ADMIN' },
  });
  console.log('Admin user created:', admin.username);

  // Create test user
  const testPassword = await bcrypt.hash('test123', 10);
  const testUser = await prisma.user.create({
    data: { username: 'test', password: testPassword, role: 'USER' },
  });
  console.log('Test user created:', testUser.username);

  // Create quizzes
  for (const quizData of quizzesData) {
    const quiz = await prisma.quiz.create({
      data: { title: quizData.title, description: quizData.description },
    });
    console.log('Quiz created:', quiz.title);

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      const question = await prisma.question.create({
        data: { text: q.text, quizId: quiz.id, order: i + 1 },
      });

      for (let j = 0; j < q.options.length; j++) {
        await prisma.option.create({
          data: { text: q.options[j], isCorrect: j === q.correct, questionId: question.id },
        });
      }
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
