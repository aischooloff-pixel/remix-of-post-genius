export type Category = 'scripts' | 'automation' | 'products' | 'services' | 'manuals';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  icon: string;
  popular?: boolean;
}

export const categories: Record<Category, { name: string; icon: string }> = {
  scripts: { name: 'Скрипты', icon: 'Code' },
  automation: { name: 'Автоматизации', icon: 'Bot' },
  products: { name: 'Товары', icon: 'Package' },
  services: { name: 'Услуги', icon: 'Briefcase' },
  manuals: { name: 'Мануалы', icon: 'BookOpen' },
};

export const products: Product[] = [
  // Скрипты
  {
    id: 'spam-script',
    name: 'Спам ЛС/Комы/Чаты',
    description: 'Мощный скрипт для рассылки сообщений в личные сообщения, комментарии и чаты',
    price: 2500,
    category: 'scripts',
    icon: 'MessageSquare',
    popular: true,
  },
  {
    id: 'parser',
    name: 'Парсер пользователей',
    description: 'Сбор базы писавших пользователей и парсинг аудитории',
    price: 1800,
    category: 'scripts',
    icon: 'Users',
  },
  {
    id: 'inviter',
    name: 'Инвайтер',
    description: 'Автоматический инвайт пользователей в группы и каналы',
    price: 2000,
    category: 'scripts',
    icon: 'UserPlus',
  },
  {
    id: 'vk-spammer',
    name: 'ВК Спамер',
    description: 'Продвинутый инструмент для рассылки во ВКонтакте',
    price: 3000,
    category: 'scripts',
    icon: 'Send',
    popular: true,
  },

  // Автоматизации
  {
    id: 'ai-assistant',
    name: 'ИИ Ассистент',
    description: 'Умный ассистент с искусственным интеллектом для автоматизации задач',
    price: 5000,
    category: 'automation',
    icon: 'Brain',
    popular: true,
  },
  {
    id: 'ai-posts',
    name: 'ИИ Посты',
    description: 'Автоматическая генерация и публикация постов с помощью ИИ',
    price: 4000,
    category: 'automation',
    icon: 'Sparkles',
  },

  // Товары
  {
    id: 'proxy',
    name: 'Прокси',
    description: 'Приватные прокси высокого качества для любых задач',
    price: 500,
    category: 'products',
    icon: 'Shield',
  },
  {
    id: 'virtual-numbers',
    name: 'Виртуальные номера',
    description: 'Номера для регистрации и верификации аккаунтов',
    price: 150,
    category: 'products',
    icon: 'Phone',
    popular: true,
  },
  {
    id: 'tiktok-docs',
    name: 'ТикТок доки',
    description: 'Документы для верификации и восстановления аккаунтов TikTok',
    price: 800,
    category: 'products',
    icon: 'FileText',
  },
  {
    id: 'social-boost',
    name: 'Накрутка соц сетей',
    description: 'Подписчики, лайки, просмотры для всех социальных сетей',
    price: 300,
    category: 'products',
    icon: 'TrendingUp',
  },
  {
    id: 'chat-folders',
    name: 'Папки с чатами',
    description: 'Готовые базы чатов для рассылки и продвижения',
    price: 1200,
    category: 'products',
    icon: 'Folder',
  },
  {
    id: 'vps',
    name: 'VPS',
    description: 'Виртуальные серверы для скриптов и автоматизации',
    price: 700,
    category: 'products',
    icon: 'Server',
  },
  {
    id: 'temp-email',
    name: 'Временные почты',
    description: 'Одноразовые email адреса для регистраций',
    price: 100,
    category: 'products',
    icon: 'Mail',
  },

  // Услуги
  {
    id: 'design',
    name: 'Дизайн',
    description: 'Профессиональный дизайн логотипов, баннеров, креативов',
    price: 3000,
    category: 'services',
    icon: 'Palette',
  },
  {
    id: 'development',
    name: 'Разработка проектов',
    description: 'Создание ботов, сайтов, скриптов под ключ',
    price: 15000,
    category: 'services',
    icon: 'Code2',
    popular: true,
  },

  // Мануалы
  {
    id: 'manual-115fz',
    name: 'Снятие 115 ФЗ',
    description: 'Подробный гайд по снятию ограничений 115-ФЗ',
    price: 2000,
    category: 'manuals',
    icon: 'Scale',
  },
  {
    id: 'tiktok-warmup',
    name: 'Прогрев ТикТок',
    description: 'Мануал по правильному прогреву аккаунтов TikTok',
    price: 1500,
    category: 'manuals',
    icon: 'Flame',
  },
];
