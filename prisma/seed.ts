import 'dotenv/config';
import { AdminRole, CouponType, PrismaClient, StockStatus, ProductStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Categories ──────────────────────────────────────────────────────────────
  const categoriesData = [
    { name: 'Healing Crystals', slug: 'healing-crystals', description: 'Natural crystals traditionally associated with healing and positive energy', priority: 10 },
    { name: 'Crystal Bracelets', slug: 'crystal-bracelets', description: 'Handcrafted bracelets with natural stones, believed to support energetic balance', priority: 9 },
    { name: 'Pyramids', slug: 'pyramids', description: 'Crystal pyramids commonly used for positive energy and space cleansing', priority: 8 },
    { name: 'Money Attraction', slug: 'money-attraction', description: 'Stones and crystals traditionally associated with abundance and prosperity', priority: 9 },
    { name: 'Love & Relationship', slug: 'love-relationship', description: 'Crystals often chosen for love, harmony, and emotional balance', priority: 8 },
    { name: 'Protection', slug: 'protection', description: 'Stones traditionally associated with protective energy and grounding', priority: 8 },
    { name: 'Positive Energy', slug: 'positive-energy', description: 'Products believed to support positive energy and uplifting vibrations', priority: 7 },
    { name: 'Negative Energy Removal', slug: 'negative-energy-removal', description: 'Crystals and tools traditionally used for cleansing and removing stagnant energy', priority: 7 },
    { name: 'Candles', slug: 'candles', description: 'Intention candles commonly used in rituals for focus and ambiance', priority: 6 },
    { name: 'Energy Cleansing', slug: 'energy-cleansing', description: 'Tools traditionally used for cleansing spaces and auras', priority: 7 },
  ];

  const categories: Record<string, { id: string }> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { ...cat },
      create: { ...cat, isActive: true },
      select: { id: true },
    });
  }
  console.log(`✅ ${categoriesData.length} categories seeded`);

  // ─── Collections ─────────────────────────────────────────────────────────────
  const collectionsData = [
    { name: 'Best Sellers', slug: 'best-sellers', description: 'Our most loved products, chosen by thousands of customers', priority: 10 },
    { name: 'New Arrivals', slug: 'new-arrivals', description: 'Freshly added crystals and spiritual products', priority: 9 },
    { name: 'Money Attraction Picks', slug: 'money-attraction-picks', description: 'Curated collection traditionally associated with abundance and prosperity', priority: 8 },
    { name: 'Love & Relationship Picks', slug: 'love-relationship-picks', description: 'Crystals often chosen for love, harmony, and emotional healing', priority: 8 },
    { name: 'Protection Essentials', slug: 'protection-essentials', description: 'Stones traditionally used for protective energy and grounding', priority: 8 },
    { name: 'Positive Energy Products', slug: 'positive-energy-products', description: 'Products believed to support positive vibrations and uplifting energy', priority: 7 },
    { name: 'Negative Energy Removal Products', slug: 'negative-energy-removal-products', description: 'Tools traditionally used to cleanse and remove stagnant energy', priority: 7 },
  ];

  const collections: Record<string, { id: string }> = {};
  for (const col of collectionsData) {
    collections[col.slug] = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: { ...col },
      create: { ...col, isActive: true },
      select: { id: true },
    });
  }
  console.log(`✅ ${collectionsData.length} collections seeded`);

  // ─── Guides (AEO content hub) ───────────────────────────────────────────────
  const guidesData = [
    {
      title: 'A Beginner\'s Guide to Chakra Healing Crystals',
      slug: 'beginners-guide-to-chakra-healing-crystals',
      excerpt: 'An introduction to the seven chakras and the crystals traditionally associated with each one.',
      tags: ['chakra', 'beginner', 'healing-crystals'],
      coverImageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200',
      bodyHtml: `<p>The chakra system originates from ancient Indian Vedic traditions and describes seven main energy centers in the body, from the base of the spine to the crown of the head. Many people traditionally pair specific crystals with each chakra as part of a mindful practice.</p>
<h2>The seven chakras and their traditional crystal associations</h2>
<ul>
<li><strong>Root Chakra</strong> — traditionally associated with black tourmaline and red jasper, believed to support grounding and stability.</li>
<li><strong>Sacral Chakra</strong> — commonly paired with carnelian, believed to support creativity and vitality.</li>
<li><strong>Solar Plexus Chakra</strong> — traditionally associated with citrine and pyrite, believed to support confidence and personal power.</li>
<li><strong>Heart Chakra</strong> — commonly paired with rose quartz and green aventurine, believed to support love and compassion.</li>
<li><strong>Throat Chakra</strong> — traditionally associated with sodalite, believed to support clear communication.</li>
<li><strong>Third Eye Chakra</strong> — commonly paired with amethyst, believed to support intuition and clarity.</li>
<li><strong>Crown Chakra</strong> — traditionally associated with clear quartz and selenite, believed to support spiritual connection.</li>
</ul>
<p>A simple starting practice is to hold or place a crystal near the corresponding chakra during quiet reflection or meditation, setting an intention for what that energy center represents to you.</p>`,
    },
    {
      title: 'Crystals Traditionally Associated with Anxiety and Calm',
      slug: 'crystals-for-anxiety-and-calm',
      excerpt: 'Which crystals are traditionally chosen for calm, and how people commonly use them in daily routines.',
      tags: ['anxiety', 'calm', 'amethyst', 'rose-quartz'],
      coverImageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=1200',
      bodyHtml: `<p>When looking for support during stressful moments, many people turn to crystals that are traditionally associated with calming energy. This guide is not medical advice — it reflects long-standing crystal traditions and common personal practices.</p>
<h2>Popular choices</h2>
<ul>
<li><strong>Amethyst</strong> — traditionally associated with calm and mental clarity; often kept on a nightstand or held during meditation.</li>
<li><strong>Rose Quartz</strong> — commonly chosen for gentle, comforting energy and self-compassion.</li>
<li><strong>Selenite</strong> — traditionally used to clear stagnant energy from a space, believed to support a sense of peace.</li>
</ul>
<h2>A simple grounding practice</h2>
<p>Hold your chosen crystal in both hands, take a few slow breaths, and set an intention for calm. Many people repeat this as part of a short daily ritual.</p>
<p>If you are experiencing ongoing anxiety, please speak with a qualified healthcare professional — crystals are a complementary practice, not a substitute for medical care.</p>`,
    },
    {
      title: 'How to Cleanse and Care for Your Crystals',
      slug: 'how-to-cleanse-and-care-for-crystals',
      excerpt: 'Traditional methods for cleansing crystals, and care tips to keep them looking their best.',
      tags: ['care', 'cleansing', 'selenite'],
      coverImageUrl: 'https://images.unsplash.com/photo-1593108408993-e8a9cae8d145?w=1200',
      bodyHtml: `<p>Crystals are traditionally cleansed from time to time to clear any energy they may have absorbed. Here are common methods, along with care notes for specific stones.</p>
<h2>Traditional cleansing methods</h2>
<ul>
<li><strong>Moonlight</strong> — placing crystals under moonlight overnight, especially during a full moon, is a widely used tradition.</li>
<li><strong>Sound</strong> — singing bowls or bells are commonly used to cleanse crystals with vibration.</li>
<li><strong>Smoke</strong> — passing a crystal through sage or palo santo smoke is a traditional cleansing method in many practices.</li>
</ul>
<h2>Care by stone type</h2>
<p>Selenite and pyrite should never be rinsed with water. Most tumbled and polished stones can be wiped with a soft, dry cloth. Always avoid harsh chemicals and prolonged direct sunlight, which can fade color over time.</p>`,
    },
    {
      title: 'Building a Crystal Bracelet Stack: A Simple Guide',
      slug: 'building-a-crystal-bracelet-stack',
      excerpt: 'How people traditionally combine multiple crystal bracelets, and what to consider when starting a stack.',
      tags: ['bracelets', 'chakra', 'beginner'],
      coverImageUrl: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=1200',
      bodyHtml: `<p>Stacking multiple crystal bracelets is a popular way to combine different intentions in one everyday accessory.</p>
<h2>Getting started</h2>
<p>Many people begin with a single intention — such as love, protection, or abundance — and choose a bracelet traditionally associated with that theme. From there, additional bracelets can be layered based on personal preference and the energy each stone is traditionally believed to support.</p>
<h2>Popular combinations</h2>
<ul>
<li>Rose quartz + green aventurine — often chosen together for love and prosperity.</li>
<li>Black tourmaline + seven chakra bracelet — commonly paired for grounding alongside overall balance.</li>
<li>Citrine + pyrite — a popular combination traditionally associated with abundance and confidence.</li>
</ul>
<p>There's no fixed rule for stacking — the most meaningful combination is one that resonates with your own intentions.</p>`,
    },
  ];

  for (const guide of guidesData) {
    const { slug, ...guideFields } = guide;
    await prisma.guide.upsert({
      where: { slug },
      update: { ...guideFields, status: ProductStatus.PUBLISHED, publishedAt: new Date() },
      create: { ...guideFields, slug, status: ProductStatus.PUBLISHED, publishedAt: new Date() },
    });
  }
  console.log(`✅ ${guidesData.length} guides seeded`);

  // ─── Global FAQs ─────────────────────────────────────────────────────────────
  const existingGlobalFaqCount = await prisma.faq.count({
    where: { entityType: 'GLOBAL' },
  });
  if (existingGlobalFaqCount === 0) {
    const globalFaqsData = [
      { question: 'How long does shipping take?', answer: 'Orders are typically processed within 1-2 business days and delivered within 5-7 business days, depending on your location.' },
      { question: 'What is your return policy?', answer: 'We accept returns within 7 days of delivery for unused items in original packaging. Please see our Cancellation & Refund Policy for full details.' },
      { question: 'How do I track my order?', answer: 'Once your order ships, you will receive a tracking link by email. You can also check order status by contacting our support team.' },
      { question: 'Are your crystals natural and authentic?', answer: 'Yes, all our crystals and stones are natural, ethically sourced, and traditionally associated with the properties listed on each product page.' },
      { question: 'Do crystals have medical or healing effects?', answer: 'Our products are traditionally associated with certain energies and are intended for mindful, intentional use. They are not a substitute for medical treatment or professional advice.' },
      { question: 'How should I cleanse my new crystal?', answer: 'Common traditional methods include moonlight, sound (such as a singing bowl), or smoke cleansing. See our guide on cleansing and caring for crystals for more detail.' },
      { question: 'Can I customize a bracelet?', answer: 'Yes, visit our Custom Bracelet page to build a bracelet with the stones and intentions you choose.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit/debit cards and other payment methods shown at checkout.' },
      { question: 'Do you offer international shipping?', answer: 'Currently we ship within the regions listed at checkout. Contact our support team if you have a specific destination in mind.' },
      { question: 'How do I contact customer support?', answer: 'You can reach us anytime through our Contact Us page or by emailing enchantedenergystore@gmail.com.' },
    ];
    await prisma.faq.createMany({
      data: globalFaqsData.map((faq, index) => ({
        entityType: 'GLOBAL' as const,
        question: faq.question,
        answer: faq.answer,
        sortOrder: index,
      })),
    });
    console.log(`✅ ${globalFaqsData.length} global FAQs seeded`);
  } else {
    console.log('ℹ️ Global FAQs already exist, skipping');
  }

  // ─── More guides, matched to the real catalog's top categories ─────────────
  const catalogGuidesData = [
    {
      title: 'How to Use a Dowsing Pendulum: A Beginner\'s Guide',
      slug: 'how-to-use-a-dowsing-pendulum',
      excerpt: 'What a dowsing pendulum is, how people traditionally use one, and how to get started.',
      tags: ['pendulum-dowsing', 'beginner'],
      coverImageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200',
      bodyHtml: `<p>A dowsing pendulum is traditionally used as a simple tool for reflection and intuition practice. It is typically a small weighted crystal suspended from a chain, held still between the fingers.</p>
<h2>Getting started</h2>
<ol>
<li>Hold the chain loosely between your thumb and forefinger, letting the pendulum hang freely.</li>
<li>Rest your elbow on a table for stability, especially as a beginner.</li>
<li>Take a few calming breaths and clear your mind before beginning.</li>
</ol>
<h2>Establishing your "yes" and "no"</h2>
<p>Many people start by asking the pendulum to show them their "yes" response (often a back-and-forth or clockwise swing) and their "no" response (often side-to-side or counter-clockwise). This varies from person to person and is traditionally established through practice.</p>
<h2>Choosing a pendulum stone</h2>
<p>Different crystals are traditionally chosen for different pendulum practices — for example, amethyst for clarity or clear quartz for general-purpose use. Choose one that feels right for your own practice.</p>
<p>This is a reflective and traditional practice, not a scientifically validated method — approach it as a mindful, personal tool rather than a substitute for professional advice.</p>`,
    },
    {
      title: 'Numerology Bracelets Explained: Finding Your Number',
      slug: 'numerology-bracelets-explained',
      excerpt: 'How numerology bracelets are traditionally put together, and how people find their personal number.',
      tags: ['numerology-bracelet', 'beginner'],
      coverImageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200',
      bodyHtml: `<p>Numerology bracelets combine natural stones with the ancient practice of numerology, which traditionally assigns meaning to numbers derived from a person's birth date or name.</p>
<h2>Finding your life path number</h2>
<p>A common traditional method is to add together the digits of your full birth date until you reach a single digit (or a recognized master number like 11, 22, or 33). For example, a birth date of 15 June 1994 traditionally reduces as 1+5+0+6+1+9+9+4 = 35, then 3+5 = 8.</p>
<h2>Choosing stones for your number</h2>
<p>Each number is traditionally associated with certain qualities and stones — for instance, number 8 is often linked to abundance and confidence, commonly paired with citrine or pyrite. A numerology bracelet is typically curated with stones matching your calculated number.</p>
<h2>Wearing your bracelet</h2>
<p>Many people wear their numerology bracelet daily as a personal reminder of the qualities their number traditionally represents, re-cleansing it periodically as with any crystal jewelry.</p>`,
    },
    {
      title: 'Chakra Activation Bracelets: What They Are and How to Wear Them',
      slug: 'chakra-activation-bracelets-guide',
      excerpt: 'How chakra activation bracelets differ from general chakra bracelets, and how they are traditionally worn.',
      tags: ['chakra-activation-bracelet', 'chakra'],
      coverImageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200',
      bodyHtml: `<p>Chakra activation bracelets are typically designed around a single chakra, using one or two stones traditionally associated with that specific energy center, rather than all seven at once.</p>
<h2>How they differ from a seven-chakra bracelet</h2>
<p>A seven-chakra bracelet is traditionally worn for overall balance across all energy centers. A chakra activation bracelet instead focuses on one chakra — such as the Root or Heart — for a more targeted practice.</p>
<h2>Choosing the right chakra to focus on</h2>
<ul>
<li>Feeling ungrounded or scattered — traditionally paired with Root Chakra stones like black tourmaline or red jasper.</li>
<li>Seeking confidence or motivation — traditionally paired with Solar Plexus stones like citrine or tiger's eye.</li>
<li>Working on love or self-compassion — traditionally paired with Heart Chakra stones like rose quartz or green aventurine.</li>
</ul>
<h2>How to wear it</h2>
<p>Many people wear a chakra activation bracelet for a period of days or weeks while setting an intention connected to that chakra, then switch to a different one as their focus shifts.</p>`,
    },
    {
      title: 'How to Choose Your First Crystal Bracelet',
      slug: 'how-to-choose-your-first-crystal-bracelet',
      excerpt: 'A simple framework for picking a first crystal bracelet based on the intention you want to focus on.',
      tags: ['bracelet', 'crystal-bracelets', 'beginner'],
      coverImageUrl: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=1200',
      bodyHtml: `<p>With so many natural stones to choose from, picking a first crystal bracelet can feel overwhelming. A simple traditional approach is to start with an intention rather than a stone.</p>
<h2>Start with an intention</h2>
<ul>
<li><strong>Calm and clarity</strong> — traditionally associated with amethyst or howlite.</li>
<li><strong>Love and self-compassion</strong> — traditionally associated with rose quartz.</li>
<li><strong>Protection and grounding</strong> — traditionally associated with black tourmaline or black obsidian.</li>
<li><strong>Abundance and confidence</strong> — traditionally associated with citrine, pyrite, or tiger's eye.</li>
</ul>
<h2>Consider bead size and fit</h2>
<p>Most bracelets are made with stretch cord and stone beads around 8mm, fitting most wrists comfortably. If between sizes, sizing slightly larger is generally more comfortable for everyday wear.</p>
<h2>Caring for your new bracelet</h2>
<p>Remove before swimming, showering, or exercising heavily to protect the stones and cord. See our guide on cleansing and caring for crystals for more detail.</p>`,
    },
    {
      title: 'Crystals Traditionally Associated with Money and Abundance',
      slug: 'crystals-for-money-and-abundance',
      excerpt: 'The crystals most commonly chosen for abundance and prosperity, and how people traditionally use them.',
      tags: ['money-attraction'],
      coverImageUrl: 'https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae?w=1200',
      bodyHtml: `<p>Certain crystals have long been traditionally associated with prosperity and abundance, often kept in workspaces, wallets, or business spaces.</p>
<h2>Popular choices</h2>
<ul>
<li><strong>Citrine</strong> — known as the "Merchant's Stone," traditionally associated with abundance and confidence.</li>
<li><strong>Pyrite</strong> — traditionally associated with wealth energy and motivation.</li>
<li><strong>Green Aventurine</strong> — known as the "Stone of Opportunity," traditionally associated with luck and prosperity.</li>
</ul>
<h2>Traditional placement</h2>
<p>Many people place these stones in the wealth corner of a room (the southeast, per Feng Shui traditions), on a work desk, or carry a small piece in a wallet or bag.</p>
<p>These practices reflect long-standing crystal traditions and personal ritual — they are not a guarantee of financial outcomes.</p>`,
    },
    {
      title: 'Crystals Traditionally Associated with Protection and Grounding',
      slug: 'crystals-for-protection-and-grounding',
      excerpt: 'Which crystals are traditionally chosen for protection, and simple ways people incorporate them into daily life.',
      tags: ['protection'],
      coverImageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1200',
      bodyHtml: `<p>Protective crystals have been used across many traditions as a way to feel grounded and energetically shielded.</p>
<h2>Popular choices</h2>
<ul>
<li><strong>Black Tourmaline</strong> — one of the most widely used protective stones, traditionally associated with grounding and shielding.</li>
<li><strong>Black Obsidian</strong> — traditionally associated with clearing negativity and grounding scattered energy.</li>
<li><strong>Hematite</strong> — commonly chosen for grounding and a sense of stability.</li>
</ul>
<h2>Simple ways to use them</h2>
<p>Many people keep a protective stone near an entryway, beside electronics, or carried in a pocket. Wearing one as a bracelet is also a popular, low-effort way to keep the stone's traditional association close throughout the day.</p>`,
    },
  ];

  for (const guide of catalogGuidesData) {
    const { slug, ...guideFields } = guide;
    await prisma.guide.upsert({
      where: { slug },
      update: { ...guideFields, status: ProductStatus.PUBLISHED, publishedAt: new Date() },
      create: { ...guideFields, slug, status: ProductStatus.PUBLISHED, publishedAt: new Date() },
    });
  }
  console.log(`✅ ${catalogGuidesData.length} catalog-matched guides seeded`);

  // ─── Category FAQs for the real catalog's top categories ───────────────────
  const categoryFaqsData: Record<string, Array<{ question: string; answer: string }>> = {
    'bracelet': [
      { question: 'What size are your bracelets?', answer: 'Most bracelets use stretch cord with 8mm beads, fitting most adult wrists comfortably. If you are between sizes, we recommend sizing slightly larger.' },
      { question: 'Can I wear more than one bracelet at a time?', answer: 'Yes, many people stack multiple bracelets to combine different intentions. See our guide on building a crystal bracelet stack for ideas.' },
      { question: 'Should I remove my bracelet before showering or exercising?', answer: 'Yes, we recommend removing stone bracelets before swimming, showering, or heavy exercise to protect the stones and stretch cord.' },
    ],
    'pendulum-dowsing': [
      { question: 'How do I use a dowsing pendulum?', answer: 'Hold the chain loosely, let the pendulum hang still, and observe its natural swing. See our beginner\'s guide to dowsing pendulums for a full walkthrough.' },
      { question: 'Does the type of crystal matter for a pendulum?', answer: 'Different crystals are traditionally associated with different qualities — for example, amethyst for clarity or clear quartz for general use. Choose one that resonates with your practice.' },
      { question: 'Can beginners use a dowsing pendulum?', answer: 'Yes, dowsing pendulums are traditionally used as a simple, beginner-friendly reflection tool with no special training required.' },
    ],
    'numerology-bracelet': [
      { question: 'How do I find my numerology number?', answer: 'A common method is adding the digits of your full birth date together until you reach a single digit. See our numerology bracelets guide for a worked example.' },
      { question: 'Are numerology bracelets customized to my number?', answer: 'Yes, each numerology bracelet is curated with stones traditionally associated with a specific number.' },
      { question: 'Can I wear a numerology bracelet with other bracelets?', answer: 'Yes, numerology bracelets can be stacked with other crystal bracelets based on your personal preference.' },
    ],
    'chakra-activation-bracelet': [
      { question: 'How is a chakra activation bracelet different from a 7 chakra bracelet?', answer: 'A chakra activation bracelet focuses on one specific chakra, while a 7 chakra bracelet is traditionally worn for overall balance across all seven energy centers.' },
      { question: 'How do I choose which chakra to focus on?', answer: 'Many people choose based on what they want to focus on — for example, grounding (Root), confidence (Solar Plexus), or love (Heart). See our chakra activation bracelets guide for more detail.' },
      { question: 'How long should I wear a chakra activation bracelet?', answer: 'There is no fixed rule — many people wear one for days or weeks while holding an intention, then switch focus as needed.' },
    ],
    'money-attraction': [
      { question: 'Which crystals are best for money and abundance?', answer: 'Citrine, pyrite, and green aventurine are among the most traditionally associated with prosperity and abundance. See our full guide for more detail.' },
      { question: 'Where should I place money attraction crystals?', answer: 'Many people place them in the wealth corner of a room (southeast, per Feng Shui traditions), on a work desk, or carry a small piece in a wallet.' },
      { question: 'Do I need to cleanse money attraction crystals regularly?', answer: 'Yes, like most crystals, periodic cleansing (moonlight, sound, or smoke) is traditionally recommended to keep their energy clear.' },
    ],
  };

  for (const [categorySlug, faqs] of Object.entries(categoryFaqsData)) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (!category) {
      console.warn(`⚠️ Category not found for FAQs: ${categorySlug}`);
      continue;
    }
    const existingCount = await prisma.faq.count({
      where: { entityType: 'CATEGORY', entityId: category.id },
    });
    if (existingCount > 0) continue;
    await prisma.faq.createMany({
      data: faqs.map((faq, index) => ({
        entityType: 'CATEGORY' as const,
        entityId: category.id,
        question: faq.question,
        answer: faq.answer,
        sortOrder: index,
      })),
    });
  }
  console.log(`✅ Category FAQs seeded for ${Object.keys(categoryFaqsData).length} categories`);

  // ─── Products ─────────────────────────────────────────────────────────────────
  type ProductSeed = {
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    longDescription: string;
    storySummary: string;
    spiritualBenefitSummary: string;
    usageGuide: string;
    careInstructions: string;
    price: number;
    mrp: number;
    discountPercent: number;
    categorySlug: string;
    stockStatus: StockStatus;
    inventoryQuantity: number;
    priority: number;
    attributes: Record<string, unknown>;
    collectionSlugs: string[];
    images: { imageUrl: string; altText: string; title: string; isPrimary: boolean; sortOrder: number }[];
    seo: {
      seoTitle: string; seoDescription: string; seoKeywords: string; canonicalUrl: string;
      ogTitle: string; ogDescription: string; twitterTitle: string; twitterDescription: string;
    };
  };

  const productsData: ProductSeed[] = [
    // NOTE: the original seed "Rose Quartz Bracelet" (sku BRAC-RQ-001) was
    // renamed to slug `rose-quartz-bracelet-legacy` via the admin panel and
    // superseded by a real "Rose Quartz Bracelet" product (sku BR-ROSE-QUARTZ)
    // as the catalog grew — re-adding it here would collide with that SKU.
    // It's intentionally left out; that product line is now admin-managed.
    {
      name: 'Amethyst Healing Crystal',
      slug: 'amethyst-healing-crystal',
      sku: 'CRYS-AM-001',
      shortDescription: 'A natural amethyst point traditionally associated with calm, clarity, and spiritual awareness.',
      longDescription: 'This premium Amethyst Healing Crystal is a natural rough-cut amethyst point. Amethyst is traditionally associated with calming energy, clarity of mind, and spiritual awareness. Its deep purple hues are believed to resonate with the Crown and Third Eye Chakras.',
      storySummary: 'Amethyst has a rich history spanning ancient Greece, Rome, and Egypt. The word "amethyst" originates from the Greek "amethystos," meaning "not intoxicated."',
      spiritualBenefitSummary: 'Traditionally associated with the Crown and Third Eye Chakras, amethyst is believed to support meditation, mental clarity, intuition, and protection from negative energy.',
      usageGuide: 'Place on your bedside table or meditation space. Hold during meditation focusing on your breath. Place under the pillow to support restful sleep.',
      careInstructions: 'Rinse gently with water occasionally. Avoid prolonged direct sunlight as it may fade the color. Cleanse with moonlight, sage smoke, or sound.',
      price: 499,
      mrp: 699,
      discountPercent: 29,
      categorySlug: 'healing-crystals',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 60,
      priority: 14,
      attributes: { stoneType: 'Amethyst', chakra: ['Crown Chakra', 'Third Eye Chakra'], zodiac: ['Pisces', 'Aquarius'], intention: ['Calm', 'Clarity', 'Spiritual Awareness'], energyType: 'Calming & Protective', color: 'Purple', material: 'Natural Crystal', origin: 'Brazil' },
      collectionSlugs: ['best-sellers', 'positive-energy-products'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800', altText: 'Amethyst Healing Crystal point', title: 'Amethyst Healing Crystal', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Amethyst Healing Crystal | Traditionally Associated with Calm & Clarity', seoDescription: 'Natural amethyst crystal point traditionally associated with calm, clarity, and spiritual awareness.', seoKeywords: 'amethyst crystal, healing crystal, crown chakra crystal', canonicalUrl: 'http://localhost:3000/products/amethyst-healing-crystal', ogTitle: 'Amethyst Healing Crystal — Traditionally Associated with Calm', ogDescription: 'Premium natural amethyst point traditionally chosen for calm and clarity.', twitterTitle: 'Amethyst Healing Crystal', twitterDescription: 'Natural amethyst crystal traditionally associated with calm and spiritual awareness.' },
    },
    {
      name: 'Citrine Money Attraction Stone',
      slug: 'citrine-money-attraction-stone',
      sku: 'CRYS-CI-001',
      shortDescription: 'Natural citrine tumbled stone traditionally associated with abundance, prosperity, and positive energy.',
      longDescription: 'The Citrine Money Attraction Stone is a beautifully polished natural citrine tumble, known as the "Merchant\'s Stone." Citrine is traditionally associated with abundance, prosperity, and positive manifestation energy. Its warm golden-yellow color resonates with the Solar Plexus Chakra.',
      storySummary: 'Citrine has been called the "Merchant\'s Stone" for centuries and was historically placed in cash registers and business spaces as a symbol of good fortune.',
      spiritualBenefitSummary: 'Traditionally associated with the Solar Plexus Chakra, citrine is believed to support abundance, self-confidence, creativity, and positive energy.',
      usageGuide: 'Place in your home office, workspace, or wallet. Hold during visualization practices. Place in the wealth corner (southeast) of your space per Feng Shui traditions.',
      careInstructions: 'Clean with a soft dry cloth. Avoid prolonged direct sunlight. Cleanse with sound or moonlight.',
      price: 299,
      mrp: 449,
      discountPercent: 33,
      categorySlug: 'money-attraction',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 100,
      priority: 16,
      attributes: { stoneType: 'Citrine', chakra: 'Solar Plexus Chakra', zodiac: ['Aries', 'Gemini', 'Leo'], intention: ['Abundance', 'Prosperity', 'Confidence'], energyType: 'Energizing & Uplifting', color: 'Golden Yellow', material: 'Natural Crystal', origin: 'Brazil', form: 'Tumbled Stone' },
      collectionSlugs: ['best-sellers', 'money-attraction-picks', 'positive-energy-products'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae?w=800', altText: 'Citrine money attraction tumbled stone', title: 'Citrine Money Attraction Stone', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Citrine Money Attraction Stone | Traditionally Associated with Abundance', seoDescription: 'Natural citrine tumbled stone traditionally associated with abundance and prosperity. The Merchant\'s Stone.', seoKeywords: 'citrine stone, money attraction crystal, abundance crystal, merchant stone', canonicalUrl: 'http://localhost:3000/products/citrine-money-attraction-stone', ogTitle: 'Citrine Money Attraction Stone — Traditionally Associated with Abundance', ogDescription: 'Natural citrine known as the Merchant\'s Stone, traditionally associated with prosperity.', twitterTitle: 'Citrine Money Attraction Stone', twitterDescription: 'Natural citrine traditionally associated with abundance and prosperity.' },
    },
    {
      name: 'Black Tourmaline Protection Stone',
      slug: 'black-tourmaline-protection-stone',
      sku: 'CRYS-BT-001',
      shortDescription: 'Natural black tourmaline raw crystal traditionally associated with protection and grounding energy.',
      longDescription: 'The Black Tourmaline Protection Stone is a natural raw piece of black tourmaline, one of the most widely used protective crystals. Black tourmaline is traditionally associated with creating an energetic shield and grounding scattered energy. Its deep black color is believed to resonate with the Root Chakra.',
      storySummary: 'Black tourmaline has been used as a protective talisman by various cultures for centuries. Ancient shamanic traditions across Africa, Australia, and Native America used tourmaline as a protective tool.',
      spiritualBenefitSummary: 'Traditionally associated with the Root Chakra, black tourmaline is believed to support grounding, energetic protection, stability, and clearing of negative energy.',
      usageGuide: 'Place near the entrance of your home, beside electronics, or carry in your pocket. Hold during grounding meditation.',
      careInstructions: 'Wipe with a dry soft cloth. This is a robust stone that can be cleansed with running water. Cleanse energetically with smoke or sound.',
      price: 399,
      mrp: 549,
      discountPercent: 27,
      categorySlug: 'protection',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 70,
      priority: 14,
      attributes: { stoneType: 'Black Tourmaline', chakra: 'Root Chakra', zodiac: ['Capricorn', 'Scorpio'], intention: ['Protection', 'Grounding', 'Stability'], energyType: 'Protective & Grounding', color: 'Black', material: 'Natural Crystal', origin: 'India', form: 'Raw' },
      collectionSlugs: ['best-sellers', 'protection-essentials', 'negative-energy-removal-products'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800', altText: 'Black Tourmaline raw protection crystal', title: 'Black Tourmaline Protection Stone', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Black Tourmaline Protection Stone | Traditionally Associated with Protection', seoDescription: 'Natural black tourmaline raw crystal traditionally associated with protection and grounding.', seoKeywords: 'black tourmaline, protection crystal, grounding stone, root chakra crystal', canonicalUrl: 'http://localhost:3000/products/black-tourmaline-protection-stone', ogTitle: 'Black Tourmaline — Traditionally Associated with Protection', ogDescription: 'Natural raw black tourmaline traditionally chosen for protection and grounding.', twitterTitle: 'Black Tourmaline Protection Stone', twitterDescription: 'Natural black tourmaline traditionally associated with protection and grounding.' },
    },
    {
      name: 'Clear Quartz Energy Amplifier',
      slug: 'clear-quartz-energy-amplifier',
      sku: 'CRYS-CQ-001',
      shortDescription: 'Natural clear quartz point traditionally associated with amplifying energy and clarity of intention.',
      longDescription: 'The Clear Quartz Energy Amplifier is a premium natural quartz crystal point known as the "Master Healer." Clear quartz is believed to amplify energy, intention, and the effect of surrounding crystals. It resonates with all chakras and is traditionally associated with clarity, focus, and amplification of positive energy.',
      storySummary: 'Known as the "Master Healer," clear quartz has been used across nearly every ancient civilization including Egyptian, Mayan, and Tibetan traditions.',
      spiritualBenefitSummary: 'Traditionally associated with all chakras, clear quartz is believed to amplify energy and intention, support clarity of thought, and enhance the properties of nearby crystals.',
      usageGuide: 'Hold during meditation while setting a clear intention. Place in the center of crystal grids to amplify the arrangement.',
      careInstructions: 'Clean with water and mild soap occasionally. Cleanse with moonlight or sound.',
      price: 549,
      mrp: 749,
      discountPercent: 27,
      categorySlug: 'healing-crystals',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 55,
      priority: 13,
      attributes: { stoneType: 'Clear Quartz', chakra: 'All Chakras', zodiac: ['All Signs'], intention: ['Amplification', 'Clarity', 'Focus', 'Healing'], energyType: 'Amplifying & Clarifying', color: 'Clear / White', material: 'Natural Crystal', origin: 'Brazil', form: 'Point' },
      collectionSlugs: ['best-sellers', 'positive-energy-products'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1567225591450-06036b3392a6?w=800', altText: 'Clear quartz crystal point', title: 'Clear Quartz Energy Amplifier', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Clear Quartz Energy Amplifier | Master Healer Crystal', seoDescription: 'Natural clear quartz point traditionally associated with amplifying energy and clarity.', seoKeywords: 'clear quartz crystal, master healer crystal, energy amplifier stone', canonicalUrl: 'http://localhost:3000/products/clear-quartz-energy-amplifier', ogTitle: 'Clear Quartz — Traditionally Known as the Master Healer', ogDescription: 'Natural clear quartz point traditionally associated with amplifying energy and clarity.', twitterTitle: 'Clear Quartz Energy Amplifier', twitterDescription: 'Natural clear quartz traditionally associated with amplifying energy and clarity.' },
    },
    {
      name: 'Selenite Cleansing Wand',
      slug: 'selenite-cleansing-wand',
      sku: 'CRYS-SE-001',
      shortDescription: 'Natural selenite wand traditionally associated with cleansing energy, clarity, and light vibrations.',
      longDescription: 'The Selenite Cleansing Wand is a natural white selenite stick, traditionally used in energy cleansing rituals. Selenite is believed to carry a very high, pure vibration and is commonly used to cleanse the aura, clear stagnant energy from spaces, and charge other crystals.',
      storySummary: 'Selenite has been used in sacred spaces, altars, and spiritual practices across many traditions. Ancient Greeks associated it with the moon goddess Selene and used it for clarity and purity rituals.',
      spiritualBenefitSummary: 'Traditionally associated with the Crown and Higher Chakras, selenite is believed to support energy cleansing, aura clearing, mental clarity, and connection to higher awareness.',
      usageGuide: 'Wave the wand around your body to cleanse your aura. Place in rooms to maintain clear energy. Lay other crystals on selenite to cleanse and charge them.',
      careInstructions: 'Do NOT soak or rinse with water — selenite dissolves in water. Wipe gently with a dry cloth only.',
      price: 449,
      mrp: 599,
      discountPercent: 25,
      categorySlug: 'energy-cleansing',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 45,
      priority: 12,
      attributes: { stoneType: 'Selenite', chakra: ['Crown Chakra', 'Higher Chakras'], zodiac: ['Cancer', 'Taurus'], intention: ['Cleansing', 'Clarity', 'Aura Clearing', 'Peace'], energyType: 'Cleansing & High Vibration', color: 'White / Translucent', material: 'Natural Crystal', origin: 'Morocco', form: 'Wand' },
      collectionSlugs: ['best-sellers', 'negative-energy-removal-products', 'positive-energy-products'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1593108408993-e8a9cae8d145?w=800', altText: 'Selenite cleansing wand white crystal', title: 'Selenite Cleansing Wand', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Selenite Cleansing Wand | Traditionally Used for Energy Cleansing', seoDescription: 'Natural selenite wand traditionally associated with cleansing energy, aura clearing, and light vibrations.', seoKeywords: 'selenite wand, energy cleansing crystal, aura cleansing, selenite stick', canonicalUrl: 'http://localhost:3000/products/selenite-cleansing-wand', ogTitle: 'Selenite Cleansing Wand — Traditionally Used for Energy Clearing', ogDescription: 'Natural selenite wand traditionally associated with cleansing energy and aura clearing.', twitterTitle: 'Selenite Cleansing Wand', twitterDescription: 'Natural selenite traditionally associated with energy cleansing and aura clearing.' },
    },
    {
      name: 'Green Aventurine Prosperity Stone',
      slug: 'green-aventurine-prosperity-stone',
      sku: 'CRYS-GA-001',
      shortDescription: 'Natural green aventurine tumbled stone traditionally associated with prosperity, luck, and heart energy.',
      longDescription: 'The Green Aventurine Prosperity Stone is a beautifully polished natural green aventurine tumble, often called the "Stone of Opportunity." Green aventurine is traditionally associated with attracting luck, opportunity, and prosperity. Its rich green color resonates with the Heart Chakra.',
      storySummary: 'Green aventurine has been used as a good luck talisman across many cultures. Ancient Tibetans used aventurine in statues to symbolize improved vision and vitality.',
      spiritualBenefitSummary: 'Traditionally associated with the Heart Chakra, green aventurine is believed to support prosperity, luck, optimism, and confidence.',
      usageGuide: 'Place in your workspace, wallet, or near financial documents. Carry in your pocket or bag.',
      careInstructions: 'Clean with water and a soft cloth. Can be cleansed with running water, moonlight, or sound.',
      price: 249,
      mrp: 349,
      discountPercent: 29,
      categorySlug: 'money-attraction',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 90,
      priority: 11,
      attributes: { stoneType: 'Green Aventurine', chakra: 'Heart Chakra', zodiac: ['Aries', 'Leo'], intention: ['Prosperity', 'Luck', 'Opportunity', 'Confidence'], energyType: 'Uplifting & Prosperous', color: 'Green', material: 'Natural Crystal', origin: 'India', form: 'Tumbled Stone' },
      collectionSlugs: ['money-attraction-picks', 'positive-energy-products'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae?w=800', altText: 'Green aventurine tumbled prosperity stone', title: 'Green Aventurine Prosperity Stone', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Green Aventurine Prosperity Stone | Stone of Opportunity', seoDescription: 'Natural green aventurine traditionally associated with prosperity, luck, and opportunity.', seoKeywords: 'green aventurine, prosperity stone, luck crystal, stone of opportunity', canonicalUrl: 'http://localhost:3000/products/green-aventurine-prosperity-stone', ogTitle: 'Green Aventurine — Traditionally Known as the Stone of Opportunity', ogDescription: 'Natural green aventurine traditionally associated with prosperity and luck.', twitterTitle: 'Green Aventurine Prosperity Stone', twitterDescription: 'Natural green aventurine traditionally associated with prosperity and opportunity.' },
    },
    {
      name: 'Pyrite Money Magnet Stone',
      slug: 'pyrite-money-magnet-stone',
      sku: 'CRYS-PY-001',
      shortDescription: 'Natural pyrite cluster traditionally associated with abundance, confidence, and attracting wealth energy.',
      longDescription: 'The Pyrite Money Magnet Stone is a natural pyrite cluster, known as "Fool\'s Gold" for its stunning metallic golden appearance. In crystal traditions, pyrite is traditionally associated with manifesting abundance, building confidence, and attracting prosperous energy.',
      storySummary: 'Known as "Fool\'s Gold," pyrite has fascinated cultures for centuries. Ancient Incas used polished pyrite as mirrors. In modern crystal traditions, it is revered as a powerful symbol of abundance.',
      spiritualBenefitSummary: 'Traditionally associated with the Solar Plexus Chakra, pyrite is believed to support abundance, confidence, motivation, willpower, and attracting prosperous energy.',
      usageGuide: 'Place the pyrite cluster on your office desk or in the wealth area of your home. Keep a small piece in your wallet.',
      careInstructions: 'Do NOT rinse with water — pyrite can rust when wet. Wipe with a dry soft cloth.',
      price: 599,
      mrp: 849,
      discountPercent: 29,
      categorySlug: 'money-attraction',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 40,
      priority: 15,
      attributes: { stoneType: 'Pyrite', chakra: 'Solar Plexus Chakra', zodiac: ['Leo', 'Aries'], intention: ['Abundance', 'Confidence', 'Wealth Energy', 'Motivation'], energyType: 'Energizing & Prosperous', color: 'Golden Metallic', material: 'Natural Mineral', origin: 'Peru', form: 'Cluster' },
      collectionSlugs: ['best-sellers', 'money-attraction-picks'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1568700253449-38a86f7ce6fc?w=800', altText: 'Pyrite money magnet golden cluster', title: 'Pyrite Money Magnet Stone', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Pyrite Money Magnet Stone | Traditionally Associated with Abundance', seoDescription: 'Natural pyrite cluster traditionally associated with abundance, confidence, and wealth energy.', seoKeywords: 'pyrite crystal, money magnet stone, abundance crystal, pyrite cluster', canonicalUrl: 'http://localhost:3000/products/pyrite-money-magnet-stone', ogTitle: 'Pyrite Money Magnet — Traditionally Associated with Abundance', ogDescription: 'Natural pyrite cluster traditionally associated with abundance and confidence.', twitterTitle: 'Pyrite Money Magnet Stone', twitterDescription: 'Natural pyrite traditionally associated with abundance and wealth energy.' },
    },
    {
      name: 'Seven Chakra Bracelet',
      slug: 'seven-chakra-bracelet',
      sku: 'BRAC-7C-001',
      shortDescription: 'Handcrafted bracelet with seven natural stones representing each chakra, traditionally worn for energetic balance.',
      longDescription: 'The Seven Chakra Bracelet features seven genuine natural stones, each representing one of the seven main energy centers. From Root to Crown, this bracelet brings together red jasper, carnelian, citrine, green aventurine, sodalite, amethyst, and clear quartz.',
      storySummary: 'The concept of chakras originates from ancient Indian Vedic traditions, with detailed descriptions found in texts dating back over 3,000 years. The seven chakra system maps the body\'s energetic anatomy.',
      spiritualBenefitSummary: 'Traditionally worn for overall energetic balance and chakra alignment. Each stone is traditionally associated with its corresponding chakra energy.',
      usageGuide: 'Wear on your left wrist to symbolically receive balancing energy. Can also be placed on a chakra layout during meditation.',
      careInstructions: 'Clean with a soft dry cloth. Avoid prolonged water exposure and harsh chemicals.',
      price: 449,
      mrp: 649,
      discountPercent: 31,
      categorySlug: 'crystal-bracelets',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 65,
      priority: 13,
      attributes: { stoneType: 'Multi-Stone (7 Chakra)', chakra: 'All 7 Chakras', zodiac: ['All Signs'], intention: ['Balance', 'Chakra Alignment', 'Harmony'], energyType: 'Balancing', color: 'Multicolor', material: 'Natural Crystals', origin: 'India', beadSize: '8mm', stones: ['Red Jasper', 'Carnelian', 'Citrine', 'Green Aventurine', 'Sodalite', 'Amethyst', 'Clear Quartz'] },
      collectionSlugs: ['best-sellers', 'positive-energy-products'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', altText: 'Seven chakra bracelet multicolor natural stones', title: 'Seven Chakra Bracelet', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Seven Chakra Bracelet | Traditionally Worn for Energetic Balance', seoDescription: 'Natural 7 chakra stone bracelet handcrafted for balance and alignment. Traditionally worn to support all chakras.', seoKeywords: 'seven chakra bracelet, 7 chakra stone bracelet, chakra balance bracelet', canonicalUrl: 'http://localhost:3000/products/seven-chakra-bracelet', ogTitle: 'Seven Chakra Bracelet — Traditionally Worn for Energetic Balance', ogDescription: 'Handcrafted 7 chakra bracelet traditionally associated with chakra alignment.', twitterTitle: 'Seven Chakra Bracelet', twitterDescription: 'Natural 7 chakra bracelet traditionally worn for energetic balance.' },
    },
    {
      name: 'Crystal Pyramid for Positive Energy',
      slug: 'crystal-pyramid-positive-energy',
      sku: 'PYRA-CQ-001',
      shortDescription: 'Natural clear quartz pyramid traditionally associated with amplifying positive energy and space cleansing.',
      longDescription: 'The Crystal Pyramid combines the sacred geometry of the pyramid shape with the energetic properties of clear quartz. Pyramids are traditionally believed to focus and amplify energy, while clear quartz is known as the "Master Healer." Together, this pyramid is commonly used in meditation spaces and home altars.',
      storySummary: 'The pyramid shape has been used in sacred architecture across ancient Egypt, Mesoamerica, and India. In crystal traditions, pyramid-shaped crystals are believed to concentrate and direct energy with exceptional focus.',
      spiritualBenefitSummary: 'Traditionally associated with all chakras, this pyramid is believed to amplify positive energy, focus intention, support meditation, and enhance the energy of any space.',
      usageGuide: 'Place in your living room, meditation corner, or workspace. Face the apex upward to direct energy. Set an intention by holding the pyramid and focusing your thoughts.',
      careInstructions: 'Wipe with a soft dry cloth. Cleanse with sound or moonlight.',
      price: 699,
      mrp: 999,
      discountPercent: 30,
      categorySlug: 'pyramids',
      stockStatus: StockStatus.IN_STOCK,
      inventoryQuantity: 35,
      priority: 14,
      attributes: { stoneType: 'Clear Quartz', chakra: 'All Chakras', zodiac: ['All Signs'], intention: ['Positive Energy', 'Amplification', 'Space Cleansing', 'Focus'], energyType: 'Amplifying & Harmonizing', color: 'Clear / White', material: 'Natural Crystal', origin: 'Brazil', form: 'Pyramid', size: 'approx. 5cm base' },
      collectionSlugs: ['best-sellers', 'positive-energy-products', 'new-arrivals'],
      images: [{ imageUrl: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800', altText: 'Clear quartz crystal pyramid positive energy', title: 'Crystal Pyramid for Positive Energy', isPrimary: true, sortOrder: 0 }],
      seo: { seoTitle: 'Crystal Pyramid for Positive Energy | Clear Quartz Pyramid', seoDescription: 'Natural clear quartz pyramid traditionally associated with amplifying positive energy and space cleansing.', seoKeywords: 'crystal pyramid, clear quartz pyramid, positive energy pyramid, healing crystal pyramid', canonicalUrl: 'http://localhost:3000/products/crystal-pyramid-positive-energy', ogTitle: 'Crystal Pyramid — Traditionally Associated with Positive Energy', ogDescription: 'Natural clear quartz pyramid traditionally associated with positive energy and space harmony.', twitterTitle: 'Crystal Pyramid for Positive Energy', twitterDescription: 'Natural clear quartz pyramid traditionally associated with positive energy amplification.' },
    },
  ];

  for (const productData of productsData) {
    const { collectionSlugs, images, seo, categorySlug, ...productFields } = productData;
    const categoryId = categories[categorySlug]?.id;
    if (!categoryId) {
      console.warn(`⚠️ Category not found: ${categorySlug}`);
      continue;
    }

    const createdProduct = await prisma.product.upsert({
      where: { slug: productFields.slug },
      update: {
        name: productFields.name,
        sku: productFields.sku,
        shortDescription: productFields.shortDescription,
        longDescription: productFields.longDescription,
        storySummary: productFields.storySummary,
        spiritualBenefitSummary: productFields.spiritualBenefitSummary,
        usageGuide: productFields.usageGuide,
        careInstructions: productFields.careInstructions,
        price: productFields.price,
        mrp: productFields.mrp,
        discountPercent: productFields.discountPercent,
        stockStatus: productFields.stockStatus,
        inventoryQuantity: productFields.inventoryQuantity,
        priority: productFields.priority,
        attributes: productFields.attributes as any,
        categoryId,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        name: productFields.name,
        slug: productFields.slug,
        sku: productFields.sku,
        shortDescription: productFields.shortDescription,
        longDescription: productFields.longDescription,
        storySummary: productFields.storySummary,
        spiritualBenefitSummary: productFields.spiritualBenefitSummary,
        usageGuide: productFields.usageGuide,
        careInstructions: productFields.careInstructions,
        price: productFields.price,
        mrp: productFields.mrp,
        discountPercent: productFields.discountPercent,
        stockStatus: productFields.stockStatus,
        inventoryQuantity: productFields.inventoryQuantity,
        priority: productFields.priority,
        attributes: productFields.attributes as any,
        categoryId,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      select: { id: true },
    });

    await prisma.productImage.deleteMany({ where: { productId: createdProduct.id } });
    for (const img of images) {
      await prisma.productImage.create({
        data: { ...img, productId: createdProduct.id },
      });
    }

    await prisma.seoMetadata.upsert({
      where: { entityType_entityId: { entityType: 'PRODUCT', entityId: createdProduct.id } },
      update: { ...seo, schemaType: 'Product' },
      create: { ...seo, entityType: 'PRODUCT', entityId: createdProduct.id, schemaType: 'Product' },
    });

    for (const collectionSlug of collectionSlugs) {
      const collectionId = collections[collectionSlug]?.id;
      if (collectionId) {
        await prisma.collectionProduct.upsert({
          where: { collectionId_productId: { collectionId, productId: createdProduct.id } },
          update: {},
          create: { collectionId, productId: createdProduct.id },
        });
      }
    }
  }

  console.log(`✅ ${productsData.length} products seeded with images, SEO metadata, and collection links`);

  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? 'Admin@123456';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, isActive: true, role: AdminRole.SUPER_ADMIN },
    create: {
      name: 'Default Admin',
      email: adminEmail,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Default admin ready: ${adminEmail}`);

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {
      type: CouponType.PERCENTAGE,
      value: 10,
      maxDiscountAmount: 150,
      minOrderAmount: 299,
      isActive: true,
    },
    create: {
      code: 'WELCOME10',
      type: CouponType.PERCENTAGE,
      value: 10,
      maxDiscountAmount: 150,
      minOrderAmount: 299,
      isActive: true,
    },
  });
  console.log('✅ Sample coupon ready: WELCOME10');
  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
