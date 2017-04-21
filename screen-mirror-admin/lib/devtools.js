const {Menu} = require('electron');

class DevTools {

	constructor(){
		this.win = null;
		this.devToolsOpen = null;

		this.menuTemplate = [
		  {
		    label: 'Developer',
		    submenu: [
		      {
		        label: 'Tools',
		        type: 'checkbox',
		        checked: false,
		        click: (item) => { 
		          this.open(item); 
		        }
		      }
		    ]
		  }
		];
	}

	open(item){
	  if(!this.devToolsOpen){
	    this.win.webContents.openDevTools();
	    item.checked = true;
	    this.devToolsOpen = true;
	  }else{
	    this.win.webContents.closeDevTools();
	    item.checked = false;
	    this.devToolsOpen= false;
	  }
	}

	init(w){
		this.win = w;
		const menu = Menu.buildFromTemplate(this.menuTemplate);
  		Menu.setApplicationMenu(menu);
	}
}

module.exports = DevTools;