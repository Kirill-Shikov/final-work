'use strict';

const userForm = new UserForm();

userForm.loginFormCallback = function(data) {

	ApiConnector.login(data, function(response) {

		console.log('Ответ сервера при авторизации:', response);

		if (response.success) {
			location.reload();
		} else {
			userForm.setLoginErrorMessage(response.message || "Ошибка авторизации неверный логин или пароль");
		}
	});
};

userForm.registerFormCallback = function(data) {
	ApiConnector.register(data, function(response) {
		console.log('ответ сервера при регистрации ', response);
		if (response.success) {
			location.reload();
		} else {
			userForm.setRegisterErrorMessage(response.message || 'ошибка регистрации');
		}
	});
};