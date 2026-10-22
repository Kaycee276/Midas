const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Midas database seeding for University of Nigeria, Nsukka (UNN)...');

  // 1. Seed Admin / Compliance
  const adminPasswordHash = await bcrypt.hash('AdminMidas2026!', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@midas.campus' },
    update: {
      password_hash: adminPasswordHash,
      full_name: 'Dr. Stella Vance (Chief Compliance Officer)',
      role: 'super_admin',
      is_active: true,
    },
    create: {
      email: 'admin@midas.campus',
      password_hash: adminPasswordHash,
      full_name: 'Dr. Stella Vance (Chief Compliance Officer)',
      role: 'super_admin',
      is_active: true,
    },
  });
  console.log('✅ Admin account seeded:', admin.email);

  const kizuAdminPasswordHash = await bcrypt.hash('KizuAdmin@Midas2026!', 12);
  const kizuAdmin = await prisma.admin.upsert({
    where: { email: 'kizuaba@gmail.com' },
    update: {
      password_hash: kizuAdminPasswordHash,
      full_name: 'Kizu Aba',
      role: 'super_admin',
      is_active: true,
    },
    create: {
      email: 'kizuaba@gmail.com',
      password_hash: kizuAdminPasswordHash,
      full_name: 'Kizu Aba',
      role: 'super_admin',
      is_active: true,
    },
  });
  console.log('✅ Admin account seeded:', kizuAdmin.email);

  const adahAdminPasswordHash = await bcrypt.hash('HappinessAdmin@Midas2026!', 12);
  const adahAdmin = await prisma.admin.upsert({
    where: { email: 'adahapiness79@gmail.com' },
    update: {
      password_hash: adahAdminPasswordHash,
      full_name: 'Happiness Adah',
      role: 'super_admin',
      is_active: true,
    },
    create: {
      email: 'adahapiness79@gmail.com',
      password_hash: adahAdminPasswordHash,
      full_name: 'Happiness Adah',
      role: 'super_admin',
      is_active: true,
    },
  });
  console.log('✅ Admin account seeded:', adahAdmin.email);

  // 2. Established Campus Merchants at UNN (Main Campus, Nsukka)
  const merchantsData = [
    {
      email: 'franco.merchants@midascampus.ng',
      password: 'FrancoRefectory2026!',
      business_name: 'Franco Refectory & Bites',
      business_type: 'restaurant',
      business_description:
        'Premier campus dining & bakery inside Franco Complex, UNN Main Campus. Key menu: Jollof & Fried Rice, Grilled Pepper Chicken, Catfish Pepper Soup, Warm Meat Pies, and Fresh Fruit Parfaits. Raising student micro-equity to expand the express takeaway kiosk.',
      business_address: 'Shop 4, Franco Refectory Complex, UNN Main Campus, Nsukka',
      business_phone: '+234 803 411 2233',
      owner_full_name: 'Emeka Okafor',
      owner_phone: '+234 803 411 2234',
      owner_email: 'emeka.okafor@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 185000,
      kyc: {
        registrationNumber: 'RC-UNN-789012',
        taxId: 'TIN-4890123-001',
        monthlyRevenue: 1850000,
        yearsInOperation: 3,
      },
    },
    {
      email: 'ziklib.merchants@midascampus.ng',
      password: 'ZikLibPress2026!',
      business_name: 'ZikLib Digital Press & Tech Hub',
      business_type: 'printing',
      business_description:
        'Full-stack academic printing, thesis hardback binding, and laptop hardware repair lab. Key services: Project printing, dissertation binding, architectural plotters, motherboard diagnostics, flash drives, and course packs. Raising micro-capital to purchase a commercial Xerox DocuColor laser printer.',
      business_address: 'Suite 6, Nnamdi Azikiwe Library Arcade, UNN Main Campus, Nsukka',
      business_phone: '+234 802 444 5566',
      owner_full_name: 'Chioma Eze',
      owner_phone: '+234 802 444 5567',
      owner_email: 'chioma.eze@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 240000,
      kyc: {
        registrationNumber: 'RC-UNN-654321',
        taxId: 'TIN-3456789-002',
        monthlyRevenue: 2400000,
        yearsInOperation: 4,
      },
    },
    {
      email: 'hilltop.merchants@midascampus.ng',
      password: 'HilltopUNN2026!',
      business_name: 'Hilltop Agro-Mart & Smoothies',
      business_type: 'cafe',
      business_description:
        'Fresh healthy campus eatery and grocery mart serving UNN students. Key products: Fresh Tiger-nut and fruit smoothies, shawarma wraps, vegetable salads, parfaits, and groceries for hostel students at Bello, Eni-Njoku, and Mary Slessor.',
      business_address: 'Plot 12, Odenigwe Road (Behind Flat Gate), Nsukka',
      business_phone: '+234 809 777 8899',
      owner_full_name: 'Chidi Ani',
      owner_phone: '+234 809 777 8890',
      owner_email: 'chidi.ani@gmail.com',
      proximity_to_campus: 'within_1km',
      wallet_balance: 150000,
      kyc: {
        registrationNumber: 'RC-UNN-998877',
        taxId: 'TIN-9876543-003',
        monthlyRevenue: 1500000,
        yearsInOperation: 2,
      },
    },
    {
      email: 'liontech.merchants@midascampus.ng',
      password: 'LionTechUNN2026!',
      business_name: 'SUB Lion Tech & Gadgets',
      business_type: 'electronics',
      business_description:
        'Campus electronics, phone repairs, and tech accessories center at the UNN Student Union Building (SUB). Providing chargers, power banks, computer peripherals, and display replacements for Lions and Lionesses.',
      business_address: 'Shop 11, Student Union Building (SUB) Arcade, UNN Main Campus, Nsukka',
      business_phone: '+234 803 888 9911',
      owner_full_name: 'Tochukwu Ugwu',
      owner_phone: '+234 803 888 9912',
      owner_email: 'tochukwu.ugwu@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 210000,
      kyc: {
        registrationNumber: 'RC-UNN-554433',
        taxId: 'TIN-5544332-004',
        monthlyRevenue: 2100000,
        yearsInOperation: 3,
      },
    },
    {
      email: 'beanery.merchants@midascampus.ng',
      password: 'BeanerySecure2026!',
      business_name: 'Campus Beanery & Co.',
      business_type: 'cafe',
      business_description:
        'Artisanal coffee lounge & study cafe. Featured products: Signature Cold Brew, Oat Caramel Macchiato, Double Shot Espresso, Warm Butter Croissants, Chicken Paninis, and Gourmet Brain Snacks at UNN Central Library.',
      business_address: 'Shop 2, Nnamdi Azikiwe Library Promenade, UNN Main Campus, Nsukka',
      business_phone: '+234 803 111 2233',
      owner_full_name: 'Daniel Adebayo',
      owner_phone: '+234 803 111 2234',
      owner_email: 'daniel.adebayo@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 185000,
      kyc: {
        registrationNumber: 'RC-UNN-789011',
        taxId: 'TIN-4890123-005',
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
        'Full-stack digital printing and hardware repair lab. Key products & services: High-speed thesis printing, hardback dissertation binding, architectural plotters, laptop motherboard diagnostics, and screen replacements.',
      business_address: 'Suite 12, Student Union Building (SUB) Arcade, UNN Main Campus, Nsukka',
      business_phone: '+234 802 444 5566',
      owner_full_name: 'Chioma Okonjo',
      owner_phone: '+234 802 444 5567',
      owner_email: 'chioma.okonjo@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 240000,
      kyc: {
        registrationNumber: 'RC-UNN-654320',
        taxId: 'TIN-3456789-006',
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
        'Fresh, healthy dining kitchen offering wholesome campus meals for UNN students. Signature products: Jollof Rice Bowls with Suya Skewers, Grilled Herb Chicken, Avocado & Quinoa Salads, Fresh Fruit Smoothies, and Parfaits.',
      business_address: 'Food Court A2, Franco Complex, UNN Main Campus, Nsukka',
      business_phone: '+234 809 777 8899',
      owner_full_name: 'Ibrahim Musa',
      owner_phone: '+234 809 777 8890',
      owner_email: 'ibrahim.musa@gmail.com',
      proximity_to_campus: 'on_campus',
      wallet_balance: 150000,
      kyc: {
        registrationNumber: 'RC-UNN-998876',
        taxId: 'TIN-9876543-007',
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
        admin_notes: 'Fully verified UNN campus business with audited operational record.',
      },
      create: {
        merchant_id: merchant.id,
        business_registration_number: m.kyc.registrationNumber,
        tax_identification_number: m.kyc.taxId,
        years_in_operation: m.kyc.yearsInOperation,
        average_monthly_revenue: m.kyc.monthlyRevenue,
        status: 'approved',
        reviewed_by: admin.id,
        reviewed_at: new Date(),
        admin_notes: 'Fully verified UNN campus business with audited operational record.',
      },
    });

    createdMerchants.push({ ...merchant, rawPassword: m.password });
    console.log(`✅ UNN Merchant seeded: ${merchant.business_name} (${merchant.email})`);
  }

  // 3. Seed Students at University of Nigeria, Nsukka (UNN)
  const unnStudentsData = [
    {
      email: 'chidera.cs@unn.edu.ng',
      password: 'StudentUNN2026!',
      full_name: 'Chidera Okeke',
      student_id: '2021/243509',
      phone: '+234 810 123 4567',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Computer Science',
      year_of_study: 4,
      wallet_balance: 75000,
    },
    {
      email: 'somto.eng@unn.edu.ng',
      password: 'StudentUNN2026!',
      full_name: 'Somtochukwu Ugwu',
      student_id: '2022/244812',
      phone: '+234 814 234 5678',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Electronic Engineering',
      year_of_study: 3,
      wallet_balance: 90000,
    },
    {
      email: 'blessing.pharm@unn.edu.ng',
      password: 'StudentUNN2026!',
      full_name: 'Blessing Nnamani',
      student_id: '2021/242901',
      phone: '+234 816 345 6789',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Pharmacy',
      year_of_study: 4,
      wallet_balance: 110000,
    },
    {
      email: 'kene.econ@unn.edu.ng',
      password: 'StudentUNN2026!',
      full_name: 'Kenechukwu Eze',
      student_id: '2023/246118',
      phone: '+234 812 456 7890',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Economics',
      year_of_study: 2,
      wallet_balance: 130000, // Fresh account ready to test new investment flows during defense
    },
    {
      email: 'femi.pioneer@campus.edu',
      password: 'StudentPioneer2026!',
      full_name: 'Femi Balogun',
      student_id: '2021/243102',
      phone: '+234 803 555 1001',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Computer Science',
      year_of_study: 4,
      wallet_balance: 65000,
    },
    {
      email: 'amaka.invests@campus.edu',
      password: 'StudentPioneer2026!',
      full_name: 'Amaka Nwosu',
      student_id: '2022/244519',
      phone: '+234 802 666 2002',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Accountancy',
      year_of_study: 4,
      wallet_balance: 80000,
    },
    {
      email: 'tunde.tech@campus.edu',
      password: 'StudentMidas2026!',
      full_name: 'Tunde Bakare',
      student_id: '2023/245801',
      phone: '+234 809 777 3003',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Mechanical Engineering',
      year_of_study: 2,
      wallet_balance: 120000,
    },
    {
      email: 'zainab.biochem@campus.edu',
      password: 'StudentMidas2026!',
      full_name: 'Zainab Aliyu',
      student_id: '2022/244102',
      phone: '+234 808 888 4004',
      university: 'University of Nigeria, Nsukka (UNN)',
      program: 'Biochemistry',
      year_of_study: 3,
      wallet_balance: 45000,
    },
  ];

  const createdStudents = [];

  for (const s of unnStudentsData) {
    const passwordHash = await bcrypt.hash(s.password, 12);
    const student = await prisma.student.upsert({
      where: { email: s.email },
      update: {
        password_hash: passwordHash,
        full_name: s.full_name,
        student_id: s.student_id,
        phone: s.phone,
        university: s.university,
        program: s.program,
        year_of_study: s.year_of_study,
        is_verified: true,
        account_status: 'active',
        wallet_balance: s.wallet_balance,
      },
      create: {
        email: s.email,
        password_hash: passwordHash,
        full_name: s.full_name,
        student_id: s.student_id,
        phone: s.phone,
        university: s.university,
        program: s.program,
        year_of_study: s.year_of_study,
        is_verified: true,
        account_status: 'active',
        terms_accepted: true,
        terms_accepted_at: new Date(),
        wallet_balance: s.wallet_balance,
      },
    });

    createdStudents.push({ ...student, rawPassword: s.password });
    console.log(`✅ UNN Student seeded: ${student.full_name} (${student.email})`);
  }

  // 4. Clean previous investments & seed realistic UNN circulation volume
  await prisma.investmentTransaction.deleteMany({});
  await prisma.merchantWalletTransaction.deleteMany({});
  await prisma.walletTransaction.deleteMany({});
  await prisma.investmentMilestone.deleteMany({});
  await prisma.dividendPayout.deleteMany({});
  await prisma.dividendDistribution.deleteMany({});
  await prisma.revenueReport.deleteMany({});
  await prisma.investment.deleteMany({});

  // Franco Merchant is createdMerchants[0]
  // ZikLib Press is createdMerchants[1]
  // Hilltop Agro-Mart is createdMerchants[2]
  // SUB Lion Tech is createdMerchants[3]

  // Investment 1: Chidera Okeke (student 0) backs Franco Refectory (merchant 0)
  const inv1 = await prisma.investment.create({
    data: {
      student_id: createdStudents[0].id,
      merchant_id: createdMerchants[0].id,
      amount: 40000,
      shares: 400,
      price_per_share: 100,
      status: 'active',
      current_value: 47200,
      return_amount: 7200,
      return_percentage: 18.0,
      notes: 'Franco Refectory express takeaway kiosk expansion.',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      student_id: createdStudents[0].id,
      type: 'investment_debit',
      amount: 40000,
      balance_before: 115000,
      balance_after: 75000,
      status: 'completed',
      investment_id: inv1.id,
      description: 'Investment in Franco Refectory & Bites',
    },
  });

  await prisma.merchantWalletTransaction.create({
    data: {
      merchant_id: createdMerchants[0].id,
      type: 'investment_credit',
      amount: 40000,
      balance_before: 145000,
      balance_after: 185000,
      status: 'completed',
      investment_id: inv1.id,
      description: 'Student equity credit: Chidera Okeke',
    },
  });

  // Investment 2: Chidera Okeke (student 0) backs ZikLib Digital Press (merchant 1)
  const inv2 = await prisma.investment.create({
    data: {
      student_id: createdStudents[0].id,
      merchant_id: createdMerchants[1].id,
      amount: 25000,
      shares: 250,
      price_per_share: 100,
      status: 'active',
      current_value: 30000,
      return_amount: 5000,
      return_percentage: 20.0,
      notes: 'ZikLib commercial DocuColor printing rig.',
    },
  });

  await prisma.merchantWalletTransaction.create({
    data: {
      merchant_id: createdMerchants[1].id,
      type: 'investment_credit',
      amount: 25000,
      balance_before: 215000,
      balance_after: 240000,
      status: 'completed',
      investment_id: inv2.id,
      description: 'Student equity credit: Chidera Okeke',
    },
  });

  // Investment 3: Somtochukwu Ugwu (student 1) backs SUB Lion Tech (merchant 3)
  const inv3 = await prisma.investment.create({
    data: {
      student_id: createdStudents[1].id,
      merchant_id: createdMerchants[3].id,
      amount: 50000,
      shares: 500,
      price_per_share: 100,
      status: 'active',
      current_value: 59000,
      return_amount: 9000,
      return_percentage: 18.0,
      notes: 'SUB Lion Tech hardware diagnostic equipment.',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      student_id: createdStudents[1].id,
      type: 'investment_debit',
      amount: 50000,
      balance_before: 140000,
      balance_after: 90000,
      status: 'completed',
      investment_id: inv3.id,
      description: 'Investment in SUB Lion Tech & Gadgets',
    },
  });

  await prisma.merchantWalletTransaction.create({
    data: {
      merchant_id: createdMerchants[3].id,
      type: 'investment_credit',
      amount: 50000,
      balance_before: 160000,
      balance_after: 210000,
      status: 'completed',
      investment_id: inv3.id,
      description: 'Student equity credit: Somtochukwu Ugwu',
    },
  });

  // Investment 4: Blessing Nnamani (student 2) backs Hilltop Agro-Mart (merchant 2)
  const inv4 = await prisma.investment.create({
    data: {
      student_id: createdStudents[2].id,
      merchant_id: createdMerchants[2].id,
      amount: 35000,
      shares: 350,
      price_per_share: 100,
      status: 'active',
      current_value: 41300,
      return_amount: 6300,
      return_percentage: 18.0,
      notes: 'Cold-press juice extractor and smoothie station at Behind Flat.',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      student_id: createdStudents[2].id,
      type: 'investment_debit',
      amount: 35000,
      balance_before: 145000,
      balance_after: 110000,
      status: 'completed',
      investment_id: inv4.id,
      description: 'Investment in Hilltop Agro-Mart & Smoothies',
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
      investment_id: inv4.id,
      description: 'Student equity credit: Blessing Nnamani',
    },
  });

  // Kenechukwu Eze initial deposit (ready for live defense demonstration)
  await prisma.walletTransaction.create({
    data: {
      student_id: createdStudents[3].id,
      type: 'deposit',
      amount: 130000,
      balance_before: 0,
      balance_after: 130000,
      status: 'completed',
      description: 'Campus wallet bank top-up via Paystack',
    },
  });

  // Zainab Aliyu backs ZikLib
  const inv5 = await prisma.investment.create({
    data: {
      student_id: createdStudents[7].id,
      merchant_id: createdMerchants[1].id,
      amount: 20000,
      shares: 200,
      price_per_share: 100,
      status: 'active',
      current_value: 23600,
      return_amount: 3600,
      return_percentage: 18.0,
      notes: 'ZikLib academic project binding station.',
    },
  });

  await prisma.walletTransaction.create({
    data: {
      student_id: createdStudents[7].id,
      type: 'investment_debit',
      amount: 20000,
      balance_before: 65000,
      balance_after: 45000,
      status: 'completed',
      investment_id: inv5.id,
      description: 'Investment in ZikLib Digital Press & Tech Hub',
    },
  });

  // 5. Seed Historical Annual Revenue Reports for UNN Merchants
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
        notes: 'Fiscal Year 2025 audited revenue report for UNN operations.',
        reviewed_by: admin.id,
        reviewed_at: new Date('2026-01-01T00:00:00Z'),
        admin_notes: 'Audited and verified for 30% dividend distribution pool.',
      },
    });

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

  console.log('✅ Annual revenue reports and dividend records seeded for UNN merchants.');

  console.log('\n======================================================');
  console.log('🎓 UNN (UNIVERSITY OF NIGERIA, NSUKKA) SEEDING COMPLETE!');
  console.log('======================================================');
  console.log('\n--- 🏢 UNN CAMPUS MERCHANTS ---');
  createdMerchants.forEach((m, idx) => {
    console.log(`\nMerchant #${idx + 1}: ${m.business_name}`);
    console.log(`  Email:       ${m.email}`);
    console.log(`  Password:    ${m.rawPassword}`);
    console.log(`  Location:    ${m.business_address}`);
    console.log(`  Vault:       ₦${Number(m.wallet_balance).toLocaleString()}`);
  });

  console.log('\n--- 🛡️ COMPLIANCE ADMIN ---');
  console.log(`  Email:       admin@midas.campus`);
  console.log(`  Password:    AdminMidas2026!`);

  console.log('\n--- 🎓 UNN STUDENT INVESTORS ---');
  createdStudents.forEach((s) => {
    console.log(`  ${s.full_name} (${s.program}, ${s.student_id})`);
    console.log(`    Email:    ${s.email}`);
    console.log(`    Password: ${s.rawPassword}`);
    console.log(`    Wallet:   ₦${Number(s.wallet_balance).toLocaleString()}`);
  });
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
