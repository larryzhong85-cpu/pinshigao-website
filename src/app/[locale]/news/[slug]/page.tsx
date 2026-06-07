'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface NewsArticle {
  slug: string;
  image: string;
  content: {
    zh: string;
    en: string;
    de: string;
  };
}

const newsData: NewsArticle[] = [
  {
    slug: 'furniture-fair-2024',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    content: {
      zh: '2024年中国国际家具展于12月在上海新国际博览中心盛大开幕。品仕高五金携全新PSG-Pro系列产品首次公开亮相，展位现场人气火爆，吸引了大量国内外专业观众驻足参观。\n\nPSG-Pro系列是品仕高研发团队历时两年精心打造的新一代阻尼铰链产品，采用内置集成阻尼器与45mm短臂设计，兼容多种柜体厚度，三维调节能力达到±3mm。该系列产品在展会期间获得了行业专家、设计师和众多品牌商的高度评价。\n\n展会期间，品仕高还举办了多场技术交流会，与到访客户深入探讨了家具五金行业的发展趋势和技术创新方向。多家知名家具品牌现场达成合作意向，为品仕高进一步拓展国内外市场打下了坚实基础。',
      en: 'The 2024 China International Furniture Fair grandly opened at the Shanghai New International Expo Centre in December. PINSHIGAO Hardware made its first public appearance with the brand-new PSG-Pro series, attracting a large number of domestic and international professional visitors. \n\nThe PSG-Pro series is the next-generation damped hinge product crafted over two years by the PINSHIGAO R&D team. It features a built-in integrated damper and a 45mm short-arm design, compatible with various cabinet thicknesses, with 3D adjustment capability of ±3mm. The series received high praise from industry experts, designers, and numerous brand partners during the fair.\n\nDuring the exhibition, PINSHIGAO also hosted several technical exchange sessions, engaging in in-depth discussions with visiting clients on furniture hardware industry trends and technological innovation directions. Multiple well-known furniture brands signed cooperation意向 agreements on-site, laying a solid foundation for PINSHIGAO to further expand its domestic and international markets.',
      de: 'Die China International Furniture Fair 2024 wurde im Dezember im Shanghai New International Expo Centre eröffnet. PINSHIGAO Hardware gab mit der brandneuen PSG-Pro Serie sein öffentliches Debüt und zog zahlreiche nationale und internationale Fachbesucher an. \n\nDie PSG-Pro Serie ist die nächste Generation gedämpfter Scharniere, die über zwei Jahre vom PINSHIGAO-F&E-Team entwickelt wurde. Sie verfügt über einen integrierten Dämpfer und ein 45-mm-Kurzarmdesign, das mit verschiedenen Schrankstärken kompatibel ist und eine 3D-Verstellbarkeit von ±3mm bietet. Die Serie erhielt auf der Messe hohe Anerkennung von Branchenexperten, Designern und zahlreichen Markenpartnern.\n\nWährend der Ausrichtung veranstaltete PINSHIGAO mehrere technische Austauschrunden und führte vertiefte Gespräche mit Besuchern über Trends in der Möbelbeschlagindustrie und technologische Innovationsrichtungen. Mehrere bekannte Möbelmarken unterzeichneten vor Ort Kooperationsvereinbarungen und legten damit eine solide Grundlage für die weitere Expansion von PINSHIGAO auf nationalen und internationalen Märkten.',
    },
  },
  {
    slug: 'servo-lift-system',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
    content: {
      zh: '品仕高五金近日正式发布全新伺服驱动上翻门系统，为智能家居市场带来领先的五金解决方案。该系统采用先进的伺服驱动技术，支持触控开启与智能停止功能，用户可根据需要任意位置悬停。\n\n与传统上翻门系统相比，新品在静音性能、顺滑度和使用寿命方面均有显著提升。经过严格的实验室测试，该系统的使用寿命超过20万次开合循环，确保了长期使用的可靠性和稳定性。\n\n新品可广泛应用于厨房吊柜、客厅展示柜、办公文件柜等多种场景，支持手动和电动两种模式，满足不同用户的需求。品仕高产品经理表示，该产品的推出将进一步巩固品仕高在高端五金领域的市场地位，助力合作伙伴打造更智能、更便捷的家居体验。',
      en: 'PINSHIGAO Hardware has officially launched a brand-new servo-drive lift system, bringing a leading hardware solution to the smart home market. The system utilizes advanced servo-drive technology, supporting touch-open activation and intelligent stop functionality, allowing users to pause at any position as needed. \n\nCompared with traditional lift systems, the new product features significant improvements in noise reduction, motion smoothness, and service life. After rigorous laboratory testing, the system has a lifespan exceeding 200,000 open-close cycles, ensuring long-term reliability and stability. \n\nThe new product can be widely applied in kitchen wall cabinets, living room display cabinets, office file cabinets, and more. It supports both manual and electric modes to meet diverse user needs. According to the PINSHIGAO product manager, this launch will further solidify PINSHIGAO\'s market position in the premium hardware segment and help partners create smarter, more convenient home experiences.',
      de: 'PINSHIGAO Hardware hat ein brandneues servobetriebenes Klappensystem offiziell vorgestellt und bringt damit eine führende Beschlaglösung auf den Smart-Home-Markt. Das System nutzt fortschrittliche Servoantriebstechnologie, unterstützt Touch-Open-Aktivierung und intelligente Stoppfunktion, sodass der Benutzer es in jeder gewünschten Position anhalten kann. \n\nIm Vergleich zu herkömmlichen Klappensystemen bietet das neue Produkt deutliche Verbesserungen bei der Geräuschdämmung, der Bewegungsgeschwindigkeit und der Lebensdauer. Nach strengen Labortests übersteigt die Lebensdauer des Systems 200.000 Öffnungs- und Schließzyklen, was langfristige Zuverlässigkeit und Stabilität gewährleistet. \n\nDas neue Produkt kann vielseitig in Küchenhängeschränken, Wohnzimmervitrinenschränken, Büroaktenschränken und mehr eingesetzt werden. Es unterstützt sowohl manuelle als auch elektrische Modi, um unterschiedliche Benutzeranforderungen zu erfüllen. Laut dem PINSHIGAO-Produktmanager wird diese Markteinführung die Marktposition von PINSHIGAO im Premium-Beschlagsegment weiter stärken und Partnern helfen, intelligentere und bequemere Wohnerlebnisse zu schaffen.',
    },
  },
  {
    slug: 'foshan-factory-phase2',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80',
    content: {
      zh: '品仕高五金位于广东佛山的智能制造基地二期工程正式投产。该项目总投资额达2亿元人民币，新增建筑面积约3万平方米，引入全球领先的全自动装配线和智能仓储系统，使年产能提升至5000万件。\n\n二期工厂采用了工业4.0标准设计，配备了MES（制造执行系统）和ERP（企业资源计划系统），实现了从原材料入库到成品出库的全流程数字化管理。新产线的自动化率超过85%，大幅提升了生产效率和产品一致性。\n\n品仕高董事长表示："二期工厂的投产是公司发展历程中的重要里程碑。我们将继续加大在智能制造领域的投入，以更高质量的产品和更高效的服务，回馈全球客户的信任与支持。"\n\n新工厂的投产也为当地创造了约200个就业岗位，进一步推动了区域制造业的转型升级。品仕高计划在2026年前启动三期工程建设，届时总产能将突破1亿件大关。',
      en: 'Phase II of PINSHIGAO Hardware\'s Smart Manufacturing Base in Foshan, Guangdong, has officially commenced production. With a total investment of RMB 200 million, the project adds approximately 30,000 square meters of floor space and introduces globally leading fully automated assembly lines and intelligent warehousing systems, increasing annual capacity to 50 million units. \n\nThe Phase II factory adopts Industry 4.0 standards and is equipped with MES (Manufacturing Execution System) and ERP (Enterprise Resource Planning) systems, achieving full-process digital management from raw material receiving to finished product shipment. The automation rate of the new production lines exceeds 85%, significantly improving production efficiency and product consistency. \n\nThe Chairman of PINSHIGAO stated, "The commissioning of Phase II is an important milestone in the company\'s development history. We will continue to increase our investment in smart manufacturing, repaying the trust and support of global customers with higher quality products and more efficient service." \n\nThe new factory also created approximately 200 local jobs, further driving the transformation and upgrading of regional manufacturing. PINSHIGAO plans to initiate Phase III construction before 2026, which will push total annual capacity beyond 100 million units.',
      de: 'Phase II des intelligenten Fertigungsstandorts von PINSHIGAO Hardware in Foshan, Guangdong, hat offiziell die Produktion aufgenommen. Mit einer Gesamtinvestition von 200 Millionen RMB, etwa 30.000 Quadratmetern zusätzlicher Nutzfläche und der Einführung global führender vollautomatischer Montagelinien und intelligenter Lagersysteme steigt die Jahreskapazität auf 50 Millionen Einheiten. \n\nDie Fabrik der Phase II wurde nach Industrie-4.0-Standards konzipiert und ist mit MES- (Manufacturing Execution System) und ERP-Systemen ausgestattet, die ein vollständig digitales Management vom Rohwareneingang bis zum Fertigproduktversand ermöglichen. Die Automatisierungsrate der neuen Produktionslinien übersteigt 85 %, was die Produktionseffizienz und Produktkonsistenz erheblich verbessert. \n\nDer Vorsitzende von PINSHIGAO erklärte: "Die Inbetriebnahme von Phase II ist ein wichtiger Meilenstein in der Unternehmensentwicklung. Wir werden unsere Investitionen in die intelligente Fertigung weiter erhöhen und das Vertrauen und die Unterstützung unserer globalen Kunden mit noch höherer Produktqualität und effizienterem Service zurückzahlen." \n\nDas neue Werk schuf außerdem rund 200 lokale Arbeitsplätze und fördert die Transformation und Modernisierung der regionalen Fertigungsindustrie. PINSHIGAO plant, vor 2026 mit dem Bau von Phase III zu beginnen, was die Gesamtjahreskapazität auf über 100 Millionen Einheiten steigern wird.',
    },
  },
];

