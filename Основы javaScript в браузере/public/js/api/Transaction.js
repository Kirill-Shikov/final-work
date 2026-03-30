/**
 * Класс Transaction наследуется от Entity.
 * Управляет транзакциями пользователя.
 * Имеет свойство URL со значением '/transaction'
 */
class Transaction extends Entity {
  /**
   * Запрашивает список транзакций с сервера
   */
  static list(data, callback) {
    console.log('Transaction.list вызван с данными:', data);
    
    createRequest({
      url: this.URL,
      data: data,
      method: 'GET',
      callback: (err, response) => {
        console.log('Transaction.list ответ:', { err, response });
        callback(err, response);
      }
    });
  }

  /**
   * Создает новую транзакцию
   */
  static create(data, callback) {
    console.log('Transaction.create вызван с данными:', data);
    
    createRequest({
      url: this.URL,
      data: data,
      method: 'PUT',
      callback: (err, response) => {
        console.log('Transaction.create ответ:', { err, response });
        callback(err, response);
      }
    });
  }
}

Transaction.URL = '/transaction';