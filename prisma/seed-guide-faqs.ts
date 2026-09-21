import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Short, direct, quotable Q&A pairs per guide — the format answer engines
// (ChatGPT, Perplexity, Gemini, Google AI Overviews) most readily lift and
// cite, and the same content also renders as on-page FAQPage rich results.
const GUIDE_FAQS: Record<string, Array<{ question: string; answer: string }>> = {
  'beginners-guide-to-chakra-healing-crystals': [
    {
      question: 'What are the seven chakras?',
      answer:
        'The seven chakras are energy centers described in ancient Indian Vedic traditions, running from the base of the spine (Root Chakra) to the top of the head (Crown Chakra). Each is traditionally associated with a different aspect of the body and mind.',
    },
    {
      question: 'How do I know which chakra needs attention?',
      answer:
        "There's no clinical test — many people simply reflect on which life area (grounding, creativity, confidence, love, communication, intuition, or spiritual connection) feels most out of balance, then choose a crystal traditionally associated with that chakra.",
    },
    {
      question: 'Can one crystal work for multiple chakras?',
      answer:
        'Yes. Some stones, like clear quartz, are traditionally associated with all seven chakras rather than just one, making them a popular all-purpose choice.',
    },
  ],
  'crystals-for-anxiety-and-calm': [
    {
      question: 'Which crystal is most commonly chosen for anxiety?',
      answer:
        'Amethyst is the crystal most commonly chosen for calm and anxiety-related practices, traditionally associated with mental clarity and a soothing energy.',
    },
    {
      question: 'Can crystals replace anxiety medication or therapy?',
      answer:
        'No. Crystals are a complementary, traditional practice, not a medical treatment — please consult a qualified healthcare professional for ongoing anxiety.',
    },
    {
      question: 'How do people typically use a calming crystal day to day?',
      answer:
        'Common practices include holding the stone during a few minutes of quiet breathing, keeping it on a nightstand, or wearing it as a bracelet throughout the day.',
    },
  ],
  'how-to-cleanse-and-care-for-crystals': [
    {
      question: 'How often should I cleanse my crystals?',
      answer:
        'There\'s no fixed rule — many people cleanse monthly, during a full moon, or whenever a stone feels "heavy" or dull after frequent handling.',
    },
    {
      question: 'Can I cleanse all crystals with water?',
      answer:
        'No. Selenite and pyrite should never be rinsed with water, since selenite can dissolve and pyrite can rust — use a dry cloth for these instead.',
    },
    {
      question: "What's the simplest cleansing method for beginners?",
      answer:
        'Moonlight is the simplest traditional method: place your crystal on a windowsill or outdoors overnight, ideally during a full moon.',
    },
  ],
  'how-to-use-a-dowsing-pendulum': [
    {
      question: 'What is a dowsing pendulum used for?',
      answer:
        "A dowsing pendulum is traditionally used as a simple reflection and intuition tool — typically a small weighted crystal on a chain that's held still and observed for its natural swing.",
    },
    {
      question: 'How do I find my pendulum\'s "yes" and "no"?',
      answer:
        'Hold the pendulum still, ask it to show you "yes," and note the direction it swings (often clockwise or back-and-forth); repeat for "no." This varies from person to person.',
    },
    {
      question: 'Does the type of crystal matter?',
      answer:
        'Many people choose a stone based on its traditional association — for example, amethyst for clarity or clear quartz for general-purpose use — though any pendulum can be used for the practice.',
    },
  ],
  'numerology-bracelets-explained': [
    {
      question: 'How do I calculate my numerology number?',
      answer:
        'Add together every digit of your full birth date, then keep adding the resulting digits together until you reach a single digit (or a master number like 11, 22, or 33).',
    },
    {
      question: 'What if my life path number is 11, 22, or 33?',
      answer:
        'These are traditionally treated as "master numbers" and often kept unreduced rather than simplified further, believed to carry a more intense version of that number\'s traditional meaning.',
    },
    {
      question: "Can I wear a numerology bracelet that isn't my number?",
      answer:
        "Yes — while numerology bracelets are traditionally matched to your calculated number, many people choose one simply because they're drawn to its specific stones or colors.",
    },
  ],
  'chakra-activation-bracelets-guide': [
    {
      question: 'What\'s the difference between a chakra activation bracelet and a 7 chakra bracelet?',
      answer:
        'A chakra activation bracelet focuses on a single chakra using one or two matching stones, while a 7 chakra bracelet combines a stone for each of the seven energy centers for overall balance.',
    },
    {
      question: 'How do I know which chakra to focus on first?',
      answer:
        'Many people start with the Root Chakra (grounding and stability) since it\'s traditionally considered the foundation for the other six.',
    },
    {
      question: 'Can I wear more than one chakra activation bracelet at once?',
      answer:
        'Yes, stacking bracelets for different chakras is a common practice — see our guide on building a crystal bracelet stack for more.',
    },
  ],
  'how-to-choose-your-first-crystal-bracelet': [
    {
      question: 'What is the best crystal bracelet for a total beginner?',
      answer:
        'Clear quartz or rose quartz are popular starting points — clear quartz for its traditional "master healer" versatility, rose quartz for its gentle association with love and self-compassion.',
    },
    {
      question: 'How do I know my bracelet size?',
      answer:
        "Most bracelets use stretch cord with 8mm beads sized for an average adult wrist; if you're between sizes, sizing slightly larger is generally more comfortable.",
    },
    {
      question: 'Should I choose a bracelet based on my zodiac sign or my intention?',
      answer:
        "Either approach works — some people match a stone to their zodiac sign's traditional associations, while others choose based purely on the intention (love, protection, abundance) they want to focus on.",
    },
  ],
  'crystals-for-money-and-abundance': [
    {
      question: 'What is the best crystal for attracting money?',
      answer:
        'Citrine, known as the "Merchant\'s Stone," is the crystal most traditionally associated with abundance and prosperity.',
    },
    {
      question: 'Where should I place money-attraction crystals?',
      answer:
        'Common traditional placements include a work desk, the wealth corner of a room (southeast, per Feng Shui), or a wallet.',
    },
    {
      question: 'Do money crystals actually guarantee financial results?',
      answer:
        'No — this is a traditional, symbolic practice reflecting long-standing crystal traditions, not a guarantee of financial outcomes.',
    },
  ],
  'crystals-for-protection-and-grounding': [
    {
      question: 'What is the most popular protection crystal?',
      answer:
        'Black tourmaline is the most widely used protective crystal, traditionally associated with grounding and creating an energetic shield.',
    },
    {
      question: 'What\'s the difference between "protection" and "grounding" crystals?',
      answer:
        'In practice the two overlap heavily — most protection stones (like black tourmaline and black obsidian) are also traditionally described as grounding, since both are rooted in Root Chakra associations.',
    },
    {
      question: 'Can I carry a protection crystal instead of wearing it?',
      answer: 'Yes, carrying a small stone in a pocket or bag is just as common as wearing it as a bracelet.',
    },
  ],
  'building-a-crystal-bracelet-stack': [
    {
      question: 'How many bracelets can I stack at once?',
      answer:
        'There\'s no fixed limit — many people start with 2-3 bracelets representing different intentions and add more over time.',
    },
    {
      question: 'Do stacked bracelets need to match in color?',
      answer:
        "No, matching isn't required; most people focus on the traditional meaning of each stone rather than visual coordination.",
    },
    {
      question: 'Can I combine a chakra bracelet with a numerology bracelet?',
      answer:
        'Yes, combining bracelet types is common — for example, pairing a Root Chakra bracelet for grounding with a numerology bracelet matched to your personal number.',
    },
  ],
};

