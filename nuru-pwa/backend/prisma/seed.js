const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nurucompany.com' },
    update: {},
    create: {
      email: 'admin@nurucompany.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create sample supervisor user
  const supervisorPassword = await bcrypt.hash('Super123!', 12);
  
  const supervisorUser = await prisma.user.upsert({
    where: { email: 'supervisor@nurucompany.com' },
    update: {},
    create: {
      email: 'supervisor@nurucompany.com',
      password: supervisorPassword,
      firstName: 'John',
      lastName: 'Supervisor',
      role: 'SUPERVISOR',
      isActive: true,
    },
  });

  console.log('✅ Created supervisor user:', supervisorUser.email);

  // Create sample client
  const sampleClient = await prisma.client.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Sample Construction Company',
      email: 'client@example.com',
      phone: '+1-555-0123',
      address: '123 Business Street, City, State 12345',
      billingDetails: {
        taxId: 'TAX123456',
        paymentTerms: 'Net 30',
        preferredContact: 'email',
      },
      isActive: true,
    },
  });

  console.log('✅ Created sample client:', sampleClient.name);

  // Create sample project
  const sampleProject = await prisma.project.upsert({
    where: { id: 'sample-project-id' },
    update: {},
    create: {
      id: 'sample-project-id',
      clientId: sampleClient.id,
      name: 'Warehouse Operations Project',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  });

  console.log('✅ Created sample project:', sampleProject.name);

  // Create sample site
  const sampleSite = await prisma.site.upsert({
    where: { id: 'sample-site-id' },
    update: {},
    create: {
      id: 'sample-site-id',
      projectId: sampleProject.id,
      name: 'Main Warehouse Site',
      serviceType: 'WAREHOUSE',
      location: 'Industrial District, Warehouse Complex A',
      isActive: true,
    },
  });

  console.log('✅ Created sample site:', sampleSite.name);

  // Create sample worker types
  const workerTypes = [
    {
      name: 'General Laborer',
      dailyRate: 150.00,
      overtimeMultiplier: 1.5,
    },
    {
      name: 'Forklift Operator',
      dailyRate: 200.00,
      overtimeMultiplier: 1.5,
    },
    {
      name: 'Warehouse Supervisor',
      dailyRate: 250.00,
      overtimeMultiplier: 1.5,
    },
  ];

  for (const workerType of workerTypes) {
    await prisma.workerType.upsert({
      where: { 
        siteId_name: {
          siteId: sampleSite.id,
          name: workerType.name,
        }
      },
      update: {},
      create: {
        ...workerType,
        siteId: sampleSite.id,
        isActive: true,
      },
    });
  }

  console.log('✅ Created sample worker types');

  // Assign supervisor to site
  await prisma.userSite.upsert({
    where: {
      userId_siteId: {
        userId: supervisorUser.id,
        siteId: sampleSite.id,
      },
    },
    update: {},
    create: {
      userId: supervisorUser.id,
      siteId: sampleSite.id,
    },
  });

  console.log('✅ Assigned supervisor to site');

  // Create system configuration
  const systemConfigs = [
    {
      key: 'company_name',
      value: 'Nuru Company',
      category: 'general',
    },
    {
      key: 'invoice_prefix',
      value: 'NUR',
      category: 'invoicing',
    },
    {
      key: 'max_daily_hours',
      value: '12',
      category: 'work_rules',
    },
    {
      key: 'overtime_threshold',
      value: '8',
      category: 'work_rules',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log('✅ Created system configuration');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Sample accounts created:');
  console.log('👤 Admin: admin@nurucompany.com / Admin123!');
  console.log('👤 Supervisor: supervisor@nurucompany.com / Super123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });