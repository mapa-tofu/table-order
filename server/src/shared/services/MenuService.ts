import { Category, MenuItem } from '../models';
import { NotFoundError, ValidationError } from '../utils/errors';
import type { CategoryWithMenus, CreateMenuRequest, UpdateMenuRequest } from '@shared/types';
import { logger } from '../utils/logger';

class MenuService {
  // 매장 메뉴 조회 (카테고리별)
  async getMenusByStore(storeId: string): Promise<CategoryWithMenus[]> {
    const categories = await Category.findAll({
      where: { storeId },
      include: [
        {
          model: MenuItem,
          as: 'menus',
          order: [['sortOrder', 'ASC']],
        },
      ],
      order: [
        ['sortOrder', 'ASC'],
        [{ model: MenuItem, as: 'menus' }, 'sortOrder', 'ASC'],
      ],
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      sortOrder: cat.sortOrder,
      menus: ((cat as unknown as { menus: MenuItem[] }).menus || []).map((m) => m.toJSON()),
    }));
  }

  // 메뉴 생성
  async createMenu(storeId: string, data: CreateMenuRequest & { imageUrl?: string }) {
    // 검증: MENU-01~06
    this.validateMenuData(data);

    // 카테고리 존재 및 매장 소속 확인
    const category = await Category.findByPk(data.categoryId);
    if (!category) throw new NotFoundError('카테고리');
    if (category.storeId !== storeId) {
      throw new ValidationError('해당 매장의 카테고리가 아닙니다.');
    }

    const menuItem = await MenuItem.create({
      categoryId: data.categoryId,
      name: data.name,
      price: data.price,
      description: data.description,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder ?? 0,
    });

    logger.info('메뉴 생성 완료', { menuId: menuItem.id, storeId });

    return menuItem.toJSON();
  }

  // 메뉴 수정
  async updateMenu(menuId: string, data: UpdateMenuRequest & { imageUrl?: string }) {
    const menuItem = await MenuItem.findByPk(menuId);
    if (!menuItem) throw new NotFoundError('메뉴');

    if (data.name !== undefined) {
      if (!data.name || data.name.length > 100) {
        throw new ValidationError('메뉴명은 1~100자여야 합니다.');
      }
      menuItem.name = data.name;
    }
    if (data.price !== undefined) {
      if (data.price < 0 || !Number.isInteger(data.price)) {
        throw new ValidationError('가격은 0 이상 정수여야 합니다.');
      }
      menuItem.price = data.price;
    }
    if (data.description !== undefined) menuItem.description = data.description;
    if (data.imageUrl !== undefined) menuItem.imageUrl = data.imageUrl;
    if (data.categoryId !== undefined) menuItem.categoryId = data.categoryId;
    if (data.sortOrder !== undefined) menuItem.sortOrder = data.sortOrder;

    await menuItem.save();

    logger.info('메뉴 수정 완료', { menuId });

    return menuItem.toJSON();
  }

  // 메뉴 삭제
  async deleteMenu(menuId: string) {
    const menuItem = await MenuItem.findByPk(menuId);
    if (!menuItem) throw new NotFoundError('메뉴');

    const imageUrl = menuItem.imageUrl;
    await menuItem.destroy();

    logger.info('메뉴 삭제 완료', { menuId });

    return { imageUrl };
  }

  // 메뉴 순서 재정렬
  async reorderMenus(storeId: string, categoryId: string, menuIds: string[]) {
    // 카테고리 확인
    const category = await Category.findByPk(categoryId);
    if (!category) throw new NotFoundError('카테고리');
    if (category.storeId !== storeId) {
      throw new ValidationError('해당 매장의 카테고리가 아닙니다.');
    }

    // 순서 업데이트
    for (let i = 0; i < menuIds.length; i++) {
      await MenuItem.update({ sortOrder: i }, { where: { id: menuIds[i], categoryId } });
    }

    logger.info('메뉴 순서 재정렬 완료', { categoryId, count: menuIds.length });
  }

  // 메뉴 데이터 검증 (MENU-01~06)
  private validateMenuData(data: CreateMenuRequest) {
    if (!data.name || data.name.length > 100) {
      throw new ValidationError('메뉴명은 1~100자여야 합니다.');
    }
    if (data.price === undefined || data.price < 0 || !Number.isInteger(data.price)) {
      throw new ValidationError('가격은 0 이상 정수여야 합니다.');
    }
    if (!data.categoryId) {
      throw new ValidationError('카테고리는 필수입니다.');
    }
    if (data.sortOrder !== undefined && (data.sortOrder < 0 || !Number.isInteger(data.sortOrder))) {
      throw new ValidationError('sortOrder는 0 이상 정수여야 합니다.');
    }
  }
}

export default new MenuService();
