const {ipcRenderer} = require('electron');

//events
$('#minicap').click((event) => {
	ipcRenderer.send('minicap-click');
});

$('#minitouch').click((event) => {
	ipcRenderer.send('minitouch-click');
});

$('#middleware').click((event) => {
	ipcRenderer.send('middleware-click');
});

$('#clear').click((event) => {
	$('#console pre code').html("");
});

//ipc
ipcRenderer.on('update-console', (event, message) => {
	let text = $('#console pre').html()+message.replace(/\n/, '<br/>');
	$('#console pre code').html(text);
	$('#console').animate({scrollTop: document.getElementById('console').scrollHeight}, 'slow');
});

ipcRenderer.on('update-checkbox', (event, which, state) => {
	$('#'+which).prop('checked', state);
});