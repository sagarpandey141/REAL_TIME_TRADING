

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = process.env.PORT || 3001;

app.use(express.json());

// Define an endpoint to fetch historical stock data
app.get("/api/historical/:symbol/:interval", async (req, res) => {
  try {
    const { symbol, interval } = req.params;
    const apiKey = "RRK0OX057DJBBRDJ";

    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${apiKey}`
    );

    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// WebSocket for real-time data
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");

  const sendRealTimeData = () => {
    // Simulate sending real-time data
    const realTimeData = {
      time: new Date().getTime(),
      open: 100 + Math.random() * 5,
      high: 105 + Math.random() * 5,
      low: 95 + Math.random() * 5,
      close: 102.5 + Math.random() * 5,
    };
    ws.send(JSON.stringify(realTimeData));

    setTimeout(sendRealTimeData, 10000); // Send data every 5 seconds
  };

  sendRealTimeData();

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