const slugToItemKey: Record<string, string> = {
  'furniture-fair-2024': 'item1',
  'servo-lift-system': 'item2',
  'foshan-factory-phase2': 'item3',
};

export default function NewsDetailPage() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = params.locale;
  const slug = params.slug;
  const t = useTranslations('news');
  const common = useTranslations('common');

  const article = newsData.find((n) => n.slug === slug);
  const itemKey = slugToItemKey[slug] || 'item1';
  const content =
    (article && article.content[locale as keyof typeof article.content]) ||
    (article && article.content.en) ||
    '';

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-[#1a3a5c] mb-4">
            {common('noResults')}
          </h1>
          <p className="text-gray-500 mb-8">{common('error')}</p>
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3a5c] text-white text-sm font-medium hover:bg-[#2a4a6c] transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            {common('back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[420px] md:h-[520px] overflow-hidden bg-gray-900">
        <img
          src={article.image}
          alt={t(`${itemKey}.title`)}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1280px] mx-auto px-6 pb-12 md:pb-16">
          <span className="inline-block text-[#c8a96e] text-sm font-medium tracking-[0.2em] uppercase mb-3">
            {t('title')}
          </span>
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl">
            {t(`${itemKey}.title`)}
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <i className="fa-regular fa-calendar text-[#c8a96e] text-sm"></i>
            <span className="text-white/70 text-sm">{t(`${itemKey}.date`)}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="max-w-[860px] mx-auto px-6 py-12 md:py-16">
        {/* Back Button */}
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors mb-8 group"
        >
          <i className="fa-solid fa-arrow-left text-xs transition-transform group-hover:-translate-x-1"></i>
          {common('back')}
        </Link>

        {/* Article Body */}
        <article className="prose prose-lg max-w-none prose-headings:text-[#1a3a5c] prose-p:text-gray-600 prose-p:leading-relaxed">
          {content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors group"
          >
            <i className="fa-solid fa-arrow-left text-xs transition-transform group-hover:-translate-x-1"></i>
            {common('back')}
          </Link>
          <Link
            href={`/${locale}/news`}
            className="text-sm text-[#1a3a5c] hover:text-[#c8a96e] transition-colors font-medium"
          >
            {t('title')}
            <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
          </Link>
        </div>
      </section>
    </div>
  );
}
