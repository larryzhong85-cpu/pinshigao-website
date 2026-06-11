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
  console.log('🎉 Seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
