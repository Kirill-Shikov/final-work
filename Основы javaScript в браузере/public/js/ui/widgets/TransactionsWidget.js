/**
 * Класс TransactionsWidget отвечает за
 * открытие всплывающих окон для
 * создания нового дохода или расхода
 */
class TransactionsWidget {
  /**
   * Устанавливает полученный элемент
   * в свойство element.
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   */
  constructor(element) {
    if (!element) {
      throw new Error('Element not found');
    }
    
    this.element = element;
    this.registerEvents();
  }

  /**
   * Регистрирует обработчики нажатия на
   * кнопки «Новый доход» и «Новый расход».
   * При нажатии вызывает Modal.open() для
   * экземпляра окна
   */
  registerEvents() {
    const incomeButton = this.element.querySelector('.create-income-button');
    if (incomeButton) {
      incomeButton.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = App.getModal('newIncome');
        if (modal) {
          modal.open();
        }
      });
    }
    
    const expenseButton = this.element.querySelector('.create-expense-button');
    if (expenseButton) {
      expenseButton.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = App.getModal('newExpense');
        if (modal) {
          modal.open();
        }
      });
    }
  }
}