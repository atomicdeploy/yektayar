/**
 * Seed script for comprehensive relationship assessment test (رهنما)
 * Run with: bun run seed-rahnama-test.ts
 */

import postgres from 'postgres'
import { logger } from '@yektayar/shared'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/yektayar'
const db = postgres(DATABASE_URL)

const rahnamaTest = {
  title: 'رهنما - آزمون جامع ارزیابی مولفه‌های رابطه',
  titleEn: 'Rahnama - Comprehensive Relationship Assessment Test',
  description: 'آزمونی که مسیر رابطه را روشن می‌کند و راه‌حل‌ها را نشان می‌دهد، مثل یک دوست کنار فرد می‌ماند تا مشکلات را بشناسد. این پرسشنامه یک ابزار خودارزیابی است که برای ایجاد یک گفتگوی سازنده و مبتنی بر داده طراحی شده است.',
  descriptionEn: 'A test that illuminates the path of the relationship and shows solutions, standing beside you like a friend to identify problems. This questionnaire is a self-assessment tool designed to create a constructive, data-driven dialogue.',
  tagline: 'رابطه رو بسنج، آسیب‌ها رو بفهم، راه‌حل‌ها بگیر',
  taglineEn: 'Measure the relationship, understand the damages, get solutions',
  questions: [
    // Section 1: Communication Skills (مهارت ارتباطی)
    {
      id: 1,
      section: 1,
      sectionTitle: 'مهارت ارتباطی',
      sectionTitleEn: 'Communication Skills',
      text: 'من احساساتم را به روشی قابل درک و شفاف با همسرم در میان می‌گذارم.',
      textEn: 'I share my feelings with my spouse in a clear and understandable way.',
    },
    {
      id: 2,
      section: 1,
      sectionTitle: 'مهارت ارتباطی',
      sectionTitleEn: 'Communication Skills',
      text: 'وقتی همسرم صحبت می‌کند، با دقت و بدون قطع کردن صحبت‌هایش، به حرف‌هایش گوش می‌دهم.',
      textEn: 'When my spouse talks, I listen carefully without interrupting.',
    },
    {
      id: 3,
      section: 1,
      sectionTitle: 'مهارت ارتباطی',
      sectionTitleEn: 'Communication Skills',
      text: 'در مواقع لازم، از همسرم سوالات روشن‌کننده می‌پرسم تا از درک صحیح مطالب اطمینان حاصل کنم.',
      textEn: 'When necessary, I ask clarifying questions to ensure proper understanding.',
    },
    {
      id: 4,
      section: 1,
      sectionTitle: 'مهارت ارتباطی',
      sectionTitleEn: 'Communication Skills',
      text: 'در بیان نظرات و خواسته‌هایم جسور و قاطع هستم، نه پرخاشگر یا منفعل.',
      textEn: 'I am assertive in expressing my opinions and desires, neither aggressive nor passive.',
    },
    {
      id: 5,
      section: 1,
      sectionTitle: 'مهارت ارتباطی',
      sectionTitleEn: 'Communication Skills',
      text: 'از زبان غیرکلامی (مانند تماس چشمی، لحن صدا) مناسبی در هنگام گفتگو استفاده می‌کنم.',
      textEn: 'I use appropriate non-verbal language (eye contact, tone) during conversations.',
    },
    {
      id: 6,
      section: 1,
      sectionTitle: 'مهارت ارتباطی',
      sectionTitleEn: 'Communication Skills',
      text: 'در مواقع ناراحتی یا خشم، می‌توانم خودم را مدیریت کنم و گفتگویی سازنده داشته باشم.',
      textEn: 'When upset or angry, I can manage myself and have a constructive conversation.',
    },
    {
      id: 7,
      section: 1,
      sectionTitle: 'مهارت ارتباطی',
      sectionTitleEn: 'Communication Skills',
      text: 'از گفتگوهای معمول و روزمره برای تقویت ارتباطم با همسرم استفاده می‌کنم.',
      textEn: 'I use regular daily conversations to strengthen my connection with my spouse.',
    },

    // Section 2: Conflict Management (مدیریت تعارض)
    {
      id: 8,
      section: 2,
      sectionTitle: 'مدیریت تعارض',
      sectionTitleEn: 'Conflict Management',
      text: 'در هنگام اختلاف، بر حل مسئله تمرکز می‌کنم، نه بر پیروزی در بحث.',
      textEn: 'During disagreements, I focus on solving the problem, not winning the argument.',
    },
    {
      id: 9,
      section: 2,
      sectionTitle: 'مدیریت تعارض',
      sectionTitleEn: 'Conflict Management',
      text: 'در هنگام مشاجره، از توهین، سرزنش و مطرح کردن مسائل گذشته خودداری می‌کنم.',
      textEn: 'During arguments, I refrain from insults, blame, and bringing up past issues.',
    },
    {
      id: 10,
      section: 2,
      sectionTitle: 'مدیریت تعارض',
      sectionTitleEn: 'Conflict Management',
      text: 'سعی می‌کنم خود را به جای همسرم بگذارم و دیدگاه او را درک کنم.',
      textEn: 'I try to put myself in my spouse\'s place and understand their perspective.',
    },
    {
      id: 11,
      section: 2,
      sectionTitle: 'مدیریت تعارض',
      sectionTitleEn: 'Conflict Management',
      text: 'برای حل اختلافات، آماده مصالحه و پیدا کردن یک راه حل میانه هستم.',
      textEn: 'I am willing to compromise and find a middle-ground solution to conflicts.',
    },
    {
      id: 12,
      section: 2,
      sectionTitle: 'مدیریت تعارض',
      sectionTitleEn: 'Conflict Management',
      text: 'می‌توانم در هنگام عصبانیت، مکث کرده و اگر نیاز است گفتگو را به زمان دیگری موکول کنم.',
      textEn: 'When angry, I can pause and postpone the conversation if necessary.',
    },
    {
      id: 13,
      section: 2,
      sectionTitle: 'مدیریت تعارض',
      sectionTitleEn: 'Conflict Management',
      text: 'پس از پایان یک اختلاف، برای ترمیم رابطه و بازگشت به شرایط عادی تلاش می‌کنم.',
      textEn: 'After a conflict, I work to repair the relationship and return to normal.',
    },
    {
      id: 14,
      section: 2,
      sectionTitle: 'مدیریت تعارض',
      sectionTitleEn: 'Conflict Management',
      text: 'اختلافات را به عنوان یک فرصت برای درک بیشتر و رشد رابطه می‌بینم.',
      textEn: 'I see conflicts as opportunities for better understanding and relationship growth.',
    },

    // Section 3: Emotional Intimacy (صمیمیت عاطفی)
    {
      id: 15,
      section: 3,
      sectionTitle: 'صمیمیت عاطفی',
      sectionTitleEn: 'Emotional Intimacy',
      text: 'می‌توانم عمیق‌ترین افکار، ترس‌ها و آرزوهایم را با همسرم به اشتراک بگذارم.',
      textEn: 'I can share my deepest thoughts, fears, and dreams with my spouse.',
    },
    {
      id: 16,
      section: 3,
      sectionTitle: 'صمیمیت عاطفی',
      sectionTitleEn: 'Emotional Intimacy',
      text: 'زمانی که همسرم مشکلاتش را با من در میان می‌گذارد، احساس می‌کند که درک و تأیید می‌شود.',
      textEn: 'When my spouse shares problems, they feel understood and validated.',
    },
    {
      id: 17,
      section: 3,
      sectionTitle: 'صمیمیت عاطفی',
      sectionTitleEn: 'Emotional Intimacy',
      text: 'در مواقع نیاز، حمایت عاطفی لازم را به همسرم ارائه می‌دهم.',
      textEn: 'I provide necessary emotional support to my spouse when needed.',
    },
    {
      id: 18,
      section: 3,
      sectionTitle: 'صمیمیت عاطفی',
      sectionTitleEn: 'Emotional Intimacy',
      text: 'احساس می‌کنم همسرم بهترین دوست من است.',
      textEn: 'I feel my spouse is my best friend.',
    },
    {
      id: 19,
      section: 3,
      sectionTitle: 'صمیمیت عاطفی',
      sectionTitleEn: 'Emotional Intimacy',
      text: 'برای با هم بودن و گفتگوهای غیررسمی و لذت‌بخش، زمان کافی اختصاص می‌دهیم.',
      textEn: 'We dedicate sufficient time for being together and enjoyable conversations.',
    },
    {
      id: 20,
      section: 3,
      sectionTitle: 'صمیمیت عاطفی',
      sectionTitleEn: 'Emotional Intimacy',
      text: 'قدردانی و محبت خود را به صورت کلامی و غیرکلامی به همسرم ابراز می‌کنم.',
      textEn: 'I express my appreciation and affection verbally and non-verbally.',
    },
    {
      id: 21,
      section: 3,
      sectionTitle: 'صمیمیت عاطفی',
      sectionTitleEn: 'Emotional Intimacy',
      text: 'در کنار همسرم، احساس امنیت، آرامش و مورد اعتماد بودن می‌کنم.',
      textEn: 'With my spouse, I feel safe, calm, and trusted.',
    },

    // Section 4: Sexual Intimacy (صمیمیت جنسی)
    {
      id: 22,
      section: 4,
      sectionTitle: 'صمیمیت جنسی',
      sectionTitleEn: 'Sexual Intimacy',
      text: 'از رابطه جنسی با همسرم لذت می‌برم و آن را رضایت‌بخش می‌دانم.',
      textEn: 'I enjoy my sexual relationship with my spouse and find it satisfying.',
    },
    {
      id: 23,
      section: 4,
      sectionTitle: 'صمیمیت جنسی',
      sectionTitleEn: 'Sexual Intimacy',
      text: 'می‌توانم آزادانه در مورد خواسته‌ها، ترجیحات و نیازهای جنسیام با همسرم صحبت کنم.',
      textEn: 'I can freely discuss my sexual desires, preferences, and needs with my spouse.',
    },
    {
      id: 24,
      section: 4,
      sectionTitle: 'صمیمیت جنسی',
      sectionTitleEn: 'Sexual Intimacy',
      text: 'برای برقراری رابطه جنسی و ایجاد فضای عاشقانه، ابتکار عمل به خرج می‌دهم.',
      textEn: 'I take initiative in establishing intimacy and creating a romantic atmosphere.',
    },
    {
      id: 25,
      section: 4,
      sectionTitle: 'صمیمیت جنسی',
      sectionTitleEn: 'Sexual Intimacy',
      text: 'به نیازها و علایق جنسی همسرم توجه دارم و برای ارضای آن تلاش می‌کنم.',
      textEn: 'I pay attention to my spouse\'s sexual needs and interests and try to satisfy them.',
    },
    {
      id: 26,
      section: 4,
      sectionTitle: 'صمیمیت جنسی',
      sectionTitleEn: 'Sexual Intimacy',
      text: 'در رابطه جنسی، احساس نزدیکی، امنیت و پیوند عاطفی عمیقی با همسرم دارم.',
      textEn: 'In sexual relations, I feel closeness, safety, and deep emotional connection.',
    },
    {
      id: 27,
      section: 4,
      sectionTitle: 'صمیمیت جنسی',
      sectionTitleEn: 'Sexual Intimacy',
      text: 'کیفیت رابطه جنسی برایمان از کمیت (تعداد دفعات) مهم‌تر است.',
      textEn: 'Quality of sexual relationship is more important to us than quantity.',
    },
    {
      id: 28,
      section: 4,
      sectionTitle: 'صمیمیت جنسی',
      sectionTitleEn: 'Sexual Intimacy',
      text: 'در صورت وجود مشکل در این حوزه، برای درک و حل آن با یکدیگر همکاری می‌کنیم.',
      textEn: 'If problems exist in this area, we work together to understand and resolve them.',
    },

    // Section 5: Love Languages (زبان عشق)
    {
      id: 29,
      section: 5,
      sectionTitle: 'زبان عشق',
      sectionTitleEn: 'Love Languages',
      text: 'می‌دانم که زبان عشق اصلی همسرم چیست (مثلاً کلام تاییدآمیز، وقت گذراندن، دریافت هدیه، خدمات یا تماس فیزیکی).',
      textEn: 'I know my spouse\'s primary love language (words, quality time, gifts, acts of service, or physical touch).',
    },
    {
      id: 30,
      section: 5,
      sectionTitle: 'زبان عشق',
      sectionTitleEn: 'Love Languages',
      text: 'به طور مرتب و فعالانه، عشق را به "زبان اصلی" همسرم ابراز می‌کنم.',
      textEn: 'I regularly and actively express love in my spouse\'s primary love language.',
    },
    {
      id: 31,
      section: 5,
      sectionTitle: 'زبان عشق',
      sectionTitleEn: 'Love Languages',
      text: 'هنگامی که همسرم عشق را به "زبان اصلی" من ابراز می‌کند، آن را به وضوح درک کرده و احساس عشق می‌کنم.',
      textEn: 'When my spouse expresses love in my primary language, I clearly understand and feel loved.',
    },
    {
      id: 32,
      section: 5,
      sectionTitle: 'زبان عشق',
      sectionTitleEn: 'Love Languages',
      text: 'سعی می‌کنم به شیوه‌های مختلف (فراتر از زبان اصلی خودم) محبتم را به همسرم نشان دهم.',
      textEn: 'I try to show affection in various ways beyond my own primary love language.',
    },
    {
      id: 33,
      section: 5,
      sectionTitle: 'زبان عشق',
      sectionTitleEn: 'Love Languages',
      text: 'از همسرم به خاطر ابراز محبتی که به روش خودش انجام می‌دهد، قدردانی می‌کنم.',
      textEn: 'I appreciate my spouse for expressing affection in their own way.',
    },
    {
      id: 34,
      section: 5,
      sectionTitle: 'زبان عشق',
      sectionTitleEn: 'Love Languages',
      text: 'احساس می‌کنم نیازهای عاطفی من توسط همسرم درک و برآورده می‌شود.',
      textEn: 'I feel my emotional needs are understood and met by my spouse.',
    },
    {
      id: 35,
      section: 5,
      sectionTitle: 'زبان عشق',
      sectionTitleEn: 'Love Languages',
      text: 'در رابطه ما، ابراز عشق به صورت روزمره و مستمر وجود دارد.',
      textEn: 'In our relationship, expressions of love occur daily and consistently.',
    },

    // Section 6: Financial Management (مدیریت مالی)
    {
      id: 36,
      section: 6,
      sectionTitle: 'مدیریت مالی',
      sectionTitleEn: 'Financial Management',
      text: 'در مورد مسائل مالی (درآمد، هزینه‌ها، پس‌انداز و بدهی) با همسرم به صورت شفاف و صادقانه گفتگو می‌کنیم.',
      textEn: 'We discuss financial matters (income, expenses, savings, debt) transparently and honestly.',
    },
    {
      id: 37,
      section: 6,
      sectionTitle: 'مدیریت مالی',
      sectionTitleEn: 'Financial Management',
      text: 'در تدوین و اجرای بودجه خانواده با یکدیگر همکاری داریم.',
      textEn: 'We cooperate in creating and executing the family budget.',
    },
    {
      id: 38,
      section: 6,
      sectionTitle: 'مدیریت مالی',
      sectionTitleEn: 'Financial Management',
      text: 'در مورد اهداف مالی بزرگ (مانند خرید خانه، پس‌انداز بازنشستگی) دیدگاه مشترکی داریم.',
      textEn: 'We have a shared perspective on major financial goals (home purchase, retirement savings).',
    },
    {
      id: 39,
      section: 6,
      sectionTitle: 'مدیریت مالی',
      sectionTitleEn: 'Financial Management',
      text: 'در مورد مخارج بزرگ، پیش از خرید با یکدیگر مشورت می‌کنیم.',
      textEn: 'We consult with each other before making large purchases.',
    },
    {
      id: 40,
      section: 6,
      sectionTitle: 'مدیریت مالی',
      sectionTitleEn: 'Financial Management',
      text: 'روش ما برای مدیریت پول (مشترک، جدا یا ترکیبی) برای هر دوی ما رضایت‌بخش است.',
      textEn: 'Our method of money management (joint, separate, or combined) is satisfactory for both.',
    },
    {
      id: 41,
      section: 6,
      sectionTitle: 'مدیریت مالی',
      sectionTitleEn: 'Financial Management',
      text: 'مسئولیت‌پذیری مالی هر یک از ما برای دیگری مشخص و قابل قبول است.',
      textEn: 'Financial responsibilities are clear and acceptable for both of us.',
    },
    {
      id: 42,
      section: 6,
      sectionTitle: 'مدیریت مالی',
      sectionTitleEn: 'Financial Management',
      text: 'اختلاف نظرهای مالی را بدون تبدیل شدن به مشاجره‌های جدی حل می‌کنیم.',
      textEn: 'We resolve financial disagreements without turning them into serious arguments.',
    },

    // Section 7: Division of Responsibilities (تقسیم وظایف)
    {
      id: 43,
      section: 7,
      sectionTitle: 'تقسیم وظایف',
      sectionTitleEn: 'Division of Responsibilities',
      text: 'تقسیم‌بندی کارهای خانه (نظافت، آشپزی، خرید و...) بین ما منصفانه است.',
      textEn: 'Division of household chores (cleaning, cooking, shopping) is fair between us.',
    },
    {
      id: 44,
      section: 7,
      sectionTitle: 'تقسیم وظایف',
      sectionTitleEn: 'Division of Responsibilities',
      text: 'در قبال مسئولیت‌های محوله، متعهد و قابل اعتماد هستم.',
      textEn: 'I am committed and reliable regarding assigned responsibilities.',
    },
    {
      id: 45,
      section: 7,
      sectionTitle: 'تقسیم وظایف',
      sectionTitleEn: 'Division of Responsibilities',
      text: 'در انجام کارهای خانه، بدون اینکه از من خواسته شود، انگیزه به خرج می‌دهم (پیشقدم می‌شوم).',
      textEn: 'I take initiative in household tasks without being asked.',
    },
    {
      id: 46,
      section: 7,
      sectionTitle: 'تقسیم وظایف',
      sectionTitleEn: 'Division of Responsibilities',
      text: 'در مورد مسئولیت‌های مربوط به تربیت و مراقبت از فرزندان (در صورت وجود) با هم همکاری و توافق داریم.',
      textEn: 'We cooperate and agree on child-rearing and care responsibilities (if applicable).',
    },
    {
      id: 47,
      section: 7,
      sectionTitle: 'تقسیم وظایف',
      sectionTitleEn: 'Division of Responsibilities',
      text: 'در صورت تغییر شرایط (مثلاً بیماری یا افزایش گرفتاری)، در تقسیم کارها انعطاف داریم.',
      textEn: 'We are flexible in task division when circumstances change (illness, increased workload).',
    },
    {
      id: 48,
      section: 7,
      sectionTitle: 'تقسیم وظایف',
      sectionTitleEn: 'Division of Responsibilities',
      text: 'از نحوه انجام وظایف توسط همسرم قدردانی می‌کنم و آن را بیان می‌کنم.',
      textEn: 'I appreciate and express gratitude for how my spouse fulfills their duties.',
    },
    {
      id: 49,
      section: 7,
      sectionTitle: 'تقسیم وظایف',
      sectionTitleEn: 'Division of Responsibilities',
      text: 'به طور کلی، از توازن و تعادل در مسئولیت‌های زندگی راضی هستم.',
      textEn: 'Overall, I am satisfied with the balance in life responsibilities.',
    },

    // Section 8: Trust and Loyalty (اعتماد و وفاداری)
    {
      id: 50,
      section: 8,
      sectionTitle: 'اعتماد و وفاداری',
      sectionTitleEn: 'Trust and Loyalty',
      text: 'به همسرم اطمینان کامل دارم که به قول‌ها و تعهداتش عمل می‌کند.',
      textEn: 'I have complete confidence that my spouse keeps their promises and commitments.',
    },
    {
      id: 51,
      section: 8,
      sectionTitle: 'اعتماد و وفاداری',
      sectionTitleEn: 'Trust and Loyalty',
      text: 'معتقدم همسرم در غیاب من نیز به گونه‌ای رفتار می‌کند که به رابطه ما احترام بگذارد.',
      textEn: 'I believe my spouse behaves respectfully toward our relationship even in my absence.',
    },
    {
      id: 52,
      section: 8,
      sectionTitle: 'اعتماد و وفاداری',
      sectionTitleEn: 'Trust and Loyalty',
      text: 'احساس می‌کنم می‌توانم در هر شرایطی روی حمایت و پشتیبانی همسرم حساب کنم.',
      textEn: 'I feel I can count on my spouse\'s support in any situation.',
    },
    {
      id: 53,
      section: 8,
      sectionTitle: 'اعتماد و وفاداری',
      sectionTitleEn: 'Trust and Loyalty',
      text: 'اگر مرتکب اشتباهی شوم، باور دارم که همسرم با من منصفانه و خیرخواهانه برخورد خواهد کرد.',
      textEn: 'If I make a mistake, I believe my spouse will treat me fairly and compassionately.',
    },
    {
      id: 54,
      section: 8,
      sectionTitle: 'اعتماد و وفاداری',
      sectionTitleEn: 'Trust and Loyalty',
      text: 'رازدار هستم و اسرار و نقاط ضعف همسرم را پیش دیگران فاش نمی‌کنم.',
      textEn: 'I keep secrets and do not reveal my spouse\'s vulnerabilities to others.',
    },
    {
      id: 55,
      section: 8,
      sectionTitle: 'اعتماد و وفاداری',
      sectionTitleEn: 'Trust and Loyalty',
      text: 'در رابطه ما حسادت‌های بیمارگونه و بی‌مورد وجود ندارد.',
      textEn: 'Unhealthy and unfounded jealousy does not exist in our relationship.',
    },
    {
      id: 56,
      section: 8,
      sectionTitle: 'اعتماد و وفاداری',
      sectionTitleEn: 'Trust and Loyalty',
      text: 'احساس می‌کنم رابطه ما بر پایه‌ای صداقت و درستکاری کاملاً استوار است.',
      textEn: 'I feel our relationship is firmly based on honesty and integrity.',
    },

    // Section 9: Shared Goals (اهداف مشترک)
    {
      id: 57,
      section: 9,
      sectionTitle: 'اهداف مشترک',
      sectionTitleEn: 'Shared Goals',
      text: 'برای آینده رابطه و خانواده خود، اهداف و آرزوهای مشترک مشخصی داریم.',
      textEn: 'We have specific shared goals and dreams for our relationship and family\'s future.',
    },
    {
      id: 58,
      section: 9,
      sectionTitle: 'اهداف مشترک',
      sectionTitleEn: 'Shared Goals',
      text: 'به عنوان یک "تیم"، برای دستیابی به اهدافمان با یکدیگر همکاری می‌کنیم.',
      textEn: 'As a team, we cooperate to achieve our goals.',
    },
    {
      id: 59,
      section: 9,
      sectionTitle: 'اهداف مشترک',
      sectionTitleEn: 'Shared Goals',
      text: 'ارزش‌های اصلی و باورهای اساسی ما در زندگی با هم همسو و سازگار است.',
      textEn: 'Our core values and fundamental beliefs are aligned and compatible.',
    },
    {
      id: 60,
      section: 9,
      sectionTitle: 'اهداف مشترک',
      sectionTitleEn: 'Shared Goals',
      text: 'در مورد سبک زندگی مطلوبمان (مثلاً ساده، ماجراجویانه، سنتی و...) دیدگاه مشترکی داریم.',
      textEn: 'We have a shared perspective on our preferred lifestyle (simple, adventurous, traditional, etc.).',
    },
    {
      id: 61,
      section: 9,
      sectionTitle: 'اهداف مشترک',
      sectionTitleEn: 'Shared Goals',
      text: 'برای برنامه‌ریزی و سرمایه‌گذاری روی اهداف مشترکمان (مانند سفر، تحصیل، خرید) تلاش می‌کنیم.',
      textEn: 'We work to plan and invest in our shared goals (travel, education, purchases).',
    },
    {
      id: 62,
      section: 9,
      sectionTitle: 'اهداف مشترک',
      sectionTitleEn: 'Shared Goals',
      text: 'در مواجهه با موانع پیش روی اهدافمان، یکدیگر را دلسرد نمی‌کنیم بلکه تشویق و حمایت می‌کنیم.',
      textEn: 'When facing obstacles to our goals, we encourage and support rather than discourage each other.',
    },
    {
      id: 63,
      section: 9,
      sectionTitle: 'اهداف مشترک',
      sectionTitleEn: 'Shared Goals',
      text: 'احساس می‌کنیم در مسیر زندگی به سمت یک جهت مشترک در حرکت هستیم.',
      textEn: 'We feel we are moving in life toward a shared direction.',
    },
  ],
}

async function seedRahnamaTest() {
  try {
    logger.info('Starting Rahnama test data seeding...')

    // Check if test already exists
    const existing = await db`
      SELECT id FROM assessments WHERE title = ${rahnamaTest.title}
    `

    if (existing.length > 0) {
      logger.warn('Rahnama test already exists, skipping...')
      return
    }

    // Insert the Rahnama test
    const [test] = await db`
      INSERT INTO assessments (title, description, questions)
      VALUES (${rahnamaTest.title}, ${rahnamaTest.description}, ${JSON.stringify(rahnamaTest.questions)})
      RETURNING *
    `

    logger.success(`Rahnama test created with ID: ${test.id}`)
    logger.info(`Title: ${rahnamaTest.title}`)
    logger.info(`Questions: ${rahnamaTest.questions.length}`)
    logger.info(`Sections: 9`)
    logger.info(`Tagline: ${rahnamaTest.tagline}`)
    
  } catch (error) {
    logger.error('Error seeding Rahnama test data:', error)
    throw error
  } finally {
    await db.end()
  }
}

// Run the seed function
seedRahnamaTest()
  .then(() => {
    logger.success('Rahnama test data seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    logger.error('Rahnama test data seeding failed:', error)
    process.exit(1)
  })
