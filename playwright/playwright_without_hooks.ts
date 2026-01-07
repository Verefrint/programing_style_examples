import { test, expect, Page } from '@playwright/test';

test('тест 1: авторизация и добавление товара', async ({ page }) => {
  // ARRANGE: Дублируется в каждом тесте
  await page.goto('https://www.saucedemo.com');
  
  // ACT & ASSERT: Смешаны вместе
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
  
  // Проверка успешной авторизации
  await expect(page.locator('.title')).toHaveText('Products');
  
  // Добавление товара
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  
  // Проверка добавления
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  
  // Переход в корзину
  await page.locator('.shopping_cart_link').click();
  await expect(page).toHaveURL(/cart/);
  
  // Очистка корзины (для следующего теста)
  await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
});

test('тест 2: фильтрация товаров', async ({ page }) => {
  // ДУБЛИРОВАНИЕ КОДА
  await page.goto('https://www.saucedemo.com');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
  
  // Фильтрация
  await page.locator('[data-test="product_sort_container"]').selectOption('za');
  
  // Проверка
  const firstItem = page.locator('.inventory_item_name').first();
  await expect(firstItem).toHaveText('Test.allTheThings() T-Shirt (Red)');
});

test('тест 3: оформление заказа', async ({ page }) => {
  // ЕЩЁ ОДНО ДУБЛИРОВАНИЕ
  await page.goto('https://www.saucedemo.com');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
  
  // Добавляем товар
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page.locator('.shopping_cart_link').click();
  
  // Проблема: если предыдущий тест упал, корзина может быть не пустой
  await page.locator('[data-test="checkout"]').click();
  await page.locator('[data-test="firstName"]').fill('Test');
  await page.locator('[data-test="lastName"]').fill('User');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();
  
  // Проблема: состояние зависит от предыдущих тестов
  const total = page.locator('.summary_total_label');
  await expect(total).toContainText('Total: $');
});

/**
 * ПРОБЛЕМЫ ЭТОГО ФАЙЛА:
 * 1. 39 строк кода дублируются
 * 2. Тесты зависят друг от друга
 * 3. Сложно менять селекторы
 * 4. Нет централизованной обработки ошибок
 * 5. Сложно масштабировать
 */