// A single well-structured comparison table on the flagship chakra guide —
// tables are disproportionately favored by both Google's rich results and
// LLM-based answer engines for direct extraction.
const CHAKRA_TABLE_HTML = `
<h2>Chakra reference table</h2>
<table>
<thead>
<tr><th>Chakra</th><th>Location</th><th>Common stones</th><th>Traditional association</th></tr>
</thead>
<tbody>
<tr><td>Root</td><td>Base of spine</td><td>Black Tourmaline, Red Jasper</td><td>Grounding, stability</td></tr>
<tr><td>Sacral</td><td>Lower abdomen</td><td>Carnelian</td><td>Creativity, vitality</td></tr>
<tr><td>Solar Plexus</td><td>Upper abdomen</td><td>Citrine, Pyrite</td><td>Confidence, personal power</td></tr>
<tr><td>Heart</td><td>Center of chest</td><td>Rose Quartz, Green Aventurine</td><td>Love, compassion</td></tr>
<tr><td>Throat</td><td>Throat</td><td>Sodalite</td><td>Communication, self-expression</td></tr>
<tr><td>Third Eye</td><td>Between eyebrows</td><td>Amethyst</td><td>Intuition, clarity</td></tr>
<tr><td>Crown</td><td>Top of head</td><td>Clear Quartz, Selenite</td><td>Spiritual connection</td></tr>
</tbody>
</table>
`;

async function main() {
  let faqCount = 0;
  for (const [slug, faqs] of Object.entries(GUIDE_FAQS)) {
    const guide = await prisma.guide.findUnique({ where: { slug } });
    if (!guide) {
      console.warn(`⚠️ Guide not found: ${slug}`);
      continue;
    }
    const existing = await prisma.faq.count({
      where: { entityType: 'GUIDE', entityId: guide.id },
    });
    if (existing > 0) {
      console.log(`ℹ️ ${slug} already has FAQs, skipping`);
      continue;
    }
    await prisma.faq.createMany({
      data: faqs.map((faq, index) => ({
        entityType: 'GUIDE' as const,
        entityId: guide.id,
        question: faq.question,
        answer: faq.answer,
        sortOrder: index,
      })),
    });
    faqCount += faqs.length;
    console.log(`✓ ${slug}: ${faqs.length} FAQs added`);
  }
  console.log(`\n✅ ${faqCount} guide FAQs seeded total.`);

  const chakraGuide = await prisma.guide.findUnique({
    where: { slug: 'beginners-guide-to-chakra-healing-crystals' },
  });
  if (chakraGuide && !chakraGuide.bodyHtml.includes('Chakra reference table')) {
    await prisma.guide.update({
      where: { id: chakraGuide.id },
      data: { bodyHtml: chakraGuide.bodyHtml + CHAKRA_TABLE_HTML },
    });
    console.log('✓ Added chakra reference table to the beginner\'s guide');
  } else if (chakraGuide) {
    console.log('ℹ️ Chakra reference table already present, skipping');
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
