
let port;
let reader;
const textDecoder = new TextDecoderStream();
const outputDiv = document.getElementById("raw-data");

document
  .getElementById("connect-button")
  .addEventListener("click", async () => {
    try {
      // Request access to the serial port
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const readableStream = port.readable.pipeThrough(textDecoder);
      reader = readableStream.getReader();

      readData(); 
    } catch (error) {
      console.error("Error opening serial port:", error);
    }
  });

async function readData() {
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      console.log("Stream closed");
      break;
    }

    outputDiv.textContent = value; // Display raw data

    // Parse the NMEA data
    // const data = value.trim();
    // if (data.startsWith("$GNGGA")) {
    //   parseGNGGA(data);
    // } else if (data.startsWith("$GNRMC")) {
    //   parseGNRMC(data);
    // }
    
  }
}

function parseGNGGA(data) {


  const parts = data.split(",");

  if (parts.length > 9) {
    const latitude = convertToDegrees(parts[2], parts[3]);
    const longitude = convertToDegrees(parts[4], parts[5]);
    const altitude = parts[9];
    const satellites = parts[7];

    console.log("Latitude Raw:", parts[2], "Direction:", parts[3]);
    console.log("Longitude Raw:", parts[4], "Direction:", parts[5]);
    console.log("Converted Latitude:", latitude);
    console.log("Converted Longitude:", longitude);
    console.log("Altitude:", altitude);
    console.log("Satellites:", satellites);

    document.getElementById("latitude").textContent =
      latitude !== null ? latitude.toFixed(6) : "N/A";
    document.getElementById("longitude").textContent =
      longitude !== null ? longitude.toFixed(6) : "N/A";
    document.getElementById("altitude").textContent = altitude || "N/A";
    document.getElementById("satellites").textContent = satellites || "N/A";
  }
}

function parseGNRMC(data) {
  const parts = data.split(",");
  if (parts.length > 8) {
    const time = parts[1];
    const date = parts[9];
    const speed = parts[7]; // Speed in knots
    const speedInKph = Math.floor(parseFloat(speed) * 1.852); // Convert knots to km/h

    const utcHours = parseInt(time.substring(0, 2), 10);
    const utcMinutes = parseInt(time.substring(2, 4), 10);
    const utcSeconds = parseInt(time.substring(4, 6), 10);

    const istHours = (utcHours + 5) % 24;
    const istMinutes = (utcMinutes + 30) % 60;
    const istAdjustedHours = istHours + Math.floor((utcMinutes + 30) / 60);
    const formattedISTTime = `${String(istAdjustedHours).padStart(
      2,
      "0"
    )}:${String(istMinutes).padStart(2, "0")}:${String(utcSeconds).padStart(
      2,
      "0"
    )}`;

    const day = date.substring(0, 2);
    const month = date.substring(2, 4);
    const year = `20${date.substring(4, 6)}`; // Assuming year is 20xx
    const formattedDate = `${day}-${month}-${year}`;

    document.getElementById("speed").textContent = `${speedInKph} km/h`;
    document.getElementById("date").textContent = formattedDate;
    document.getElementById("time").textContent = formattedISTTime;
  }
}

function convertToDegrees(value, direction) {
  if (!value) return null;

  let degrees;
  let minutes;

  if (value.startsWith("0")) {
    degrees = parseInt(value.substring(0, 3), 10);
    minutes = parseFloat(value.substring(3));
  } else {
    degrees = parseInt(value.substring(0, 2), 10);
    minutes = parseFloat(value.substring(2));
  }

  const decimal = degrees + minutes / 60;

  return direction === "S" || direction === "W" ? -decimal : decimal;
}
