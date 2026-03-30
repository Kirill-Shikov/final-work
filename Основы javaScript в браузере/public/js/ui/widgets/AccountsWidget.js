/**
 * Класс AccountsWidget управляет блоком
 * отображения счетов в боковой колонке
 */
class AccountsWidget {
  /**
   * Устанавливает текущий элемент в свойство element
   * Регистрирует обработчики событий с помощью
   * AccountsWidget.registerEvents()
   * Вызывает AccountsWidget.update() для получения
   * списка счетов и последующего отображения
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   */
  constructor(element) {
    if (!element) {
      throw new Error('Element not found');
    }
    
    this.element = element;
    this.currentAccountId = null;
    
    this.registerEvents();
    this.update();
  }

  /**
   * При нажатии на .create-account открывает окно
   * #modal-new-account для создания нового счёта
   * При нажатии на один из существующих счетов
   * (которые отображены в боковой колонке),
   * вызывает AccountsWidget.onSelectAccount()
   */
  registerEvents() {
    const createAccountBtn = this.element.querySelector('.create-account');
    if (createAccountBtn) {
      createAccountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = App.getModal('createAccount');
        if (modal) {
          modal.open();
        }
      });
    }
    
    this.element.addEventListener('click', (e) => {
      e.preventDefault();
      
      const accountElement = e.target.closest('.account');
      if (accountElement) {
        this.onSelectAccount(accountElement);
      }
    });
  }

  /**
   * Метод доступен только авторизованным пользователям
   * (User.current()).
   * Если пользователь авторизован, необходимо
   * получить список счетов через Account.list(). При
   * успешном ответе необходимо очистить список ранее
   * отображённых счетов через AccountsWidget.clear().
   * Отображает список полученных счетов с помощью
   * метода renderItem()
   */
  update() {
    const user = User.current();
    
    if (!user) {
      return;
    }
    
    Account.list({}, (err, response) => {
      if (response && response.success) {
        this.clear();
        
        response.data.forEach(item => {
          this.renderItem(item);
        });
      }
    });
  }

  /**
   * Очищает список ранее отображённых счетов.
   * Для этого необходимо удалять все элементы .account
   * в боковой колонке
   */
  clear() {
    const accounts = this.element.querySelectorAll('.account');
    accounts.forEach(account => {
      account.remove();
    });
    
    this.currentAccountId = null;
  }

  /**
   * Срабатывает в момент выбора счёта
   * Устанавливает текущему выбранному элементу счёта
   * класс .active. Удаляет ранее выбранному элементу
   * счёта класс .active.
   * Вызывает App.showPage( 'transactions', { account_id: id_счёта });
   */
  onSelectAccount(element) {
    const accounts = this.element.querySelectorAll('.account');
    accounts.forEach(account => {
      account.classList.remove('active');
    });
    
    element.classList.add('active');
    
    this.currentAccountId = element.getAttribute('data-id');
    
    App.showPage('transactions', { account_id: this.currentAccountId });
  }

  /**
   * Возвращает HTML-код счёта для последующего
   * отображения в боковой колонке.
   * item - объект с данными о счёте
   */
  getAccountHTML(item) {
    const formattedSum = item.sum.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `
      <li class="account" data-id="${item.id}">
        <a href="#">
          <span>${item.name}</span> /
          <span>${formattedSum} ₽</span>
        </a>
      </li>
    `;
  }

  /**
   * Получает массив с информацией о счетах.
   * Отображает полученный с помощью метода
   * AccountsWidget.getAccountHTML HTML-код элемента
   * и добавляет его внутрь элемента виджета
   */
  renderItem(item) {
    const html = this.getAccountHTML(item);
    this.element.insertAdjacentHTML('beforeend', html);
  }
}