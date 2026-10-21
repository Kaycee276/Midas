const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Midas database seeding...');

  // 1. Seed Admin
  const adminPasswordHash = await bcrypt.hash('AdminMidas2026!', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@midas.campus' },
    update: {
      password_hash: adminPasswordHash,
      full_name: 'Dr. Stella Vance (Chief Compliance)',
      role: 'super_admin',
      is_active: true,
    },
    create: {
      email: 'admin@midas.campus',
      password_hash: adminPasswordHash,
      full_name: 'Dr. Stella Vance (Chief Compliance)',
      role: 'super_admin',
      is_active: true,
    },
  });
  console.log('✅ Admin account seeded:', admin.email);

  // 2. Seed 3 Established Merchants
  const merchantsData = [
    {
      email: 'beanery.merchants@midascampus.ng',
      password: 'BeanerySecure2026!',
      business_name: 'Campus Beanery & Co.',
      business_type: 'cafe',
      business_description:
        'Premier artisanal campus coffee shop & study lounge. Featured products & menu: Signature Cold Brew, Oat Caramel Macchiato, Double Shot Espresso, Warm Butter Croissants, Chicken Paninis, and Gourmet Brain Snacks. Offers student micro-equity to expand the express pickup kiosk at Central Library.',
      business_address: 'Shop 4, Library Walk Promenade, Main Campus',
      business_phone: '+234 803 111 2233',
      owner_full_name: 'Daniel Adebayo',
      owner_phone: '+234 803 111 2234',
      owner_email: 'daniel.adebayo@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 185000,
      kyc: {
        registrationNumber: 'RC-789012',
        taxId: 'TIN-4890123-001',
        monthlyRevenue: 1850000,
        yearsInOperation: 3,
      },
    },
    {
      email: 'unitech.merchants@midascampus.ng',
      password: 'UniTechLab2026!',
      business_name: 'UniTech Diagnostics & Print Lab',
      business_type: 'printing',
      business_description:
        'Full-stack digital printing and hardware repair lab. Key products & services: High-speed thesis printing, hardback dissertation binding, architectural plotters, laptop motherboard diagnostics, screen replacements, USB accessories, and courseware publishing. Raising micro-capital to purchase a commercial Xerox DocuColor laser printer.',
      business_address: 'Suite 12, Student Union Commercial Arcade, North Gate',
      business_phone: '+234 802 444 5566',
      owner_full_name: 'Chioma Okonjo',
      owner_phone: '+234 802 444 5567',
      owner_email: 'chioma.okonjo@gmail.com',
      proximity_to_campus: 'within_1km',
      wallet_balance: 240000,
      kyc: {
        registrationNumber: 'RC-654321',
        taxId: 'TIN-3456789-002',
        monthlyRevenue: 2400000,
        yearsInOperation: 4,
      },
    },
    {
      email: 'greenbowl.merchants@midascampus.ng',
      password: 'GreenBowlGrill2026!',
      business_name: 'Campus Green Bowl & Grill',
      business_type: 'restaurant',
      business_description:
        'Fresh, healthy dining kitchen offering wholesome campus meals. Signature products: Jollof Rice Bowls with Suya Skewers, Grilled Herb Chicken, Avocado & Quinoa Salads, Fresh Fruit Smoothies, Shawarma Wraps, and Fresh Parfaits. Scaling up to service the medical student hostels and athletic pavilions with scheduled daily meal plans.',
      business_address: 'Food Court A2, New Hall Complex, Campus Annex',
      business_phone: '+234 809 777 8899',
      owner_full_name: 'Ibrahim Musa',
      owner_phone: '+234 809 777 8890',
      owner_email: 'ibrahim.musa@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 150000,
      kyc: {
        registrationNumber: 'RC-998877',
        taxId: 'TIN-9876543-003',
        monthlyRevenue: 1500000,
        yearsInOperation: 2,
      },
    },
  ];

  const createdMerchants = [];

  for (const m of merchantsData) {
    const passwordHash = await bcrypt.hash(m.password, 12);

    const merchant = await prisma.merchant.upsert({
      where: { email: m.email.toLowerCase() },
      update: {
        password_hash: passwordHash,
        business_name: m.business_name,
        business_type: m.business_type,
        business_description: m.business_description,
        business_address: m.business_address,
        business_phone: m.business_phone,
        owner_full_name: m.owner_full_name,
        owner_phone: m.owner_phone,
        owner_email: m.owner_email,
        proximity_to_campus: m.proximity_to_campus,
        account_status: 'active',
        kyc_status: 'approved',
        is_verified: true,
        terms_accepted: true,
        wallet_balance: m.wallet_balance,
      },
      create: {
        email: m.email.toLowerCase(),
        password_hash: passwordHash,
        business_name: m.business_name,
        business_type: m.business_type,
        business_description: m.business_description,
        business_address: m.business_address,
        business_phone: m.business_phone,
        owner_full_name: m.owner_full_name,
        owner_phone: m.owner_phone,
        owner_email: m.owner_email,
        proximity_to_campus: m.proximity_to_campus,
        account_status: 'active',
        kyc_status: 'approved',
        is_verified: true,
        terms_accepted: true,
        terms_accepted_at: new Date(),
        wallet_balance: m.wallet_balance,
      },
    });

    // Seed approved KYC record
    await prisma.merchantKyc.upsert({
      where: { merchant_id: merchant.id },
      update: {
        business_registration_number: m.kyc.registrationNumber,
        tax_identification_number: m.kyc.taxId,
        years_in_operation: m.kyc.yearsInOperation,
        average_monthly_revenue: m.kyc.monthlyRevenue,
        status: 'approved',
        reviewed_by: admin.id,
        reviewed_at: new Date(),
        admin_notes: 'Fully verified campus business with operational track record.',
      },
      create: {
        merchant_id: merchant.id,
        business_registration_number: m.kyc.registrationNumber,
        tax_identification_number: m.kyc.taxId,
        years_in_operation: m.kyc.yearsInOperation,
        average_monthly_revenue: m.kyc.monthlyRevenue,
        status: 'approved',
        submitted_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reviewed_by: admin.id,
        reviewed_at: new Date(),
        admin_notes: 'Fully verified campus business with operational track record.',
      },
    });

    createdMerchants.push({ ...merchant, rawPassword: m.password });
    console.log(`✅ Established Merchant seeded: ${merchant.business_name} (${merchant.email})`);
  }

  // 3. Seed Seed Investors (to establish initial capital circulation)
  const student1PasswordHash = await bcrypt.hash('StudentPioneer2026!', 12);
  const student1 = await prisma.student.upsert({
    where: { email: 'femi.pioneer@campus.edu' },
    update: {
      password_hash: student1PasswordHash,
      full_name: 'Femi Balogun',
      student_id: 'CSC/2023/1042',
      university: 'Federal University of Technology',
      program: 'Computer Science',
      year_of_study: 3,
      is_verified: true,
      wallet_balance: 65000,
    },
    create: {
      email: 'femi.pioneer@campus.edu',
      password_hash: student1PasswordHash,
      full_name: 'Femi Balogun',
      student_id: 'CSC/2023/1042',
      university: 'Federal University of Technology',
      program: 'Computer Science',
      year_of_study: 3,
      is_verified: true,
      terms_accepted: true,
      terms_accepted_at: new Date(),
      wallet_balance: 65000,
    },
  });

  const student2PasswordHash = await bcrypt.hash('StudentPioneer2026!', 12);
  const student2 = await prisma.student.upsert({
    where: { email: 'amaka.invests@campus.edu' },
    update: {
      password_hash: student2PasswordHash,
      full_name: 'Amaka Nwosu',
      student_id: 'ACC/2022/0891',
      university: 'Federal University of Technology',
      program: 'Accounting & Finance',
      year_of_study: 4,
      is_verified: true,
      wallet_balance: 80000,
    },
    create: {
      email: 'amaka.invests@campus.edu',
      password_hash: student2PasswordHash,
      full_name: 'Amaka Nwosu',
      student_id: 'ACC/2022/0891',
      university: 'Federal University of Technology',
      program: 'Accounting & Finance',
      year_of_study: 4,
      is_verified: true,
      terms_accepted: true,
      terms_accepted_at: new Date(),
      wallet_balance: 80000,
    },
  });
  console.log('✅ Seed student accounts seeded for initial circulation.');

  // 4. Seed Existing Investments (creating real circulating volume)
  // Clean up any previous seed investments for idempotency
  await prisma.investmentTransaction.deleteMany({});
  await prisma.merchantWalletTransaction.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.investmentMilestone.deleteMany({});
  await prisma.dividendPayout.deleteMany({});
  await prisma.dividendDistribution.deleteMany({});
  await prisma.revenueReport.deleteMany({});
  await prisma.investment.deleteMany({});

  // Beanery investment
  const inv1 = await prisma.investment.create({
    data: {
      student_id: student1.id,
      merchant_id: createdMerchants[0].id,
      amount: 50000,
      shares: 500, // ₦100/share
      price_per_share: 100,
      status: 'active',
      current_value: 58500,
      return_amount: 8500,
      return_percentage: 17,
      notes: 'Initial seed allocation in campus cafe expansion.',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      student_id: student1.id,
      type: 'investment_debit',
      amount: 50000,
      balance_before: 115000,
      balance_after: 65000,
      status: 'completed',
      investment_id: inv1.id,
      description: 'Investment in Campus Beanery & Co.',
    },
  });

  await prisma.merchantWalletTransaction.create({
    data: {
      merchant_id: createdMerchants[0].id,
      type: 'investment_credit',
      amount: 50000,
      balance_before: 135000,
      balance_after: 185000,
      status: 'completed',
      investment_id: inv1.id,
      description: 'Student equity investment credit',
    },
  });

  // UniTech investment
  const inv2 = await prisma.investment.create({
    data: {
      student_id: student2.id,
      merchant_id: createdMerchants[1].id,
      amount: 75000,
      shares: 750,
      price_per_share: 100,
      status: 'active',
      current_value: 90000,
      return_amount: 15000,
      return_percentage: 20,
      notes: 'Micro-equity in high-speed laser printing rig.',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      student_id: student2.id,
      type: 'investment_debit',
      amount: 75000,
      balance_before: 155000,
      balance_after: 80000,
      status: 'completed',
      investment_id: inv2.id,
      description: 'Investment in UniTech Diagnostics & Print Lab',
    },
  });

  await prisma.merchantWalletTransaction.create({
    data: {
      merchant_id: createdMerchants[1].id,
      type: 'investment_credit',
      amount: 75000,
      balance_before: 165000,
      balance_after: 240000,
      status: 'completed',
      investment_id: inv2.id,
      description: 'Student equity investment credit',
    },
  });

  // Green Bowl investment
  const inv3 = await prisma.investment.create({
    data: {
      student_id: student1.id,
      merchant_id: createdMerchants[2].id,
      amount: 35000,
      shares: 350,
      price_per_share: 100,
      status: 'active',
      current_value: 41000,
      return_amount: 6000,
      return_percentage: 17.1,
      notes: 'Campus food court expansion shares.',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      student_id: student1.id,
      type: 'investment_debit',
      amount: 35000,
      balance_before: 150000,
      balance_after: 115000,
      status: 'completed',
      investment_id: inv3.id,
      description: 'Investment in Campus Green Bowl & Grill',
    },
  });

  await prisma.merchantWalletTransaction.create({
    data: {
      merchant_id: createdMerchants[2].id,
      type: 'investment_credit',
      amount: 35000,
      balance_before: 115000,
      balance_after: 150000,
      status: 'completed',
      investment_id: inv3.id,
      description: 'Student equity investment credit',
    },
  });

  // 5. Seed Historical Annual Revenue Reports
  for (const m of createdMerchants) {
    const report = await prisma.revenueReport.create({
      data: {
        merchant_id: m.id,
        period_start: new Date('2025-01-01'),
        period_end: new Date('2025-12-31'),
        gross_revenue: 12500000,
        expenses: 8200000,
        net_profit: 4300000,
        status: 'approved',
        notes: 'Fiscal Year 2025 audited revenue report.',
        reviewed_by: admin.id,
        reviewed_at: new Date('2026-01-01T00:00:00Z'),
        admin_notes: 'Audited and verified for 30% dividend distribution pool.',
      },
    });

    // Create completed distribution record
    await prisma.dividendDistribution.create({
      data: {
        revenue_report_id: report.id,
        merchant_id: m.id,
        total_profit: 4300000,
        merchant_share: 2795000, // 65%
        investor_share_pool: 1290000, // 30%
        platform_share: 215000, // 5%
        status: 'completed',
        distributed_at: new Date('2026-01-01T00:00:00Z'),
      },
    });
  }
  console.log('✅ Annual revenue reports and dividend records seeded.');

  console.log('\n======================================================');
  console.log('🚀 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('\n--- 🏢 ESTABLISHED MERCHANTS ---');
  createdMerchants.forEach((m, idx) => {
    console.log(`\nMerchant #${idx + 1}: ${m.business_name}`);
    console.log(`  Email:       ${m.email}`);
    console.log(`  Password:    ${m.rawPassword}`);
    console.log(`  Type:        ${m.business_type}`);
    console.log(`  Location:    ${m.proximity_to_campus}`);
    console.log(`  Wallet:      ₦${Number(m.wallet_balance).toLocaleString()}`);
  });

  console.log('\n--- 🛡️ COMPLIANCE ADMIN ---');
  console.log(`  Email:       admin@midas.campus`);
  console.log(`  Password:    AdminMidas2026!`);

  console.log('\n--- 🎓 SAMPLE INVESTOR STUDENTS (ALREADY BACKING) ---');
  console.log(`  Student 1:   femi.pioneer@campus.edu (Password: StudentPioneer2026!)`);
  console.log(`  Student 2:   amaka.invests@campus.edu (Password: StudentPioneer2026!)`);
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
