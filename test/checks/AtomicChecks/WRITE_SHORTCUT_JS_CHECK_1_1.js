var create = document.getElementById('create'); 
  
var shortcutDetails = { 
    // Defining the target File as the 'sample.txt' File  
    target: path.join(__dirname, '../assets/sample.txt'), 
  
    // Current Working Directory is 'assets' folder 
    cwd: path.join(__dirname, '../assets/'), 
    args: "Passing Arguments", 
    // Shown as Tooltip  
    description: "Shortcut for sample.txt file", 
      
    // Defining the icon for shortcut as the  
    // 'notepad.exe' file  
    // Instead of the System Default icon 
    icon: "C://Windows//System32//notepad.exe",  
  
    // Keeping the default value of iconIndex for the  
    // 'notepad.exe' file icon to take effect   
    iconIndex: 0, 
    appUserModelId: "", 
} 
create.addEventListener('click', (event) => { 
  
    // Desktop - C:\\Users\\example\\Desktop\\sample-shortcut.lnk 
    // Specifying the name of the Shortcut while creation 
    var success = shell.writeShortcutLink(path.join(__dirname,  
     '../assets/sample-shortcut.lnk'), 'create', shortcutDetails); 
  
    console.log('Shortcut Created Successfully - ', success); 
}); 