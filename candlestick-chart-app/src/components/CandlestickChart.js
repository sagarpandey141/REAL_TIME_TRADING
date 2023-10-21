// src/CandlestickChart.js

import React, { useEffect, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import axios from "axios";

const CandlestickChart = () => {
  const [data, setData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [symbol, setSymbol] = useState("IBM");
  const [interval, setInterval] = useState("5min");

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
  };

  const handleIntervalChange = (e) => {
    const selectedInterval = e.target.value;
    setInterval(selectedInterval);
    // Fetch historical data for the selected symbol and interval
    fetchData(selectedInterval);
  };

  const handleSearch = () => {
    // Fetch historical data for the selected symbol and interval
    fetchData(interval);
  };

  const fetchData = (selectedInterval) => {
    axios
      .get(`https://real-time-trading.onrender.com/api/historical/${symbol}/${selectedInterval}`)
      .then((response) => {
        const candlestickData = [];

        for (const timestamp in response.data["Time Series (5min)"]) {
          const dataPoint = response.data["Time Series (5min)"][timestamp];
          const time = new Date(timestamp).getTime(); // Convert time to milliseconds
          const open = parseFloat(dataPoint["1. open"]);
          const high = parseFloat(dataPoint["2. high"]);
          const low = parseFloat(dataPoint["3. low"]);
          const close = parseFloat(dataPoint["4. close"]);
          candlestickData.push({ time, open, high, low, close });
        }

        // Sort data by time in ascending order
        candlestickData.sort((a, b) => a.time - b.time);

        setData(candlestickData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    const container = document.getElementById("chart-container");
    const chart = createChart(container, { width: 800, height: 400 });
    const candlestickSeries = chart.addCandlestickSeries();

    // Initialize WebSocket connection
    const ws = new WebSocket("ws://real-time-trading.onrender.com");

    ws.onopen = () => {
      console.log("WebSocket connection opened");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const realTimeData = JSON.parse(event.data);

      // Convert real-time data to the format expected by the chart library
      const candlestickData = {
        time: realTimeData.time,
        open: realTimeData.open,
        high: realTimeData.high,
        low: realTimeData.low,
        close: realTimeData.close,
      };

      // Add real-time data to the chart
      candlestickSeries.update(candlestickData);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Define and call a function to send real-time data updates
    const sendRealTimeData = () => {
        if (ws.readyState === WebSocket.OPEN) {
          const realTimeData = {
            time: new Date().getTime(),
            open: 100 + Math.random() * 5,
            high: 105 + Math.random() * 5,
            low: 95 + Math.random() * 5,
            close: 102.5 + Math.random() * 5,
          };
          ws.send(JSON.stringify(realTimeData));
        }
      
        setTimeout(sendRealTimeData, 5000); 
      };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (socket) {
        socket.close();
      }
    };

    // Fetch historical data based on the selected symbol and interval
    fetchData(interval);
  }, [symbol, interval, socket]);

  return (
    <div id="chart-container">
      <div>
        <label>Symbol: </label>
        <input type="text" value={symbol} onChange={handleSymbolChange} />
      </div>
      <div>
        <label>Interval: </label>
        <select value={interval} onChange={handleIntervalChange}>
          <option value="1min">1 Minute</option>
          <option value="5min">5 Minutes</option>
          <option value="15min">15 Minutes</option>
        </select>
      </div>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default CandlestickChart;
