import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log(`✅ Admin user: ${admin.username}`);

  // Create default settings
  const defaultSettings = [
    { key: 'siteTitle', value: '品仕高五金 | PINSHIGAO Hardware' },
    { key: 'siteDescription', value: '专业家具五金解决方案 — 铰链、滑轨、抽屉系统、上翻门系统' },
    { key: 'contactEmail', value: 'info@pinshigao.com' },
    { key: 'contactPhone', value: '+86 400-888-9999' },
    { key: 'contactAddress', value: '广东省佛山市顺德区勒流街道' },
    { key: 'copyright', value: '© 2024 品仕高五金有限公司 版权所有' },
    { key: 'footerAbout', value: '品仕高五金成立于2004年，专业从事家具五金研发、制造与销售。' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({ where: { key: setting.key }, update: {}, create: setting });
  }
  console.log('✅ Settings created');

  // Create product categories
  const categories = [
    { nameZh: '铰链系统', nameEn: 'Hinge Systems', nameDe: 'Scharniersysteme', slug: 'hinges', order: 1 },
    { nameZh: '抽屉系统', nameEn: 'Drawer Systems', nameDe: 'Schubladensysteme', slug: 'drawers', order: 2 },
    { nameZh: '上翻门系统', nameEn: 'Lift Systems', nameDe: 'Klappenbeschläge', slug: 'lifts', order: 3 },
    { nameZh: '滑轨系统', nameEn: 'Sliding Systems', nameDe: 'Auszugssysteme', slug: 'slides', order: 4 },
    { nameZh: '拉手系列', nameEn: 'Handle Collection', nameDe: 'Griffkollektion', slug: 'handles', order: 5 },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }
  console.log('✅ Categories created');

  // Create sample featured product
  const hingeCat = await prisma.category.findUnique({ where: { slug: 'hinges' } });
  if (hingeCat) {
    await prisma.product.upsert({
      where: { slug: 'psg-pro-hinge' },
      update: {},
      create: {
        slug: 'psg-pro-hinge',
        nameZh: 'PSG-Pro 系列阻尼铰链',
        nameEn: 'PSG-Pro Series Damped Hinge',
        nameDe: 'PSG-Pro Serie Gedämpftes Scharnier',
        subtitleZh: '旗舰产品 · 20万次开合保证',
        subtitleEn: 'Flagship Product · 200,000 Cycle Tested',
        subtitleDe: 'Flaggschiff · 200.000 Zyklen geprüft',
        descZh: '内置集成阻尼器，45mm短臂设计，兼容多种柜体厚度。三维调节能力±3mm，安装便捷。',
        descEn: 'Built-in integrated damper, 45mm short-arm design, 3D adjustment ±3mm.',
        descDe: 'Integrierter Dämpfer, 45mm Kurzarm-Design, 3D-Verstellung ±3mm.',
        categoryId: hingeCat.id,
        featured: true,
        order: 1,
      },
    });
  }
  console.log('✅ Products created');

  // Create sample news
  await prisma.news.upsert({
    where: { slug: 'furniture-fair-2024' },
    update: {},
    create: {
      slug: 'furniture-fair-2024',
      titleZh: '品仕高亮相2024中国国际家具展',
      titleEn: 'PINSHIGAO at China International Furniture Fair 2024',
      titleDe: 'PINSHIGAO auf der China International Furniture Fair 2024',
      summaryZh: '全新PSG-Pro系列产品首次公开亮相，获行业专家高度评价。',
      summaryEn: 'The new PSG-Pro series debuted publicly.',
      summaryDe: 'Die neue PSG-Pro Serie feierte ihr öffentliches Debüt.',
      date: new Date('2024-12-15'),
    },
  });
  console.log('✅ News created');

  // Create default "about" page with full HTML
  const aboutHtmlZh = `<div style="min-height:100vh;background:#fff;font-family:system-ui,sans-serif">
  <section style="background:linear-gradient(135deg,#1a3a5c,#2a5a8c);padding:100px 20px;text-align:center;color:#fff">
    <h1 style="font-size:48px;font-weight:700;margin-bottom:16px">关于品仕高</h1>
    <p style="font-size:20px;color:#c8a96e;margin-bottom:24px">精工品质 · 触心而动</p>
    <div style="width:60px;height:3px;background:#c8a96e;margin:0 auto"></div>
  </section>
  <section style="max-width:1200px;margin:0 auto;padding:80px 20px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">
      <div>
        <p style="color:#c8a96e;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">公司简介</p>
        <h2 style="font-size:32px;font-weight:700;color:#1a3a5c;margin-bottom:24px">品仕高五金有限公司</h2>
        <p style="color:#666;line-height:1.8;margin-bottom:16px">品仕高五金有限公司成立于2004年，总部位于广东佛山——中国五金之都，专业从事家具五金研发、制造与销售。主要产品包括铰链、抽屉系统、上翻门系统、滑轨系统、拉手等。</p>
        <p style="color:#666;line-height:1.8">经过20年的发展，品仕高已服务全球2000多家家具制造企业，产品出口至50多个国家和地区，年产能突破5000万件。</p>
      </div>
      <div style="background:#f5f7fa;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px">工厂实景图片</div>
    </div>
  </section>
  <section style="background:#f5f7fa;padding:80px 20px;text-align:center">
    <div style="max-width:1200px;margin:0 auto">
      <p style="color:#c8a96e;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">核心价值观</p>
      <h2 style="font-size:32px;font-weight:700;color:#1a3a5c;margin-bottom:48px">品质 · 创新 · 服务</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px">
        <div style="background:#fff;padding:40px 32px;border:1px solid #eee;text-align:center">
          <div style="font-size:40px;color:#1a3a5c;margin-bottom:16px">&#9733;</div>
          <h3 style="font-size:20px;font-weight:700;color:#1a3a5c;margin-bottom:12px">品质</h3>
          <p style="color:#666;font-size:14px;line-height:1.6">德国精工标准，全流程品质管控，每一件产品都经过严格测试</p>
        </div>
        <div style="background:#fff;padding:40px 32px;border:1px solid #eee;text-align:center">
          <div style="font-size:40px;color:#1a3a5c;margin-bottom:16px">&#9733;</div>
          <h3 style="font-size:20px;font-weight:700;color:#1a3a5c;margin-bottom:12px">创新</h3>
          <p style="color:#666;font-size:14px;line-height:1.6">持续研发投入，30余项专利技术，引领家具五金行业技术变革</p>
        </div>
        <div style="background:#fff;padding:40px 32px;border:1px solid #eee;text-align:center">
          <div style="font-size:40px;color:#1a3a5c;margin-bottom:16px">&#9733;</div>
          <h3 style="font-size:20px;font-weight:700;color:#1a3a5c;margin-bottom:12px">服务</h3>
          <p style="color:#666;font-size:14px;line-height:1.6">专业销售与技术团队，提供一站式选型、安装、售后保障服务</p>
        </div>
      </div>
    </div>
  </section>
  <section style="background:#1a3a5c;padding:80px 20px;text-align:center">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:24px">
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">2000+</div><div style="color:#fff;opacity:0.7;font-size:14px">全球客户</div></div>
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">50+</div><div style="color:#fff;opacity:0.7;font-size:14px">出口国家</div></div>
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">5000万</div><div style="color:#fff;opacity:0.7;font-size:14px">年产能(件)</div></div>
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">20</div><div style="color:#fff;opacity:0.7;font-size:14px">行业经验(年)</div></div>
    </div>
  </section>
  <section style="max-width:1200px;margin:0 auto;padding:80px 20px;text-align:center">
    <div style="max-width:800px;margin:0 auto">
      <div style="font-size:72px;color:#c8a96e;opacity:0.3;margin-bottom:16px">&ldquo;</div>
      <blockquote style="font-size:28px;font-weight:300;color:#1a3a5c;line-height:1.5;margin-bottom:32px">精工品质，触心而动</blockquote>
      <p style="color:#666;line-height:1.8">品仕高五金始终秉持"精工品质，触心而动"的品牌理念，以德国精工标准为基石，融合意大利设计美学，致力于为全球家具制造商提供卓越的五金解决方案。</p>
    </div>
  </section>
</div>`;

  const aboutHtmlEn = `<div style="min-height:100vh;background:#fff;font-family:system-ui,sans-serif">
  <section style="background:linear-gradient(135deg,#1a3a5c,#2a5a8c);padding:100px 20px;text-align:center;color:#fff">
    <h1 style="font-size:48px;font-weight:700;margin-bottom:16px">About PINSHIGAO</h1>
    <p style="font-size:20px;color:#c8a96e;margin-bottom:24px">Precision Engineering · Inspired Living</p>
    <div style="width:60px;height:3px;background:#c8a96e;margin:0 auto"></div>
  </section>
  <section style="max-width:1200px;margin:0 auto;padding:80px 20px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">
      <div>
        <p style="color:#c8a96e;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">Company Profile</p>
        <h2 style="font-size:32px;font-weight:700;color:#1a3a5c;margin-bottom:24px">PINSHIGAO Hardware Co., Ltd.</h2>
        <p style="color:#666;line-height:1.8;margin-bottom:16px">Founded in 2004 and headquartered in Foshan, Guangdong — China's Hardware Capital — PINSHIGAO Hardware Co., Ltd. specializes in the R&D, manufacturing, and sales of furniture hardware, including hinges, drawer systems, lift systems, sliding systems, handles, and more.</p>
        <p style="color:#666;line-height:1.8">With 20 years of expertise, PINSHIGAO has served over 2,000 furniture manufacturers globally, exporting to 50+ countries with an annual capacity exceeding 50 million units.</p>
      </div>
      <div style="background:#f5f7fa;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px">Factory Image</div>
    </div>
  </section>
  <section style="background:#f5f7fa;padding:80px 20px;text-align:center">
    <div style="max-width:1200px;margin:0 auto">
      <p style="color:#c8a96e;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">Core Values</p>
      <h2 style="font-size:32px;font-weight:700;color:#1a3a5c;margin-bottom:48px">Quality · Innovation · Service</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px">
        <div style="background:#fff;padding:40px 32px;border:1px solid #eee;text-align:center">
          <div style="font-size:40px;color:#1a3a5c;margin-bottom:16px">&#9733;</div>
          <h3 style="font-size:20px;font-weight:700;color:#1a3a5c;margin-bottom:12px">Quality</h3>
          <p style="color:#666;font-size:14px;line-height:1.6">German precision standards, full-process quality control, every product rigorously tested</p>
        </div>
        <div style="background:#fff;padding:40px 32px;border:1px solid #eee;text-align:center">
          <div style="font-size:40px;color:#1a3a5c;margin-bottom:16px">&#9733;</div>
          <h3 style="font-size:20px;font-weight:700;color:#1a3a5c;margin-bottom:12px">Innovation</h3>
          <p style="color:#666;font-size:14px;line-height:1.6">Continuous R&D investment, 30+ patented technologies, leading industry transformation</p>
        </div>
        <div style="background:#fff;padding:40px 32px;border:1px solid #eee;text-align:center">
          <div style="font-size:40px;color:#1a3a5c;margin-bottom:16px">&#9733;</div>
          <h3 style="font-size:20px;font-weight:700;color:#1a3a5c;margin-bottom:12px">Service</h3>
          <p style="color:#666;font-size:14px;line-height:1.6">Professional sales and technical team, one-stop selection, installation, and after-sales support</p>
        </div>
      </div>
    </div>
  </section>
  <section style="background:#1a3a5c;padding:80px 20px;text-align:center">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:24px">
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">2,000+</div><div style="color:#fff;opacity:0.7;font-size:14px">Global Clients</div></div>
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">50+</div><div style="color:#fff;opacity:0.7;font-size:14px">Export Countries</div></div>
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">50M</div><div style="color:#fff;opacity:0.7;font-size:14px">Annual Capacity</div></div>
      <div><div style="font-size:48px;font-weight:700;color:#c8a96e;margin-bottom:8px">20</div><div style="color:#fff;opacity:0.7;font-size:14px">Years Expertise</div></div>
    </div>
  </section>
  <section style="max-width:1200px;margin:0 auto;padding:80px 20px;text-align:center">
    <div style="max-width:800px;margin:0 auto">
      <div style="font-size:72px;color:#c8a96e;opacity:0.3;margin-bottom:16px">&ldquo;</div>
      <blockquote style="font-size:28px;font-weight:300;color:#1a3a5c;line-height:1.5;margin-bottom:32px">Precision Engineering, Inspired Living</blockquote>
      <p style="color:#666;line-height:1.8">PINSHIGAO Hardware is dedicated to providing high-quality hardware solutions for furniture manufacturers worldwide. We blend German precision engineering with Italian design aesthetics.</p>
    </div>
  </section>
</div>`;

  const aboutHtmlDe = `<div style="min-height:100vh;background:#fff;font-family:system-ui,sans-serif">
  <section style="background:linear-gradient(135deg,#1a3a5c,#2a5a8c);padding:100px 20px;text-align:center;color:#fff">
    <h1 style="font-size:48px;font-weight:700;margin-bottom:16px">&uuml;ber PINSHIGAO</h1>
    <p style="font-size:20px;color:#c8a96e;margin-bottom:24px">Pr&auml;zisionstechnik &middot; Bewegendes Wohnen</p>
    <div style="width:60px;height:3px;background:#c8a96e;margin:0 auto"></div>
  </section>
  <section style="max-width:1200px;margin:0 auto;padding:80px 20px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center">
      <div>
        <p style="color:#c8a96e;font-size:13px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px">Unternehmensprofil</p>
        <h2 style="font-size:32px;font-weight:700;color:#1a3a5c;margin-bottom:24px">PINSHIGAO Hardware Co., Ltd.</h2>
        <p style="color:#666;line-height:1.8;margin-bottom:16px">Die PINSHIGAO Hardware Co., Ltd. wurde 2004 gegr&uuml;ndet mit Hauptsitz in Foshan, Guangdong. Das Unternehmen ist spezialisiert auf Forschung, Entwicklung, Herstellung und Vertrieb von M&ouml;belbeschl&auml;gen.</p>
        <p style="color:#666;line-height:1.8">Mit &uuml;ber 2.000 Kunden weltweit exportiert PINSHIGAO in mehr als 50 L&auml;nder mit einer j&auml;hrlichen Produktionskapazit&auml;t von &uuml;ber 50 Millionen Einheiten.</p>
      </div>
      <div style="background:#f5f7fa;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px">Fabrikaufnahme</div>
    </div>
  </section>
</div>`;

  await prisma.page.upsert({
    where: { slug: 'about' },
    update: {},
    create: {
      slug: 'about',
      titleZh: '关于品仕高',
      titleEn: 'About PINSHIGAO',
      titleDe: '&uuml;ber PINSHIGAO',
      contentZh: aboutHtmlZh,
      contentEn: aboutHtmlEn,
      contentDe: aboutHtmlDe,
      published: true,
    },
  });
  console.log('✅ About page created');

  // Create default "solutions" page with full HTML
  const solutionsHtmlZh = `<div style="min-height:100vh;background:#fff;font-family:system-ui,sans-serif">
  <section style="background:linear-gradient(135deg,#1a3a5c,#0f2640);padding:100px 20px;text-align:center;color:#fff">
    <h1 style="font-size:42px;font-weight:700;margin-bottom:16px">应用解决方案</h1>
    <p style="font-size:16px;color:rgba(255,255,255,0.6);max-width:600px;margin:0 auto">从厨房到衣帽间到办公室，为每个空间提供全面的五金解决方案</p>
  </section>
  <section style="max-width:1200px;margin:0 auto;padding:80px 20px">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px">
      <div style="border:1px solid #eee;overflow:hidden">
        <div style="background:linear-gradient(135deg,rgba(180,120,50,0.8),rgba(200,169,110,0.6));height:200px;display:flex;align-items:center;justify-content:center">
          <div style="font-size:48px;color:rgba(255,255,255,0.7)">&#127860;</div>
        </div>
        <div style="padding:32px">
          <h3 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:12px">厨房解决方案</h3>
          <p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:24px">完整的厨房五金系统，包括优质铰链、抽屉滑轨和升降机构。提供静音阻尼、平稳滑动和持久耐用的现代厨房体验。</p>
          <div style="border-top:1px solid #f0f0f0;padding-top:20px">
            <p style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">适用产品</p>
            <ul style="list-style:none;padding:0;margin:0">
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>阻尼铰链</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>抽屉系统</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>上翻门系统</li>
            </ul>
          </div>
        </div>
      </div>
      <div style="border:1px solid #eee;overflow:hidden">
        <div style="background:linear-gradient(135deg,rgba(30,60,100,0.8),rgba(50,90,140,0.6));height:200px;display:flex;align-items:center;justify-content:center">
          <div style="font-size:48px;color:rgba(255,255,255,0.7)">&#128716;</div>
        </div>
        <div style="padding:32px">
          <h3 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:12px">衣帽间解决方案</h3>
          <p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:24px">集成的衣帽间五金系统，结合平滑移门、隐藏式抽屉滑轨和人体工学拉手设计，打造整洁优雅的收纳空间。</p>
          <div style="border-top:1px solid #f0f0f0;padding-top:20px">
            <p style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">适用产品</p>
            <ul style="list-style:none;padding:0;margin:0">
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>滑轨系统</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>隐藏式导轨</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>拉手系列</li>
            </ul>
          </div>
        </div>
      </div>
      <div style="border:1px solid #eee;overflow:hidden">
        <div style="background:linear-gradient(135deg,rgba(50,60,70,0.8),rgba(80,90,100,0.6));height:200px;display:flex;align-items:center;justify-content:center">
          <div style="font-size:48px;color:rgba(255,255,255,0.7)">&#127970;</div>
        </div>
        <div style="padding:32px">
          <h3 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:12px">办公解决方案</h3>
          <p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:24px">专业的办公家具五金，包括重型滑轨、锁系统和线缆管理方案，专为日常商业使用设计，以可靠性为核心。</p>
          <div style="border-top:1px solid #f0f0f0;padding-top:20px">
            <p style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">适用产品</p>
            <ul style="list-style:none;padding:0;margin:0">
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>重型滑轨</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>锁系统</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>线缆管理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section style="background:#f5f7fa;padding:60px 20px;text-align:center">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:24px">
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">2000+</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">合作客户</div></div>
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">50+</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">出口国家</div></div>
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">5000万</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">年产能</div></div>
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">8</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">产品系列</div></div>
    </div>
  </section>
  <section style="background:#1a3a5c;padding:80px 20px;text-align:center;color:#fff">
    <h2 style="font-size:28px;font-weight:700;margin-bottom:16px">需要定制解决方案？</h2>
    <p style="color:rgba(255,255,255,0.6);max-width:600px;margin:0 auto 32px">我们的工程团队与家具制造商紧密合作，为您的特定应用需求开发定制五金解决方案。</p>
    <a href="/zh/contact" style="display:inline-block;padding:14px 40px;background:#c8a96e;color:#fff;text-decoration:none;font-size:14px;font-weight:500">联系我们</a>
  </section>
</div>`;

  const solutionsHtmlEn = `<div style="min-height:100vh;background:#fff;font-family:system-ui,sans-serif">
  <section style="background:linear-gradient(135deg,#1a3a5c,#0f2640);padding:100px 20px;text-align:center;color:#fff">
    <h1 style="font-size:42px;font-weight:700;margin-bottom:16px">Application Solutions</h1>
    <p style="font-size:16px;color:rgba(255,255,255,0.6);max-width:600px;margin:0 auto">Comprehensive hardware solutions for every space — from kitchen to wardrobe to office</p>
  </section>
  <section style="max-width:1200px;margin:0 auto;padding:80px 20px">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px">
      <div style="border:1px solid #eee;overflow:hidden">
        <div style="background:linear-gradient(135deg,rgba(180,120,50,0.8),rgba(200,169,110,0.6));height:200px;display:flex;align-items:center;justify-content:center;font-size:48px;color:rgba(255,255,255,0.7)">&#127860;</div>
        <div style="padding:32px">
          <h3 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:12px">Kitchen Solutions</h3>
          <p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:24px">Complete kitchen hardware systems featuring premium hinges, drawer slides, and lift mechanisms. Our kitchen solutions deliver silent damping, smooth motion, and long-lasting durability.</p>
          <div style="border-top:1px solid #f0f0f0;padding-top:20px">
            <p style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Products</p>
            <ul style="list-style:none;padding:0;margin:0">
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Damped Hinges</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Drawer Systems</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Lift Systems</li>
            </ul>
          </div>
        </div>
      </div>
      <div style="border:1px solid #eee;overflow:hidden">
        <div style="background:linear-gradient(135deg,rgba(30,60,100,0.8),rgba(50,90,140,0.6));height:200px;display:flex;align-items:center;justify-content:center;font-size:48px;color:rgba(255,255,255,0.7)">&#128716;</div>
        <div style="padding:32px">
          <h3 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:12px">Wardrobe Solutions</h3>
          <p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:24px">Integrated wardrobe hardware systems combining smooth sliding doors, concealed drawer rails, and ergonomic handle designs. Create organized, elegant storage spaces.</p>
          <div style="border-top:1px solid #f0f0f0;padding-top:20px">
            <p style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Products</p>
            <ul style="list-style:none;padding:0;margin:0">
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Sliding Systems</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Concealed Rails</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Handle Collection</li>
            </ul>
          </div>
        </div>
      </div>
      <div style="border:1px solid #eee;overflow:hidden">
        <div style="background:linear-gradient(135deg,rgba(50,60,70,0.8),rgba(80,90,100,0.6));height:200px;display:flex;align-items:center;justify-content:center;font-size:48px;color:rgba(255,255,255,0.7)">&#127970;</div>
        <div style="padding:32px">
          <h3 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:12px">Office Solutions</h3>
          <p style="color:#666;font-size:14px;line-height:1.6;margin-bottom:24px">Professional office furniture hardware including heavy-duty slides, lock systems, and cable management solutions. Designed for daily commercial use with reliability at the core.</p>
          <div style="border-top:1px solid #f0f0f0;padding-top:20px">
            <p style="font-size:11px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Products</p>
            <ul style="list-style:none;padding:0;margin:0">
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Heavy-duty Slides</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Lock Systems</li>
              <li style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;margin-bottom:8px"><span style="width:6px;height:6px;background:#c8a96e;border-radius:50%"></span>Cable Management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section style="background:#f5f7fa;padding:60px 20px;text-align:center">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:24px">
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">2,000+</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">Clients Served</div></div>
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">50+</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">Countries Exported</div></div>
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">50M</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">Annual Output</div></div>
      <div><div style="font-size:28px;font-weight:700;color:#1a3a5c;margin-bottom:4px">8</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:2px">Product Series</div></div>
    </div>
  </section>
  <section style="background:#1a3a5c;padding:80px 20px;text-align:center;color:#fff">
    <h2 style="font-size:28px;font-weight:700;margin-bottom:16px">Need a Custom Solution?</h2>
    <p style="color:rgba(255,255,255,0.6);max-width:600px;margin:0 auto 32px">Our engineering team works closely with furniture manufacturers to develop tailored hardware solutions for your specific application requirements.</p>
    <a href="/en/contact" style="display:inline-block;padding:14px 40px;background:#c8a96e;color:#fff;text-decoration:none;font-size:14px;font-weight:500">Contact Us</a>
  </section>
</div>`;

  await prisma.page.upsert({
    where: { slug: 'solutions' },
    update: {},
    create: {
      slug: 'solutions',
      titleZh: '应用解决方案',
      titleEn: 'Application Solutions',
      titleDe: 'Anwendungsl&ouml;sungen',
      contentZh: solutionsHtmlZh,
      contentEn: solutionsHtmlEn,
      contentDe: solutionsHtmlZh,
      published: true,
    },
  });
  console.log('✅ Solutions page created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
