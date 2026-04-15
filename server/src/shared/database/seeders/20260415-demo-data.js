'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Seed 데이터: 데모 매장 + 관리자 + 카테고리 + 메뉴
module.exports = {
  async up(queryInterface) {
    const storeId = uuidv4();
    const adminPassword = await bcrypt.hash('admin1234', 10);
    const tablePassword = await bcrypt.hash('1234', 10);

    // 매장
    await queryInterface.bulkInsert('stores', [
      {
        id: storeId,
        name: '데모 매장',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 관리자
    await queryInterface.bulkInsert('store_admins', [
      {
        id: uuidv4(),
        store_id: storeId,
        username: 'admin',
        password: adminPassword,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 테이블 (1~5번)
    const tableIds = [];
    for (let i = 1; i <= 5; i++) {
      const tableId = uuidv4();
      tableIds.push(tableId);
      await queryInterface.bulkInsert('tables', [
        {
          id: tableId,
          store_id: storeId,
          table_number: i,
          password: tablePassword,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }

    // 카테고리
    const categoryIds = {
      main: uuidv4(),
      side: uuidv4(),
      drink: uuidv4(),
    };

    await queryInterface.bulkInsert('categories', [
      { id: categoryIds.main, store_id: storeId, name: '메인 메뉴', sort_order: 0, created_at: new Date(), updated_at: new Date() },
      { id: categoryIds.side, store_id: storeId, name: '사이드', sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: categoryIds.drink, store_id: storeId, name: '음료', sort_order: 2, created_at: new Date(), updated_at: new Date() },
    ]);

    // 메뉴 항목
    await queryInterface.bulkInsert('menu_items', [
      { id: uuidv4(), category_id: categoryIds.main, name: '불고기 정식', price: 12000, description: '소불고기와 밥, 반찬 세트', sort_order: 0, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.main, name: '김치찌개', price: 9000, description: '돼지고기 김치찌개', sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.main, name: '된장찌개', price: 8000, description: '두부 된장찌개', sort_order: 2, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.main, name: '비빔밥', price: 10000, description: '야채 비빔밥', sort_order: 3, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.side, name: '계란말이', price: 5000, description: '부드러운 계란말이', sort_order: 0, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.side, name: '김치전', price: 7000, description: '바삭한 김치전', sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.drink, name: '콜라', price: 2000, description: null, sort_order: 0, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.drink, name: '사이다', price: 2000, description: null, sort_order: 1, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), category_id: categoryIds.drink, name: '맥주', price: 5000, description: '생맥주 500ml', sort_order: 2, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('menu_items', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('tables', null, {});
    await queryInterface.bulkDelete('store_admins', null, {});
    await queryInterface.bulkDelete('stores', null, {});
  },
};
