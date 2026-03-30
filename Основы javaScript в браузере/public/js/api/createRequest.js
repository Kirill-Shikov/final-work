/**
 * Основная функция для совершения запросов
 * на сервер.
 */
const createRequest = (options = {}) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'json';

  const { url, data, method = 'GET', callback } = options;

  let requestUrl = url;
  let formData = null;

  if (method === 'GET' && data) {
    const params = new URLSearchParams(data).toString();
    requestUrl = `${url}?${params}`;
  } else if (data) {
    formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }
  }

  try {
    xhr.open(method, requestUrl);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, xhr.response);
      } else {
        callback(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`), xhr.response);
      }
    };

    xhr.onerror = () => {
      callback(new Error('Network error'), null);
    };

    if (formData) {
      xhr.send(formData);
    } else {
      xhr.send();
    }
  } catch (e) {
    callback(e, null);
  }
};