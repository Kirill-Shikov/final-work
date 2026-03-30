/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   */
  constructor(element) {
    if (!element) throw new Error('Element not found');
    this.element = element;
    this.lastOptions = null;
    
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   */
  update() {
    if (this.lastOptions) {
      this.render(this.lastOptions);
    }
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   */
  registerEvents() {
    this.element.addEventListener('click', (event) => {
      event.preventDefault();
      
      const removeAccountBtn = event.target.closest('.remove-account');
      if (removeAccountBtn) {
        this.removeAccount();
        return;
      }
      
      const removeTransactionBtn = event.target.closest('.transaction__remove');
      if (removeTransactionBtn) {
        const transactionId = removeTransactionBtn.getAttribute('data-id');
        if (transactionId) this.removeTransaction(transactionId);
      }
    });
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   */
  removeAccount() {
    if (!this.lastOptions || !this.lastOptions.account_id) {
      return;
    }
    
    const accountId = this.lastOptions.account_id;
    
    if (!confirm('Вы действительно хотите удалить счёт?')) {
      return;
    }
    
    Account.remove({ id: accountId }, (err, response) => {
      if (err) {
        console.error('Ошибка удаления счета:', err);
        return;
      }
      
      if (response && response.success) {
        if (typeof App.updateWidgets === 'function') App.updateWidgets();
        if (typeof App.updateForms === 'function') App.updateForms();
        
        this.clear();
      }
    });
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   */
  removeTransaction(id) {
    if (!confirm('Вы действительно хотите удалить эту транзакцию?')) return;
    
    Transaction.remove({ id: id }, (err, response) => {
      if (err) {
        console.error('Ошибка удаления транзакции:', err);
        return;
      }
      
      if (response && response.success) {
        this.update();
        if (typeof App.updateWidgets === 'function') App.updateWidgets();
      }
    });
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   */
  render(options) {
    if (!options || !options.account_id) {
      return;
    }
    
    this.lastOptions = options;
    const accountId = options.account_id;
    
    Account.get(accountId, (err, accountResponse) => {
      if (accountResponse && accountResponse.success) {
        this.renderTitle(accountResponse.data.name);
      } else {
        this.renderTitle('Название счёта');
      }
    });
    
    Transaction.list({ account_id: accountId }, (err, transactionResponse) => {
      if (transactionResponse && transactionResponse.success) {
        this.renderTransactions(transactionResponse.data || []);
      } else {
        this.clear();
      }
    });
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   */
  clear() {
    this.renderTransactions([]);
    this.renderTitle('Название счёта');
    this.lastOptions = null;
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   */
  renderTitle(name) {
    const titleElement = this.element.querySelector('.content-title');
    if (titleElement) {
      titleElement.textContent = name;
    }
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   */
  formatDate(date) {
    if (!date) return '';
    
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) return date;
      
      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                     'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
      
      const day = parsedDate.getDate();
      const month = months[parsedDate.getMonth()];
      const year = parsedDate.getFullYear();
      const hours = parsedDate.getHours().toString().padStart(2, '0');
      const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year} г. в ${hours}:${minutes}`;
    } catch (e) {
      return date;
    }
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   */
  getTransactionHTML(item) {
    const formattedDate = this.formatDate(item.created_at);
    
    let formattedSum = '0.00';
    try {
      const sum = parseFloat(item.sum);
      if (!isNaN(sum)) {
        formattedSum = sum.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    } catch (e) {
      console.warn('Ошибка форматирования суммы:', item.sum, e);
    }
    
    const typeClass = item.type && item.type.toLowerCase() === 'expense' 
      ? 'transaction_expense' 
      : 'transaction_income';
    
    const transactionName = item.name || 'Без названия';
    const transactionId = item.id || '';
    
    return `
      <div class="transaction ${typeClass} row">
        <div class="col-md-7 transaction__details">
          <div class="transaction__icon">
            <span class="fa fa-money fa-2x"></span>
          </div>
          <div class="transaction__info">
            <h4 class="transaction__title">${this.escapeHtml(transactionName)}</h4>
            <div class="transaction__date">${formattedDate}</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="transaction__summ">
            ${formattedSum} <span class="currency">₽</span>
          </div>
        </div>
        <div class="col-md-2 transaction__controls">
          <button class="btn btn-danger transaction__remove" data-id="${transactionId}">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   */
  renderTransactions(data) {
    const contentSection = this.element.querySelector('.content');
    if (!contentSection) {
      return;
    }
    
    if (!data || data.length === 0) {
      contentSection.innerHTML = '';
      return;
    }
    
    const fragment = document.createDocumentFragment();
    
    data.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getTransactionHTML(item);
      if (wrapper.firstElementChild) {
        fragment.appendChild(wrapper.firstElementChild);
      }
    });
    
    contentSection.innerHTML = '';
    contentSection.appendChild(fragment);
  }

  // Вспомогательный метод для экранирования HTML
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}