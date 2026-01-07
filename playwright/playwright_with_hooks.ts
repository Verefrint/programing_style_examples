import { test, expect, Page, BrowserContext } from '@playwright/test';


// Интерфейс для тестовых данных
interface TestData {
  username: string;
  password: string;
  products: string[];
}

test.describe('Продвинутые тесты с хуками', () => {
  
  // Общие переменные для всей группы тестов
  let page: Page;
  let context: BrowserContext;
  let testData: TestData;
  let screenshotCounter = 0;
  
  // Хук выполняется ОДИН РАЗ перед всеми тестами
  test.beforeAll(async ({ browser }) => {
    console.log('🚀 ИНИЦИАЛИЗАЦИЯ: Начинается настройка всех тестов');
    
    // Загружаем тестовые данные (например, из конфига)
    testData = {
      username: 'standard_user',
      password: 'secret_sauce',
      products: [
        'sauce-labs-backpack',
        'sauce-labs-bike-light',
        'sauce-labs-bolt-t-shirt'
      ]
    };
    
    console.log(`📊 Загружено ${testData.products.length} тестовых продуктов`);
    
    // Можно инициализировать базу данных, API клиенты и т.д.
    // Например: await initializeTestDatabase();
  });
  
  // Хук выполняется ПЕРЕД КАЖДЫМ тестом
  test.beforeEach(async ({ browser }, testInfo) => {
    console.log(`\n🎬 ПОДГОТОВКА: Начинается тест "${testInfo.title}"`);
    
    // Создаем новый контекст с настройками
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'ru-RU',
      timezoneId: 'Europe/Moscow',
      geolocation: { latitude: 55.7558, longitude: 37.6173 }, // Москва
      permissions: ['geolocation'],
      recordVideo: {
        dir: 'test-results/videos/',
        size: { width: 1280, height: 720 }
      }
    });
    
    // Включаем трассировку для сложных тестов
    await context.tracing.start({
      screenshots: true,
      snapshots: true
    });
    
    page = await context.newPage();
    
    // Устанавливаем таймауты для этого теста
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(40000);
    
    // Настраиваем перехват запросов
    await page.route('**/*', route => {
      const url = route.request().url();
      if (url.includes('analytics')) {
        // Блокируем аналитику для ускорения тестов
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Выполняем авторизацию
    console.log('🔐 Выполняем авторизацию...');
    await page.goto('https://www.saucedemo.com');
    
    await page.locator('#user-name').fill(testData.username);
    await page.locator('#password').fill(testData.password);
    
    // Делаем скриншот ДО клика (для отладки)
    await page.screenshot({ 
      path: `test-results/screenshots/before-login-${screenshotCounter++}.png` 
    });
    
    await page.locator('#login-button').click();
    
    // Ждем успешной авторизации
    await expect(page.locator('.title')).toHaveText('Products', { timeout: 10000 });
    
    // Делаем скриншот ПОСЛЕ авторизации
    await page.screenshot({ 
      path: `test-results/screenshots/after-login-${screenshotCounter++}.png` 
    });
    
    console.log('✅ Авторизация успешна');
  });
  
  // Хук выполняется ПОСЛЕ КАЖДОГО теста
  test.afterEach(async ({}, testInfo) => {
    console.log(`🧹 ОЧИСТКА: Завершение теста "${testInfo.title}"`);
    
    // Сохраняем трассировку если тест упал
    if (testInfo.status === 'failed') {
      console.log('⚠️ Тест упал, сохраняем трассировку...');
      await context.tracing.stop({ 
        path: `test-results/traces/${testInfo.title}-${Date.now()}.zip` 
      });
      
      // Делаем скриншот на момент падения
      await page.screenshot({ 
        path: `test-results/screenshots/failed-${testInfo.title}-${Date.now()}.png`,
        fullPage: true 
      });
    } else {
      // Останавливаем трассировку без сохранения
      await context.tracing.stop();
    }
    
    // Очищаем корзину
    try {
      await page.goto('https://www.saucedemo.com/cart.html');
      const removeButtons = page.locator('[data-test^="remove-"]');
      const count = await removeButtons.count();
      
      if (count > 0) {
        console.log(`🗑️ Очищаем ${count} товаров из корзины`);
        for (let i = 0; i < count; i++) {
          await removeButtons.first().click();
          await page.waitForTimeout(100); // Небольшая задержка
        }
      }
    } catch (error) {
      console.log('⚠️ Не удалось очистить корзину:', error.message);
    }
    
    // Закрываем контекст (и все связанные ресурсы)
    await context.close();
    
    console.log(`📊 Результат теста: ${testInfo.status}`);
    console.log(`⏱️ Длительность: ${testInfo.duration}ms`);
  });
  
  // Хук выполняется ОДИН РАЗ после всех тестов
  test.afterAll(async () => {
    console.log('\n🏁 ЗАВЕРШЕНИЕ: Все тесты выполнены');
    
    // Очищаем глобальные ресурсы
    // Например: await cleanupTestDatabase();
    
    // Генерируем отчет
    console.log('📈 Генерация итогового отчета...');
    const totalScreenshots = screenshotCounter;
    console.log(`🖼️ Создано скриншотов: ${totalScreenshots}`);
    
    // Можно отправить уведомление, обновить дашборд и т.д.
  });
  
  // ТЕСТЫ РАЗНОЙ СЛОЖНОСТИ
  
  test('быстрый тест: проверка наличия элементов', async () => {
    console.log('🔍 Проверяем основные элементы интерфейса');
    
    // Проверяем, что все нужные элементы присутствуют
    await expect(page.locator('.inventory_list')).toBeVisible();
    await expect(page.locator('.shopping_cart_link')).toBeVisible();
    await expect(page.locator('[data-test="product_sort_container"]')).toBeVisible();
    
    // Проверяем количество товаров
    const products = page.locator('.inventory_item');
    await expect(products).toHaveCount(6);
    
    console.log('✅ Все элементы на месте');
  });
  
  test('средний тест: работа с несколькими товарами', async () => {
    console.log('🛒 Работаем с несколькими товарами');
    
    // Добавляем несколько товаров
    for (const product of testData.products.slice(0, 2)) {
      const selector = `[data-test="add-to-cart-${product}"]`;
      await page.locator(selector).click();
      console.log(`✅ Добавлен товар: ${product}`);
      await page.waitForTimeout(200); // Имитация человеческой задержки
    }
    
    // Проверяем счетчик корзины
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
    
    // Переходим в корзину
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(2);
    
    // Удаляем один товар
    await page.locator('[data-test^="remove-"]').first().click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await expect(page.locator('.cart_item')).toHaveCount(1);
    
    console.log('✅ Тест с несколькими товарами завершен');
  });
  
  test('сложный тест: stress test корзины', async ({}, testInfo) => {
    // Помечаем тест как медленный (увеличиваем таймауты)
    testInfo.annotations.push({ type: 'slow', description: 'Stress test' });
    test.setTimeout(60000);
    
    console.log('⚡ Stress test корзины');
    
    const allProducts = [
      'sauce-labs-backpack',
      'sauce-labs-bike-light',
      'sauce-labs-bolt-t-shirt',
      'sauce-labs-fleece-jacket',
      'sauce-labs-onesie',
      'test.allthethings()-t-shirt-(red)'
    ];
    
    // Быстро добавляем все товары
    for (const product of allProducts) {
      const selector = `[data-test="add-to-cart-${product}"]`;
      await page.locator(selector).click();
    }
    
    await expect(page.locator('.shopping_cart_badge')).toHaveText('6');
    
    // Переходим в корзину
    await page.locator('.shopping_cart_link').click();
    
    // Удаляем все товары по одному
    let removedCount = 0;
    while (true) {
      const removeButtons = page.locator('[data-test^="remove-"]');
      const count = await removeButtons.count();
      
      if (count === 0) break;
      
      await removeButtons.first().click();
      removedCount++;
      await page.waitForTimeout(50); // Небольшая задержка
    }
    
    console.log(`🗑️ Удалено товаров: ${removedCount}`);
    await expect(page.locator('.shopping_cart_badge')).toBeHidden();
    
    // Возвращаемся на главную
    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page.locator('.title')).toHaveText('Products');
    
    console.log('✅ Stress test завершен успешно');
  });
  
  test('тест с ошибкой: демонстрация обработки failures', async () => {
    console.log('🧪 Тест с преднамеренной ошибкой');
    
    // Добавляем товар
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    
    // Преднамеренная ошибка - неправильный ожидаемый текст
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2'); // Должно быть '1'
    
    // Этот код не выполнится из-за ошибки выше
    console.log('❌ Этот лог не появится');
  });
});

/**
 * КЛЮЧЕВЫЕ ПРЕИМУЩЕСТВА ПРОДВИНУТЫХ ХУКОВ:
 * 
 * 1. ГЛОБАЛЬНАЯ НАСТРОЙКА (beforeAll)
 *    - Загрузка конфигурации
 *    - Инициализация внешних сервисов
 *    - Подготовка тестовых данных
 * 
 * 2. ИЗОЛЯЦИЯ ТЕСТОВ (beforeEach)
 *    - Новый контекст для каждого теста
 *    - Чистое состояние
 *    - Настройка окружения (геолокация, языки)
 *    - Включение трассировки
 * 
 * 3. НАДЕЖНАЯ ОЧИСТКА (afterEach)
 *    - Сохранение артефактов при падениях
 *    - Очистка тестовых данных
 *    - Освобождение ресурсов
 *    - Логирование результатов
 * 
 * 4. ФИНАЛИЗАЦИЯ (afterAll)
 *    - Генерация отчетов
 *    - Очистка глобальных ресурсов
 *    - Отправка уведомлений
 *    - Обновление метрик
 * 
 **/