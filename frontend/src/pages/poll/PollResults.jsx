// import React, { useState, useEffect, useCallback } from "react";
// import { Bar } from "react-chartjs-2";
// import axios from "axios";

// const PollResults = ({ pollId }) => {
//   const [chartData, setChartData] = useState(null);
//   const [error, setError] = useState("");

//   // Process poll responses into Chart.js data format
//   const processPollData = useCallback((responses) => {
//     const voteCounts = {};

//     // Count votes for each proposed date
//     Object.values(responses).forEach((date) => {
//       if (date) {
//         voteCounts[date] = (voteCounts[date] || 0) + 1;
//       }
//     });

//     const labels = Object.keys(voteCounts).map((date) =>
//       new Date(date).toLocaleString()
//     );
//     const votes = Object.values(voteCounts);

//     return { labels, votes };
//   }, []);

//   // Fetch poll data from backend
//   const fetchPollData = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_BACKEND_BASE_URL}meeting/${pollId}/results`
//       );
//       const { responses } = response.data;

//       if (!responses || Object.keys(responses).length === 0) {
//         setError("No poll data available.");
//         return;
//       }

//       const processedData = processPollData(responses);

//       setChartData({
//         labels: processedData.labels,
//         datasets: [
//           {
//             label: "Votes",
//             data: processedData.votes,
//             backgroundColor: "rgba(75, 192, 192, 0.6)",
//             borderColor: "rgba(75, 192, 192, 1)",
//             borderWidth: 1,
//           },
//         ],
//       });
//     } catch (error) {
//       console.error("Error fetching poll data:", error);
//       setError("Failed to fetch poll data. Please try again later.");
//     }
//   }, [pollId, processPollData]);

//   useEffect(() => {
//     fetchPollData();
//   }, [fetchPollData]);

//   if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
//   if (!chartData) return <p style={{ textAlign: "center" }}>Loading poll results...</p>;

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { display: false },
//       tooltip: { enabled: true },
//     },
//     scales: {
//       x: { title: { display: true, text: "Proposed Dates" } },
//       y: { title: { display: true, text: "Votes" }, beginAtZero: true },
//     },
//   };

//   return (
//     <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
//       <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Poll Results</h2>
//       <Bar data={chartData} options={options} />
//     </div>
//   );
// };

// export default PollResults;