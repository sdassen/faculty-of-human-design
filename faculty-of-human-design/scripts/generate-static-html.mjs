/**
 * Post-build pre-render: generate per-route HTML files with correct meta tags.
 *
 * Vite builds a single dist/index.html (the SPA shell).
 * This script copies it to dist/<route>/index.html for every sitemap URL,
 * replacing <title>, meta description, canonical and og:* in the head.
 *
 * Vercel serves static files BEFORE applying the catch-all SPA rewrite,
 * so each route gets its own SEO-correct HTML shell served instantly —
 * no JavaScript required for Google to read title / description / canonical.
 *
 * Run: node scripts/generate-static-html.mjs
 * Called by: "build": "vite build && node scripts/generate-static-html.mjs"
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST   = join(__dirname, '..', 'dist');
const SITE   = 'https://www.facultyhd.com';
const OG_IMG = 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&auto=format&fit=crop&q=82';

// ─── ROUTE DEFINITIONS ────────────────────────────────────────────────────────
// Each entry: { path, title, description, canonical, ogImage? }
// title  = the full <title> tag content (no suffix added automatically)
// canonical = absolute URL

const ROUTES = [
  // ── HOMEPAGE ──────────────────────────────────────────────────────────────
  {
    path: '/',
    title: 'Human Design Reading — Persoonlijk & Diepgaand | Faculty of Human Design',
    description: 'Ontvang een diepgaande, persoonlijke Human Design reading op basis van je exacte geboortedata. 40+ pagina\'s, Swiss Ephemeris precisie, bezorgd als PDF. Opgericht op Ibiza in 2014. Vanaf €45.',
    canonical: `${SITE}/`,
  },

  // ── HUMAN DESIGN PAGE ─────────────────────────────────────────────────────
  {
    path: '/human-design',
    title: 'Wat is Human Design? — Numerologie, Astrologie & Zelfherkenning | Faculty of Human Design',
    description: 'Human Design, Numerologie en Astrologie als drie lenzen op dezelfde persoon. Niet om uit te leggen wie je bent, maar om het te herkennen.',
    canonical: `${SITE}/human-design`,
  },

  // ── READINGS OVERVIEW ─────────────────────────────────────────────────────
  {
    path: '/readings',
    title: 'Human Design Readings — Kies je persoonlijke reading | Faculty of Human Design',
    description: 'Kies uit 10 diepgaande readings: Human Design Reading, Relatie, Loopbaan, Jaar, Kind, Numerologie en Geboortehoroscoop. Persoonlijk en bezorgd binnen 1 werkdag. Vanaf €45.',
    canonical: `${SITE}/readings`,
  },

  // ── RAPPORT DETAIL PAGES ──────────────────────────────────────────────────
  {
    path: '/rapport/volledig',
    title: 'Human Design Reading — Begrijp eindelijk wie je werkelijk bent | Faculty of Human Design',
    description: 'Jouw complete persoonlijke blauwdruk. Volledige analyse van Type, Autoriteit, Profiel, centra, kanalen en Inkarnatie-Kruis. 40+ pagina\'s. Swiss Ephemeris. Bezorgd binnen 1 werkdag. €75.',
    canonical: `${SITE}/rapport/volledig`,
  },
  {
    path: '/rapport/relatie_liefde',
    title: 'Relatie Reading — Meer rust en begrip in je romantische verbinding | Faculty of Human Design',
    description: 'Diepgaande analyse van jouw en je partners Human Design charts. Elektromagnetische kanalen, compatibiliteit, communicatie en intimiteit. 28+ pagina\'s. Bezorgd binnen 1 werkdag. €95.',
    canonical: `${SITE}/rapport/relatie_liefde`,
  },
  {
    path: '/rapport/relatie_business',
    title: 'Zakelijke Reading — Samenwerking die werkt voor jullie allebei | Faculty of Human Design',
    description: 'Twee Human Design charts vanuit zakelijk perspectief. Besluitvorming, leiderschapsstijl, communicatiepatronen en rolverdeling. 24+ pagina\'s. Bezorgd binnen 1 werkdag. €85.',
    canonical: `${SITE}/rapport/relatie_business`,
  },
  {
    path: '/rapport/relatie_familie',
    title: 'Familie Reading — Meer begrip en verbinding in het gezin | Faculty of Human Design',
    description: 'Energetische dynamieken tussen twee familieleden. Ouder-kind, broer-zus of andere gezinsrelaties. 24+ pagina\'s. Bezorgd binnen 1 werkdag. €75.',
    canonical: `${SITE}/rapport/relatie_familie`,
  },
  {
    path: '/rapport/jaar',
    title: 'Jaarrapport 2026 — Weet wat er dit jaar van je gevraagd wordt | Faculty of Human Design',
    description: 'Solar Return analyse voor jouw persoonlijk jaar 2026. Dominante thema\'s, kwartaaloverzicht, kansen en aandachtspunten. 22+ pagina\'s. Bezorgd binnen 1 werkdag. €55.',
    canonical: `${SITE}/rapport/jaar`,
  },
  {
    path: '/rapport/kind',
    title: 'Kinderrapport — Begeleid je kind vanuit wie het werkelijk is | Faculty of Human Design',
    description: 'Je kind begrijpen vanuit zijn of haar Human Design. Type, energiegebruik, leerstijl, behoeften en opvoedtips op maat. 24+ pagina\'s. Bezorgd binnen 1 werkdag. €75.',
    canonical: `${SITE}/rapport/kind`,
  },
  {
    path: '/rapport/loopbaan',
    title: 'Loopbaan Reading — Verdien geld op een manier die bij je past | Faculty of Human Design',
    description: 'Werk en financiën vanuit je Human Design. Ideale werkomgeving, hoe je geld aantrekt, professionele kracht en financiële strategie. 24+ pagina\'s. Bezorgd binnen 1 werkdag. €65.',
    canonical: `${SITE}/rapport/loopbaan`,
  },
  {
    path: '/rapport/numerologie',
    title: 'Numerologie Reading — Begrijp de patronen achter je levensverhaal | Faculty of Human Design',
    description: 'De getallen achter je naam en geboortedag. 8 kerngetallen inclusief Levenspadgetal, Uitdrukkingsgetal, Zielsgetal en Persoonlijk jaar 2026. 30+ pagina\'s. Bezorgd binnen 1 werkdag. €65.',
    canonical: `${SITE}/rapport/numerologie`,
  },
  {
    path: '/rapport/horoscoop',
    title: 'Geboortehoroscoop Reading — Je planeetstanden als persoonlijk kompas | Faculty of Human Design',
    description: 'Volledige geboortehoroscoop: Zonneteken, Ascendant, Maan, alle 10 planeten, 12 huizen en aspecten. 32+ pagina\'s. Swiss Ephemeris precisie. Bezorgd binnen 1 werkdag. €75.',
    canonical: `${SITE}/rapport/horoscoop`,
  },
  {
    path: '/rapport/maandelijks',
    title: 'Maandelijkse Guidance — Elke maand bewust leven vanuit je design | Faculty of Human Design',
    description: 'Elke maand een persoonlijk rapport over de energetische thema\'s afgestemd op je Human Design chart. Kansen, aandachtspunten en intentie. 12+ pagina\'s. €19 per maand.',
    canonical: `${SITE}/rapport/maandelijks`,
  },

  // ── JOURNAL OVERVIEW ──────────────────────────────────────────────────────
  {
    path: '/journal',
    title: 'Inzichten over Human Design, Numerologie & Astrologie | Faculty of Human Design',
    description: 'Artikelen over Human Design, Numerologie en Astrologie. Leer meer over Type, Strategie, Autoriteit, Numerologie en de oorsprong van Human Design op Ibiza.',
    canonical: `${SITE}/journal`,
  },

  // ── JOURNAL ARTICLES ──────────────────────────────────────────────────────
  {
    path: '/journal/s1',
    title: 'Het verschil tussen Type en Strategie | Faculty of Human Design',
    description: 'Type en Strategie zijn twee van de meest gebruikte begrippen in Human Design, maar beschrijven fundamenteel verschillende aspecten van je design.',
    canonical: `${SITE}/journal/s1`,
  },
  {
    path: '/journal/s2',
    title: 'Innerlijke autoriteit: hoe je je beste beslissingen neemt | Faculty of Human Design',
    description: 'Je innerlijke autoriteit in Human Design is het meest consistente instrument voor besluitvorming dat je bezit.',
    canonical: `${SITE}/journal/s2`,
  },
  {
    path: '/journal/s3',
    title: 'De oorsprong van Human Design op Ibiza | Faculty of Human Design',
    description: 'In januari 1987 ontving Ra Uru Hu het Human Design systeem gedurende acht dagen op Ibiza.',
    canonical: `${SITE}/journal/s3`,
  },
  {
    path: '/journal/s4',
    title: 'Kanalen: de energetische verbindingen in jouw chart | Faculty of Human Design',
    description: 'Een kanaal ontstaat wanneer twee centra via een poort aan beide kanten verbonden zijn. Het is de basis van jouw consistente energetische expressie.',
    canonical: `${SITE}/journal/s4`,
  },
  {
    path: '/journal/s5',
    title: 'Wat je levenspadgetal over jou zegt | Faculty of Human Design',
    description: 'Het levenspadgetal is het meest fundamentele getal in de numerologie, berekend uit je volledige geboortedatum en onveranderlijk voor je hele leven.',
    canonical: `${SITE}/journal/s5`,
  },
  {
    path: '/journal/s6',
    title: 'De vijf Types in Human Design uitgelegd | Faculty of Human Design',
    description: 'Generator, Manifesting Generator, Projector, Manifestor, Reflector. Elk Type heeft een eigen energetische aard, strategie en niet-zelf thema.',
    canonical: `${SITE}/journal/s6`,
  },
  {
    path: '/journal/s7',
    title: 'Gedefinieerde en open centra: het fundament van je chart | Faculty of Human Design',
    description: 'Gedefinieerde centra zijn de constante kracht in jouw design. Open centra zijn de plekken waar je het meest leert — en het meest geconditioneerd raakt.',
    canonical: `${SITE}/journal/s7`,
  },
  {
    path: '/journal/s8',
    title: 'Het profiel: de rol die je speelt in dit leven | Faculty of Human Design',
    description: 'Je profiel in Human Design bestaat uit twee cijfers en beschrijft de archetypische rol die jij in dit leven inneemt, bewust en onbewust.',
    canonical: `${SITE}/journal/s8`,
  },
  {
    path: '/journal/s9',
    title: 'Het Inkarnatie Kruis: jouw overkoepelende levensdoel | Faculty of Human Design',
    description: 'Het Inkarnatie Kruis is de meest overkoepelende laag van je Human Design chart en beschrijft het thema van de bijdrage die jij aan het geheel levert.',
    canonical: `${SITE}/journal/s9`,
  },
  {
    path: '/journal/s10',
    title: 'Conditionering: wie ben jij zonder de invloed van anderen? | Faculty of Human Design',
    description: 'Conditionering is het proces waarbij open centra de energie van anderen absorberen en je leert dat dat van jou is. Het herkennen ervan is het begin van de-conditionering.',
    canonical: `${SITE}/journal/s10`,
  },
  {
    path: '/journal/s11',
    title: 'Circuits in Human Design: individueel, collectief en stam | Faculty of Human Design',
    description: 'Elk kanaal in Human Design behoort tot een circuit. Die circuits beschrijven hoe energie stroomt en welk doel een kanaal dient in het grotere geheel.',
    canonical: `${SITE}/journal/s11`,
  },
  {
    path: '/journal/s12',
    title: 'Je uitdrukkingsgetal: de energie die je naar buiten brengt | Faculty of Human Design',
    description: 'Het uitdrukkingsgetal wordt berekend uit de letters van je volledige naam en beschrijft hoe jij je energie, talenten en aanwezigheid naar buiten brengt.',
    canonical: `${SITE}/journal/s12`,
  },
  {
    path: '/journal/s13',
    title: 'De ascendant: waarom je zonneteken niet het hele verhaal vertelt | Faculty of Human Design',
    description: 'Het zonneteken is het meest bekende astrologische gegeven, maar het vertelt slechts een derde van het verhaal. De ascendant en de maanstand zijn minstens zo bepalend.',
    canonical: `${SITE}/journal/s13`,
  },
  {
    path: '/journal/s14',
    title: 'Mastergetallen 11, 22 en 33: intense paden met grote potentie | Faculty of Human Design',
    description: 'Mastergetallen worden niet gereduceerd in de numerologie. Ze dragen een dubbele intensiteit: de potentie van hun hogere expressie én de last van hun lagere frequentie.',
    canonical: `${SITE}/journal/s14`,
  },
  {
    path: '/journal/s15',
    title: 'Waarom Human Design geen persoonlijkheidstest is | Faculty of Human Design',
    description: 'Human Design wordt vaak in één adem genoemd met MBTI of de Enneagram. Het fundamentele verschil: Human Design is niet gebaseerd op zelfrapportage maar op astronomische berekening.',
    canonical: `${SITE}/journal/s15`,
  },
  {
    path: '/journal/s16',
    title: 'Planeten in Human Design: welke planeet activeert welke poort? | Faculty of Human Design',
    description: 'In Human Design activeren de planeten op het moment van geboorte specifieke poorten in je chart. Elke planeet heeft daarin een eigen thema en kwaliteit.',
    canonical: `${SITE}/journal/s16`,
  },

  // ── HD TYPE PAGES ─────────────────────────────────────────────────────────
  {
    path: '/type/generator',
    title: 'Generator Human Design — Strategie, Energie & Autoriteit | Faculty of Human Design',
    description: 'Alles over het Generator type in Human Design. Strategie: Reageren. Handtekening: Tevredenheid. Niet-zelf: Frustratie. Ontdek hoe je als Generator optimaal functioneert.',
    canonical: `${SITE}/type/generator`,
  },
  {
    path: '/type/manifesting-generator',
    title: 'Manifesting Generator Human Design — Snel, veelzijdig & onuitputtelijk | Faculty of Human Design',
    description: 'Alles over het Manifesting Generator type in Human Design. Strategie: Reageren en informeren. Handtekening: Tevredenheid & Vrede. Ontdek jouw unieke energie en levensstrategie.',
    canonical: `${SITE}/type/manifesting-generator`,
  },
  {
    path: '/type/projector',
    title: 'Projector Human Design — De gids die ziet wat anderen niet zien | Faculty of Human Design',
    description: 'Alles over het Projector type in Human Design. Strategie: Wachten op de uitnodiging. Handtekening: Succes. Niet-zelf: Bitterheid. Leer hoe je als Projector tot bloei komt.',
    canonical: `${SITE}/type/projector`,
  },
  {
    path: '/type/manifestor',
    title: 'Manifestor Human Design — Het enige type dat van nature kan initiëren | Faculty of Human Design',
    description: 'Alles over het Manifestor type in Human Design. Strategie: Informeren. Handtekening: Vrede. Niet-zelf: Boosheid. Ontdek de kracht en uitdagingen van de Manifestor.',
    canonical: `${SITE}/type/manifestor`,
  },
  {
    path: '/type/reflector',
    title: 'Reflector Human Design — De spiegel van de gemeenschap | Faculty of Human Design',
    description: 'Alles over het Reflector type in Human Design. Strategie: Wachten — een volledige maancyclus. Handtekening: Verrassing. Het zeldzaamste type: ~1% van de bevolking.',
    canonical: `${SITE}/type/reflector`,
  },

  // ── PHILOSOPHY / OVER ─────────────────────────────────────────────────────
  {
    path: '/philosophy',
    title: 'Over — Faculty of Human Design | Persoonlijke readings vanuit Ibiza',
    description: 'Faculty of Human Design. Persoonlijke readings op basis van Human Design, Numerologie en Astrologie. Opgericht op Ibiza in 2014.',
    canonical: `${SITE}/philosophy`,
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  {
    path: '/contact',
    title: 'Contact — Faculty of Human Design',
    description: 'Neem contact op met Faculty of Human Design. Vragen over readings, bestellingen of Human Design? Wij reageren binnen 1 werkdag. E-mail: info@facultyhd.com',
    canonical: `${SITE}/contact`,
  },

  // ── VOORWAARDEN ───────────────────────────────────────────────────────────
  {
    path: '/voorwaarden',
    title: 'Algemene Voorwaarden & Privacybeleid — Faculty of Human Design',
    description: 'Lees de algemene voorwaarden en het privacybeleid van Faculty of Human Design. Informatie over restitutie, aansprakelijkheid en AVG/GDPR.',
    canonical: `${SITE}/voorwaarden`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGLISH ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  {
    path: '/en/',
    title: 'Human Design Reading — Personal & In-Depth | Faculty of Human Design',
    description: 'Receive an in-depth, personal Human Design reading based on your exact birth data. 40+ pages, Swiss Ephemeris precision, delivered as PDF. Founded on Ibiza in 2014. From €45.',
    canonical: `${SITE}/en/`,
  },
  {
    path: '/en/human-design',
    title: 'What is Human Design? — Numerology, Astrology & Self-Recognition | Faculty of Human Design',
    description: 'Human Design, Numerology and Astrology as three lenses on the same person. Not to explain who you are, but to recognise it.',
    canonical: `${SITE}/en/human-design`,
  },
  {
    path: '/en/readings',
    title: 'Human Design Readings — Choose your personal reading | Faculty of Human Design',
    description: 'Choose from 10 in-depth readings: Human Design Reading, Relationship, Career, Year, Child, Numerology and Birth Horoscope. Personal and delivered within 1 business day. From €45.',
    canonical: `${SITE}/en/readings`,
  },
  {
    path: '/en/rapport/volledig',
    title: 'Human Design Reading — Finally understand who you truly are | Faculty of Human Design',
    description: 'Your complete personal blueprint. Full analysis of Type, Authority, Profile, centres, channels and Incarnation Cross. 40+ pages. Swiss Ephemeris. Delivered within 1 business day. €75.',
    canonical: `${SITE}/en/rapport/volledig`,
  },
  {
    path: '/en/rapport/relatie_liefde',
    title: 'Relationship Reading — More peace and understanding in your romantic connection | Faculty of Human Design',
    description: 'In-depth analysis of your and your partner\'s Human Design charts. Electromagnetic channels, compatibility, communication and intimacy. 28+ pages. Delivered within 1 business day. €95.',
    canonical: `${SITE}/en/rapport/relatie_liefde`,
  },
  {
    path: '/en/rapport/relatie_business',
    title: 'Business Reading — Collaboration that works for both of you | Faculty of Human Design',
    description: 'Two Human Design charts from a professional perspective. Decision-making, leadership styles, communication patterns and role division. 24+ pages. Delivered within 1 business day. €85.',
    canonical: `${SITE}/en/rapport/relatie_business`,
  },
  {
    path: '/en/rapport/relatie_familie',
    title: 'Family Reading — More understanding and connection in the family | Faculty of Human Design',
    description: 'Energetic dynamics between two family members. Parent-child, siblings or other family relationships. 24+ pages. Delivered within 1 business day. €75.',
    canonical: `${SITE}/en/rapport/relatie_familie`,
  },
  {
    path: '/en/rapport/jaar',
    title: 'Annual Reading 2026 — Know what is asked of you this year | Faculty of Human Design',
    description: 'Solar Return analysis for your personal year 2026. Dominant themes, quarterly overview, opportunities and points of attention. 22+ pages. Delivered within 1 business day. €55.',
    canonical: `${SITE}/en/rapport/jaar`,
  },
  {
    path: '/en/rapport/kind',
    title: 'Child Reading — Guide your child from who they truly are | Faculty of Human Design',
    description: 'Understanding your child through their Human Design. Type, energy use, learning style, needs and tailored parenting tips. 24+ pages. Delivered within 1 business day. €75.',
    canonical: `${SITE}/en/rapport/kind`,
  },
  {
    path: '/en/rapport/loopbaan',
    title: 'Career & Money Reading — Earn money in a way that suits you | Faculty of Human Design',
    description: 'Work and finances through your Human Design. Ideal work environment, how you attract money, professional strengths and financial strategy. 24+ pages. Delivered within 1 business day. €65.',
    canonical: `${SITE}/en/rapport/loopbaan`,
  },
  {
    path: '/en/rapport/numerologie',
    title: 'Numerology Reading — Understand the patterns behind your life story | Faculty of Human Design',
    description: 'The numbers behind your name and birthday. 8 core numbers including Life Path, Expression, Soul Urge and Personal Year 2026. 30+ pages. Delivered within 1 business day. €65.',
    canonical: `${SITE}/en/rapport/numerologie`,
  },
  {
    path: '/en/rapport/horoscoop',
    title: 'Birth Horoscope Reading — Your planetary positions as a personal compass | Faculty of Human Design',
    description: 'Complete birth horoscope: Sun sign, Ascendant, Moon, all 10 planets, 12 houses and aspects. 32+ pages. Swiss Ephemeris precision. Delivered within 1 business day. €75.',
    canonical: `${SITE}/en/rapport/horoscoop`,
  },
  {
    path: '/en/rapport/maandelijks',
    title: 'Monthly Guidance — Live each month consciously in alignment with your design | Faculty of Human Design',
    description: 'A personal report every month about the energetic themes aligned with your Human Design chart. Opportunities, points of attention and intention. 12+ pages. €19 per month.',
    canonical: `${SITE}/en/rapport/maandelijks`,
  },
  {
    path: '/en/journal',
    title: 'Insights on Human Design, Numerology & Astrology | Faculty of Human Design',
    description: 'Articles on Human Design, Numerology and Astrology. Learn about Type, Strategy, Authority and the origin of Human Design on Ibiza.',
    canonical: `${SITE}/en/journal`,
  },
  {
    path: '/en/journal/s1',
    title: 'The Difference Between Type and Strategy | Faculty of Human Design',
    description: 'Type and Strategy are two of the most frequently used terms in Human Design, but they describe fundamentally different aspects of your design.',
    canonical: `${SITE}/en/journal/s1`,
  },
  {
    path: '/en/journal/s2',
    title: 'Inner Authority: How to Make Your Best Decisions | Faculty of Human Design',
    description: 'Your inner authority in Human Design is the most consistent decision-making instrument you possess.',
    canonical: `${SITE}/en/journal/s2`,
  },
  {
    path: '/en/journal/s3',
    title: 'The Origins of Human Design on Ibiza | Faculty of Human Design',
    description: 'In January 1987, Ra Uru Hu received the Human Design system over eight days on Ibiza.',
    canonical: `${SITE}/en/journal/s3`,
  },
  {
    path: '/en/journal/s4',
    title: 'Channels: The Energetic Connections in Your Chart | Faculty of Human Design',
    description: 'A channel forms when two centres are connected through a gate on both sides. It is the basis of your consistent energetic expression.',
    canonical: `${SITE}/en/journal/s4`,
  },
  {
    path: '/en/journal/s5',
    title: 'What Your Life Path Number Says About You | Faculty of Human Design',
    description: 'The life path number is the most fundamental number in numerology, calculated from your full date of birth and unchanging throughout your entire life.',
    canonical: `${SITE}/en/journal/s5`,
  },
  {
    path: '/en/journal/s6',
    title: 'The Five Types in Human Design Explained | Faculty of Human Design',
    description: 'Generator, Manifesting Generator, Projector, Manifestor, Reflector. Each Type has its own energetic nature, strategy and not-self theme.',
    canonical: `${SITE}/en/journal/s6`,
  },
  {
    path: '/en/journal/s7',
    title: 'Defined and Open Centres: The Foundation of Your Chart | Faculty of Human Design',
    description: 'Defined centres are the constant force in your design. Open centres are the places where you learn most — and become most conditioned.',
    canonical: `${SITE}/en/journal/s7`,
  },
  {
    path: '/en/journal/s8',
    title: 'The Profile: The Role You Play in This Life | Faculty of Human Design',
    description: 'Your profile in Human Design consists of two numbers and describes the archetypal role you occupy in this life, consciously and unconsciously.',
    canonical: `${SITE}/en/journal/s8`,
  },
  {
    path: '/en/journal/s9',
    title: 'The Incarnation Cross: Your Overarching Life Purpose | Faculty of Human Design',
    description: 'The Incarnation Cross is the most overarching layer of your Human Design chart and describes the theme of the contribution you make to the whole.',
    canonical: `${SITE}/en/journal/s9`,
  },
  {
    path: '/en/journal/s10',
    title: 'Conditioning: Who Are You Without the Influence of Others? | Faculty of Human Design',
    description: 'Conditioning is the process by which open centres absorb the energy of others and you learn to treat that as your own. Recognising it is the beginning of de-conditioning.',
    canonical: `${SITE}/en/journal/s10`,
  },
  {
    path: '/en/journal/s11',
    title: 'Circuits in Human Design: Individual, Collective and Tribal | Faculty of Human Design',
    description: 'Every channel in Human Design belongs to a circuit. Those circuits describe how energy flows and what purpose a channel serves in the larger whole.',
    canonical: `${SITE}/en/journal/s11`,
  },
  {
    path: '/en/journal/s12',
    title: 'Your Expression Number: The Energy You Bring Into the World | Faculty of Human Design',
    description: 'The expression number is calculated from the letters of your full name and describes how you bring your energy, talents and presence outward.',
    canonical: `${SITE}/en/journal/s12`,
  },
  {
    path: '/en/journal/s13',
    title: "The Ascendant: Why Your Sun Sign Doesn't Tell the Whole Story | Faculty of Human Design",
    description: 'The sun sign is the most well-known astrological factor, but it tells only a third of the story. The ascendant and moon sign are equally determining.',
    canonical: `${SITE}/en/journal/s13`,
  },
  {
    path: '/en/journal/s14',
    title: 'Master Numbers 11, 22 and 33: Intense Paths With Great Potential | Faculty of Human Design',
    description: 'Master numbers are not reduced in numerology. They carry a double intensity: the potential of their higher expression and the weight of their lower frequency.',
    canonical: `${SITE}/en/journal/s14`,
  },
  {
    path: '/en/journal/s15',
    title: 'Why Human Design Is Not a Personality Test | Faculty of Human Design',
    description: 'Human Design is often mentioned in the same breath as MBTI or the Enneagram. The fundamental difference: Human Design is not based on self-reporting but on astronomical calculation.',
    canonical: `${SITE}/en/journal/s15`,
  },
  {
    path: '/en/journal/s16',
    title: 'Planets in Human Design: Which Planet Activates Which Gate? | Faculty of Human Design',
    description: 'When a Human Design chart is calculated, the positions of ten celestial bodies are used. Each celestial body brings its own theme to the gate it activates.',
    canonical: `${SITE}/en/journal/s16`,
  },
  {
    path: '/en/type/generator',
    title: 'Generator Human Design — Strategy, Energy & Authority | Faculty of Human Design',
    description: 'Everything about the Generator type in Human Design. Strategy: Respond. Signature: Satisfaction. Not-self: Frustration. Discover how to thrive as a Generator.',
    canonical: `${SITE}/en/type/generator`,
  },
  {
    path: '/en/type/manifesting-generator',
    title: 'Manifesting Generator Human Design — Fast, Versatile & Inexhaustible | Faculty of Human Design',
    description: 'Everything about the Manifesting Generator type in Human Design. Strategy: Respond then inform. Signature: Satisfaction & Peace. Discover your unique energy and life strategy.',
    canonical: `${SITE}/en/type/manifesting-generator`,
  },
  {
    path: '/en/type/projector',
    title: 'Projector Human Design — The Guide Who Sees What Others Cannot | Faculty of Human Design',
    description: 'Everything about the Projector type in Human Design. Strategy: Wait for the invitation. Signature: Success. Not-self: Bitterness. Learn how to flourish as a Projector.',
    canonical: `${SITE}/en/type/projector`,
  },
  {
    path: '/en/type/manifestor',
    title: 'Manifestor Human Design — The Only Type Designed to Initiate | Faculty of Human Design',
    description: 'Everything about the Manifestor type in Human Design. Strategy: Inform. Signature: Peace. Not-self: Anger. Discover the power and challenges of the Manifestor.',
    canonical: `${SITE}/en/type/manifestor`,
  },
  {
    path: '/en/type/reflector',
    title: 'Reflector Human Design — The Mirror of the Community | Faculty of Human Design',
    description: 'Everything about the Reflector type in Human Design. Strategy: Wait — a full lunar cycle. Signature: Surprise. The rarest type: ~1% of the population.',
    canonical: `${SITE}/en/type/reflector`,
  },
  {
    path: '/en/philosophy',
    title: 'About — Faculty of Human Design | Personal readings from Ibiza',
    description: 'Faculty of Human Design. Personal readings based on Human Design, Numerology and Astrology. Founded on Ibiza in 2014.',
    canonical: `${SITE}/en/philosophy`,
  },
  {
    path: '/en/contact',
    title: 'Contact — Faculty of Human Design',
    description: 'Contact Faculty of Human Design. Questions about readings, orders or Human Design? We respond within 1 business day. Email: info@facultyhd.com',
    canonical: `${SITE}/en/contact`,
  },
  {
    path: '/en/voorwaarden',
    title: 'Terms & Privacy Policy — Faculty of Human Design',
    description: 'Read the terms and conditions and privacy policy of Faculty of Human Design. Information on refunds, liability and GDPR.',
    canonical: `${SITE}/en/voorwaarden`,
  },
];

// ─── HTML HELPERS ─────────────────────────────────────────────────────────────

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Derive the alternate (NL↔EN) URL for a given canonical URL.
 * NL paths have no prefix; EN paths start with /en/.
 */
function hreflangUrls(canonical) {
  const url = new URL(canonical);
  const isEn = url.pathname.startsWith('/en/') || url.pathname === '/en';
  if (isEn) {
    // EN → strip /en prefix to get NL
    const nlPath = url.pathname.replace(/^\/en/, '') || '/';
    return { nl: `${SITE}${nlPath}`, en: canonical };
  } else {
    // NL → prepend /en to get EN
    const enPath = url.pathname === '/' ? '/en/' : `/en${url.pathname}`;
    return { nl: canonical, en: `${SITE}${enPath}` };
  }
}

/**
 * Inject per-route meta into the HTML template.
 * Replaces title, meta description, canonical, og:* tags.
 * Adds hreflang link elements for NL/EN language variants.
 */
function buildHtml(template, { title, description, canonical, ogImage }) {
  const img = ogImage || OG_IMG;
  let html = template;

  // <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escAttr(title)}</title>`);

  // meta description
  html = html.replace(
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${escAttr(description)}$2`
  );

  // canonical
  html = html.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${escAttr(canonical)}$2`
  );

  // hreflang — inject after canonical (remove any existing hreflang tags first)
  html = html.replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/g, '');
  const { nl: nlUrl, en: enUrl } = hreflangUrls(canonical);
  const hreflangTags = [
    `<link rel="alternate" hreflang="nl" href="${escAttr(nlUrl)}" />`,
    `<link rel="alternate" hreflang="en" href="${escAttr(enUrl)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escAttr(nlUrl)}" />`,
  ].join('\n    ');
  html = html.replace(/(<link\s+rel="canonical"[^>]*>)/, `$1\n    ${hreflangTags}`);

  // og:title
  html = html.replace(
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${escAttr(title)}$2`
  );

  // og:description
  html = html.replace(
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${escAttr(description)}$2`
  );

  // og:url
  html = html.replace(
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
    `$1${escAttr(canonical)}$2`
  );

  // og:image
  html = html.replace(
    /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
    `$1${escAttr(img)}$2`
  );

  // twitter:title
  html = html.replace(
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
    `$1${escAttr(title)}$2`
  );

  // twitter:description
  html = html.replace(
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    `$1${escAttr(description)}$2`
  );

  // twitter:image
  html = html.replace(
    /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
    `$1${escAttr(img)}$2`
  );

  return html;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const template = readFileSync(`${DIST}/index.html`, 'utf8');

let count = 0;
for (const route of ROUTES) {
  const html = buildHtml(template, route);

  // Normalise path: strip trailing slash except for root "/"
  const cleanPath = route.path === '/' ? '' : route.path.replace(/\/$/, '');

  const dir = cleanPath ? join(DIST, cleanPath) : DIST;
  mkdirSync(dir, { recursive: true });

  const outFile = join(dir, 'index.html');
  writeFileSync(outFile, html, 'utf8');
  count++;
  console.log(`  ✓  ${route.path}`);
}

console.log(`\nPre-render complete: ${count} HTML files generated in dist/`);
