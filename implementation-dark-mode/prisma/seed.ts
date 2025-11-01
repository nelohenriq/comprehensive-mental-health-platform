import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@serenemind.com' },
    update: {},
    create: {
      email: 'demo@serenemind.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create sample journal entries
  const journalEntries = [
    {
      title: 'A peaceful morning',
      content: 'Today started with a beautiful sunrise. I took a moment to breathe deeply and appreciate the quiet. Sometimes the simple things bring the most peace.',
      mood: 4,
      tags: ['gratitude', 'peace', 'morning'],
      userId: demoUser.id,
    },
    {
      title: 'Dealing with stress',
      content: 'Work has been overwhelming lately. I feel anxious about deadlines and responsibilities. I need to remember to take breaks and practice self-care.',
      mood: 2,
      tags: ['stress', 'work', 'anxiety'],
      userId: demoUser.id,
    },
    {
      title: 'Finding strength',
      content: 'Despite the challenges, I\'m proud of how I\'ve been handling things. Small steps forward, even on difficult days, matter.',
      mood: 3,
      tags: ['resilience', 'growth', 'reflection'],
      userId: demoUser.id,
    },
    {
      title: 'Grateful for support',
      content: 'Had a good conversation with a friend today. It\'s amazing how talking things through can provide clarity and comfort.',
      mood: 4,
      tags: ['support', 'friendship', 'gratitude'],
      userId: demoUser.id,
    },
    {
      title: 'Looking forward',
      content: 'Tomorrow is a new day. I\'m choosing to focus on what I can control and let go of what I cannot. Progress over perfection.',
      mood: 5,
      tags: ['hope', 'mindfulness', 'growth'],
      userId: demoUser.id,
    },
  ];

  for (const entry of journalEntries) {
    await (prisma as any).journalEntry.create({
      data: entry,
    });
  }

  console.log('✅ Created sample journal entries');

  // Create sample mood entries
  const moodEntries = [
    { mood: 4, note: 'Good day overall', activities: ['exercise', 'reading'], stressLevel: 2, userId: demoUser.id },
    { mood: 2, note: 'Feeling overwhelmed', activities: ['work', 'meetings'], stressLevel: 4, userId: demoUser.id },
    { mood: 3, note: 'Managing okay', activities: ['walking', 'meditation'], stressLevel: 3, userId: demoUser.id },
    { mood: 5, note: 'Wonderful day!', activities: ['friends', 'nature'], stressLevel: 1, userId: demoUser.id },
    { mood: 4, note: 'Productive and calm', activities: ['work', 'exercise'], stressLevel: 2, userId: demoUser.id },
  ];

  for (const entry of moodEntries) {
    await (prisma as any).moodEntry.create({
      data: entry,
    });
  }

  console.log('✅ Created sample mood entries');

  console.log('🎉 Database seeding completed successfully!');
  console.log('📧 Demo user credentials:');
  console.log('   Email: demo@serenemind.com');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });