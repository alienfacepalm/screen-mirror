const {ipcRenderer} = require('electron');


$('#minicap').click((event) => {
	ipcRenderer.send('minicap-click');
});

$('#minictouch').click((event) => {
	ipcRenderer.send('minitouch-click');
});

$('#middleware').click((event) => {
	ipcRenderer.send('middleware-click');
});

$('#clear').click((event) => {
	$('#console pre code').html("");
});

ipcRenderer.on('update-console', (event, message) => {
	let text = $('#console pre').html()+message.replace(/\n/, '<br/>');
	$('#console pre code').html(text);
});

ipcRenderer.on('update-checkbox', (event, which, state) => {
	$('#'+which).prop('checked', state);
});