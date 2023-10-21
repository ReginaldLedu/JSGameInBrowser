const noop = () => { };
const NO_PARAMS = {};
const NO_HEADERS = {};
const OK_200 = [200];

function request({
	method = 'GET',
	url,
	params = NO_PARAMS,//предусмотрено API
	headers = NO_HEADERS,//заголовки для разных типов данных
	body,
	responseType = 'json',// этот параметр можно поменять в зависимости от конкретного запроса
	requestType = 'json',// этот параметр можно поменять в зависимости от конкретного запроса. так же может быть: urlencoded
	okResponses = OK_200,
	checkStatusInResponse = false,
	onSuccess = noop,
	onError = noop
}) {
	const req = new XMLHttpRequest();

	const urlParams = new URLSearchParams(params);
	const queryString = urlParams.toString();

	req.open(method, url + (queryString ? `?${queryString}` : ''));

	Object.keys(headers).forEach((key) => {
		req.setRequestHeader(key, headers[key]);
	}); //объявляем setRequestHeader

	req.responseType = responseType;

	req.onload = function (event) {
		const target = event.target;

		if (!okResponses.includes(target.status)) {
			onError(target.statusText);

			return;
		}

		if (checkStatusInResponse && target.response.status !== 'ok') {
			onError(target.statusText);

			return;
		}

		onSuccess(target.response);
	}

	req.onerror = function () {
		onError();
	}

	let dataBody = body;

	if (requestType === 'urlencoded') {
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		//меняем заголовок для типа данных urlencoded

		const bodyParams = new URLSearchParams(body);

		dataBody = bodyParams.toString();
	}
	if (requestType === 'multipart/form-data') {
		req.setRequestHeader('Content-type', 'multipart/form-data');
		//меняем заголовок для типа данных multipart/form-data

		dataBody = new FormData(body);
		//используем объект FormData для кодирования body
	}

	if (requestType === 'json') {
		req.setRequestHeader('Content-type', 'application/json');
		//меняем заголовок для типа данных json
		dataBody = JSON.stringify(body);
	}

	req.send(dataBody);
}