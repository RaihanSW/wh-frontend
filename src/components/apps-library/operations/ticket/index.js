import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { debounce } from "lodash";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const TicketList = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [ticketData, setTicketData] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketList, setTicketList] = useState([]);
  const [chosenDate, setChosenDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadingTicketList, setLoadingTicketList] = useState(false);
  const [errorTicketList, setErrorTicketList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketSummary, setTicketSummary] = useState({
    total_tickets: 0,
    open_tickets: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    priority_high: 0,
    priority_medium: 0,
    priority_low: 0,
    assigned_to_me: 0,
    created_by_me: 0,
    now_date: "",
  });

  // CDN loading GIF
  const loadingGifUrl = "https://cdn.jsdelivr.net/gh/loadinggif/loadinggif@master/loading.gif";
  // Alternative CDN options:
  // const loadingGifUrl = "https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca_w200.gif";
  // const loadingGifUrl = "https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif";

  // Initialize date
  useEffect(() => {
    setChosenDate(today);
    setTicketSummary((prev) => ({
      ...prev,
      now_date: today,
    }));
  }, []);

  // Fetch ticket list when date or selected ticket changes
  useEffect(() => {
    fetchTicketList();
  }, [chosenDate, selectedTicket]);

  // Fetch ticket data (for search/autocomplete)
  const fetchTicketData = async (search) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/tickets/list?search=${search}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );

      const ticketOptions = response.data.express21.results.data.map((ticket) => ({
        value: ticket.id,
        label: `${ticket.code} - ${ticket.subject}`,
      }));

      setTicketData(ticketOptions);
    } catch (err) {
      console.error(err.message || "Failed to fetch ticket data.");
    }
  };

  // Debounced search for tickets
  const debouncedFetchTicketData = debounce((newQuery) => {
    if (newQuery.length >= 3) {
      fetchTicketData(newQuery);
    } else {
      setTicketData([]);
    }
  }, 500);

  const handleInputChange = (newValue) => {
    setSearchQuery(newValue);
    debouncedFetchTicketData(newValue);
  };

  // Fetch ticket list with filters
  const fetchTicketList = async () => {
    try {
      setErrorTicketList(null);
      
      if (!chosenDate) {
        setErrorTicketList("Please select a valid date range.");
        return;
      }

      setLoadingTicketList(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const chosenDateObj = new Date(chosenDate);
      const startDate = new Date(chosenDateObj.getFullYear(), chosenDateObj.getMonth(), 1)
        .toISOString()
        .slice(0, 10);
      setFromDate(startDate);
      
      const endDate = new Date(chosenDateObj.getFullYear(), chosenDateObj.getMonth() + 1, 0)
        .toISOString()
        .slice(0, 10);
      setToDate(endDate);

      // Fetch tickets
      const ticketResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/tickets/list?start_date=${startDate}&end_date=${endDate}${
          selectedTicket ? `&ticket_id=${selectedTicket.value}` : ""
        }`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );
      setTicketList(ticketResponse.data.express21.results.data || []);

      // Fetch ticket summary/statistics
      const summaryResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/tickets/summary?date=${chosenDate}${
          selectedTicket ? `&ticket_id=${selectedTicket.value}` : ""
        }`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );

      const summaryData = summaryResponse?.data?.express21?.results?.data?.[0] || {};

      setTicketSummary({
        total_tickets: summaryData.total_tickets ?? 0,
        open_tickets: summaryData.open_tickets ?? 0,
        in_progress: summaryData.in_progress ?? 0,
        resolved: summaryData.resolved ?? 0,
        closed: summaryData.closed ?? 0,
        priority_high: summaryData.priority_high ?? 0,
        priority_medium: summaryData.priority_medium ?? 0,
        priority_low: summaryData.priority_low ?? 0,
        assigned_to_me: summaryData.assigned_to_me ?? 0,
        created_by_me: summaryData.created_by_me ?? 0,
        now_date: summaryData.now_date ?? today,
      });

      setLoadingTicketList(false);
    } catch (err) {
      console.error(err.message || "Failed to fetch ticket data.");
      setErrorTicketList(err.message || "Failed to fetch ticket data.");
      setLoadingTicketList(false);
    }
  };

  // Handle form submission (search/refresh)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found. Please log in.");
      return;
    }

    setLoading(true);

    const dataToSend = {
      ticket_id: selectedTicket?.value || "",
      date_now: chosenDate,
      start_date: fromDate,
      end_date: toDate,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/tickets/search`,
        dataToSend,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert(`Tickets fetched successfully`);
      } else {
        alert(`Failed to fetch tickets: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      alert("Terjadi kesalahan saat mengambil data tiket.");
    }

    fetchTicketList();
    setLoading(false);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "text-red-600 bg-red-100",
      medium: "text-yellow-600 bg-yellow-100",
      low: "text-green-600 bg-green-100",
    };
    return colors[priority.toLowerCase()] || "text-gray-600 bg-gray-100";
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "text-blue-600 bg-blue-100",
      "in_progress": "text-purple-600 bg-purple-100",
      resolved: "text-green-600 bg-green-100",
      closed: "text-gray-600 bg-gray-100",
    };
    return colors[status.toLowerCase()] || "text-gray-600 bg-gray-100";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl ml-12 text-black font-bold mb-6">Ticket List</h1>
      
      <div className="flex flex-wrap gap-6">
        {/* Search and Filters */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl ml-12 text-black font-bold mb-4">Search Tickets</h3>
          <div className="flex items-end gap-4 mb-4">
            <div className="flex-1">
              <label className="block ml-12 text-sm font-medium text-gray-700 mb-2">
                Search Ticket
              </label>
              <Select
                options={ticketData}
                value={selectedTicket}
                onChange={(option) => setSelectedTicket(option)}
                onInputChange={handleInputChange}
                placeholder="Search ticket by code or subject..."
                inputValue={searchQuery}
                className="ml-10 w-3/4 text-black"
                styles={{
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
            </div>
            <div>
              <label htmlFor="chosenDate" className="block text-sm font-medium text-gray-700">
                Choose Date
              </label>
              <input
                type="date"
                id="chosenDate"
                value={chosenDate}
                onChange={(e) => setChosenDate(e.target.value)}
                className="mt-1 p-2 text-black border rounded-md shadow-sm w-full"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
            >
              Search
            </button>
          </div>

          {/* Loading Overlay with CDN image */}
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center">
                <img 
                  src={loadingGifUrl} 
                  alt="Loading..." 
                  className="w-48 h-auto"
                />
                <p className="text-white mt-4 text-lg">Loading tickets...</p>
              </div>
            </div>
          )}

          {/* Ticket Summary */}
          <div className="flex-1 bg-white p-4 rounded-lg mt-12 ml-8">
            <h3 className="text-xl text-black font-bold mb-4">
              Ticket Summary {new Date(ticketSummary.now_date).getDate()}{" "}
              {new Date(ticketSummary.now_date).toLocaleString("default", { month: "long" })}
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Status Summary */}
              <div className="space-y-2">
                <p className="text-lg font-bold text-black">Status:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-100 p-3 rounded">
                    <p className="text-sm text-blue-600">Open</p>
                    <p className="text-2xl font-bold text-blue-600">{ticketSummary.open_tickets}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded">
                    <p className="text-sm text-purple-600">In Progress</p>
                    <p className="text-2xl font-bold text-purple-600">{ticketSummary.in_progress}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="text-sm text-green-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{ticketSummary.resolved}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <p className="text-sm text-gray-600">Closed</p>
                    <p className="text-2xl font-bold text-gray-600">{ticketSummary.closed}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-black mt-4">
                  Total Tickets: <span className="text-blue-600">{ticketSummary.total_tickets}</span>
                </p>
              </div>

              {/* Priority Summary */}
              <div className="space-y-2">
                <p className="text-lg font-bold text-black">Priority:</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-red-100 p-3 rounded">
                    <p className="text-sm text-red-600">High</p>
                    <p className="text-2xl font-bold text-red-600">{ticketSummary.priority_high}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded">
                    <p className="text-sm text-yellow-600">Medium</p>
                    <p className="text-2xl font-bold text-yellow-600">{ticketSummary.priority_medium}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="text-sm text-green-600">Low</p>
                    <p className="text-2xl font-bold text-green-600">{ticketSummary.priority_low}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-md font-bold text-black">
                    Assigned to me: <span className="text-blue-600">{ticketSummary.assigned_to_me}</span>
                  </p>
                  <p className="text-md font-bold text-black">
                    Created by me: <span className="text-blue-600">{ticketSummary.created_by_me}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl text-black font-bold mb-4">Tickets</h3>
          {loadingTicketList ? (
            <div className="text-center">
              <img 
                src={loadingGifUrl} 
                alt="Loading..." 
                className="w-16 h-auto mx-auto"
              />
              <p className="text-gray-500 mt-2">Loading tickets...</p>
            </div>
          ) : errorTicketList ? (
            <p className="text-center text-red-500">{errorTicketList}</p>
          ) : ticketList.length === 0 ? (
            <p className="text-center text-gray-500">No tickets found.</p>
          ) : (
            <div style={{ height: "700px", overflowY: "auto" }}>
              <ul className="space-y-4">
                {ticketList.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="p-4 border rounded-lg shadow-sm hover:bg-gray-100"
                  >
                    <Link
                      to={`/Dashboard/Tickets/${ticket.id}`}
                      className="block text-black no-underline hover:underline"
                    >
                      <p className="font-semibold text-black">
                        Ticket: {ticket.code}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Created: {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      {ticket.assigned_to && (
                        <p className="text-sm text-gray-600 mt-2">
                          Assigned to: {ticket.assigned_to_name}
                        </p>
                      )}
                      {ticket.created_by && (
                        <p className="text-sm text-gray-600">
                          Created by: {ticket.created_by_name}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketList;