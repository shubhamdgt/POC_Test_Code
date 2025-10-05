const { app, BrowserWindow, Menu, ipcMain, screen } = require("electron");
const path = require("path");

// Function to create the main window
function createWindow() {
  // Get the primary display's size
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Calculate the bottom-right position
  const windowWidth = 400;
  const windowHeight = 500;
  const xPosition = width - windowWidth;
  const yPosition = height - windowHeight;

  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    resizable: true, // Allows resizing
    alwaysOnTop: true, // Pins the window to top
    frame: true, // Keep the default window frame for resizing
    transparent: false, // Remove transparency for a solid window background
    minWidth: 350, // Minimum width
    minHeight: 300, // Minimum height
    x: xPosition, // Position window horizontally at the bottom right
    y: yPosition, // Position window vertically at the bottom right
    icon: path.join(__dirname, 'assets\img\favicon2.png'),
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadFile("index.html");

  // Handle setting window size from menu
  ipcMain.on("resize-window", (event, size) => {
    win.setSize(size.width, size.height);
  });

  // Handle back button press to navigate to the last page
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "Backspace") {
      win.webContents.goBack(); // Go back to the previous page in history
    }
  });

  // Create a custom menu with options to change window size and pin it
  const menuTemplate = [
    {
      label: "Back", 
      accelerator: "Alt+Left", // Set a shortcut key for the back button
      click: () => {
        win.webContents.goBack(); // Go back to the previous page
      },
    },
    {
      label: "View",
      submenu: [
        {
          label: "Refresh",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            win.reload(); // Refresh the window
          },
        },
        {
          label: "Back", // Add a back button to the menu
          accelerator: "Alt+Left", // Set a shortcut key for the back button
          click: () => {
            win.webContents.goBack(); // Go back to the previous page
          },
        },
        {
          label: "Zoom In",
          accelerator: "CmdOrCtrl+Plus",
          click: () => {
            const currentZoom = win.webContents.getZoomFactor();
            win.webContents.setZoomFactor(currentZoom + 0.1); // Zoom in
          },
        },
        {
          label: "Zoom Out",
          accelerator: "CmdOrCtrl+-",
          click: () => {
            const currentZoom = win.webContents.getZoomFactor();
            win.webContents.setZoomFactor(currentZoom - 0.1); // Zoom out
          },
        },
        {
          label: "Reset Zoom",
          accelerator: "CmdOrCtrl+0",
          click: () => {
            win.webContents.setZoomFactor(1); // Reset zoom to 100%
          },
        },
       

        {
          label: "GitHub",
          accelerator: "CmdOrCtrl+3",
          click: () => {
            win.loadURL('https://github.com/');
          },
        },

        {
          label: "Simplilearn",
          accelerator: "CmdOrCtrl+5",
          click: () => {
            win.loadURL(
              "https://www.simplilearn.com/"
            );
          },
        },
        {
          label: "W3Schools",
          accelerator: "CmdOrCtrl+6",
          click: () => {
            win.loadURL(
              "https://www.w3schools.com/"
            );
          },
        },
        {
          label: "TutorialsPoint",
          accelerator: "CmdOrCtrl+7",
          click: () => {
            win.loadURL(
              "https://www.tutorialspoint.com/"
            );
          },
        },
        {
          label: "GeeksforGeeks",
          accelerator: "CmdOrCtrl+8",
          click: () => {
            win.loadURL(
              "https://www.geeksforgeeks.org/"
            );
          },
        },
        {
          label: "DEV Community",
          accelerator: "CmdOrCtrl+9",
          click: () => {
            win.loadURL("https://dev.to/");
          },
        },
        {
          label: "CodePen",
          accelerator: "CmdOrCtrl+0",
          click: () => {
            win.loadURL("https://codepen.io/");
          },
        },

      ],
    },
    {
      label: "Home",
      accelerator: "CmdOrCtrl+1",
      click: () => {
        win.loadFile("index.html");
      },
    },
    {
      label: "ChatGPT",
      accelerator: "CmdOrCtrl+1",
      click: () => {
        win.loadURL("https://chat.openai.com/");
      },
    },
    {
      label: "Gemini",
      accelerator: "CmdOrCtrl+2",
      click: () => {
        win.loadURL(
          "https://gemini.google.com/app"
        );
      },
    },
    {
      label: "YouTube",
      accelerator: "CmdOrCtrl+4",
      click: () => {
        win.loadURL("https://www.youtube.com/");
      },
    },
    {
      label: "Stack",
      accelerator: "CmdOrCtrl+Shift+1",
      click: () => {
        win.loadURL(
          "https://stackoverflow.com/"
        );
      },
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

// Event listeners for the app lifecycle
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
