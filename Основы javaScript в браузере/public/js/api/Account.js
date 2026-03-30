/**
 * Класс Account наследуется от Entity.
 * Управляет счетами пользователя.
 * Имеет свойство URL со значением '/account'
 */
class Account extends Entity {
  /**
   * Получает информацию о счёте
   */
  static get(id = '', callback) {
    if (!id) {
      callback(new Error('Не указан ID счета'), null);
      return;
    }
    
    createRequest({
      url: `${this.URL}/${id}`,
      method: 'GET',
      callback: callback
    });
  }
}

Account.URL = '/account';