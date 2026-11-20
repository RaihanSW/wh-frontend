import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { debounce } from "lodash";
import {
  Search,
  Calendar,
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  User,
  BarChart3,
  ChevronRight,
  Loader2,
  Mail,
  UserCircle,
  FolderOpen,
  RefreshCw,
  Filter,
  Plus,
  Download,
  Settings,
  LayoutGrid,
  List,
  TrendingUp,
  Activity,
  Zap,
  Star,
  Bell,
  MoreVertical,
  ArrowLeft,
  Edit3,
  Printer,
  Share2,
  Tag,
  Hash,
  FileText,
  Building,
  Link2,
  Paperclip,
  ExternalLink,
  MessageCircle,
  Code,
  Copy,
  Check,
  Info,
  X,
} from "lucide-react";

const TicketList = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // URL filter params
  const urlFilterCol = searchParams.get("filter_by_col") || "";
  const urlFilterText = searchParams.get("filter_by_text") || "";
  const urlStatus = searchParams.get("status") || "all";
  const urlDate = searchParams.get("date") || today;
  const urlTicketId = searchParams.get("ticket_id") || "";

  const urlPage = parseInt(searchParams.get("page")) || 1;
  const urlItemsPerPage = parseInt(searchParams.get("itemsPerPage")) || 10;

  // List states
  const [ticketData, setTicketData] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketList, setTicketList] = useState([]);
  const [chosenDate, setChosenDate] = useState(urlDate);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadingTicketList, setLoadingTicketList] = useState(false);
  const [errorTicketList, setErrorTicketList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState(urlStatus);
  const [filterColumn, setFilterColumn] = useState(urlFilterCol);
  const [filterValue, setFilterValue] = useState(urlFilterText);
  const [filterId, setFilterId] = useState(urlTicketId);
  const [showFilters, setShowFilters] = useState(false);
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
  const [corsError, setCorsError] = useState(false);

  // ───────────────────────────────────────────────────────────
  // DETAIL VIEW STATES (inline)
  // ───────────────────────────────────────────────────────────
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailTicket, setDetailTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [activities, setActivities] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_HOST;

  const filterColumns = [
    { value: "id", label: "ID" },
    { value: "title", label: "Title" },
    { value: "status", label: "Status" },
    { value: "applicant_name", label: "Applicant Name" },
    { value: "applicant_email", label: "Applicant Email" },
    { value: "topic_title", label: "Topic" },
    { value: "created_by", label: "Created By" },
    { value: "target_division", label: "Target Division" },
  ];

  // ───────────────────────────────────────────────────────────
  // URL param syncing
  // ───────────────────────────────────────────────────────────
  const updateUrlParams = (params) => {
    const newParams = new URLSearchParams(searchParams);

    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value && value !== "all") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    if (urlPage > 1) newParams.set("page", urlPage.toString());
    if (urlItemsPerPage !== 10)
      newParams.set("itemsPerPage", urlItemsPerPage.toString());

    setSearchParams(newParams);
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case "column":
        setFilterColumn(value);
        updateUrlParams({ filter_by_col: value });
        break;
      case "value":
        setFilterValue(value);
        updateUrlParams({ filter_by_text: value });
        break;
      case "status":
        setFilterStatus(value);
        updateUrlParams({ status: value });
        break;
      case "date":
        setChosenDate(value);
        updateUrlParams({ date: value });
        break;
      case "ticket_id":
        setFilterId(value);
        updateUrlParams({ ticket_id: value });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (urlDate) setChosenDate(urlDate);
    if (urlStatus) setFilterStatus(urlStatus);
    if (urlFilterCol) setFilterColumn(urlFilterCol);
    if (urlFilterText) setFilterValue(urlFilterText);
    if (urlTicketId) setFilterId(urlTicketId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTicketList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chosenDate,
    selectedTicket,
    filterStatus,
    filterColumn,
    filterValue,
    filterId,
  ]);

  // ───────────────────────────────────────────────────────────
  // Search dropdown (autocomplete)
  // ───────────────────────────────────────────────────────────
  const fetchTicketData = async (search) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const response = await axios.get(`${API_BASE_URL}/Operations/tickets`, {
        headers: { Authorization: `Basic ${token}` },
      });

      const allTickets = response.data?.express21?.results?.data || [];
      const filteredTickets = allTickets.filter(
        (ticket) =>
          ticket.title?.toLowerCase().includes(search.toLowerCase()) ||
          ticket.id?.toString().includes(search)
      );

      const ticketOptions = filteredTickets.map((ticket) => ({
        value: ticket.id,
        label: `${ticket.id} - ${ticket.title}`,
      }));

      setTicketData(ticketOptions);
    } catch (err) {
      console.error(err.message || "Failed to fetch ticket data.");
      setErrorTicketList(err.message || "Failed to fetch ticket data.");
    }
  };

  const debouncedFetchTicketData = debounce((newQuery) => {
    if (newQuery.length >= 1) {
      fetchTicketData(newQuery);
    } else {
      setTicketData([]);
    }
  }, 300);

  const handleInputChange = (newValue) => {
    setSearchQuery(newValue);
    debouncedFetchTicketData(newValue);
  };

  // ───────────────────────────────────────────────────────────
  // LIST fetch
  // ───────────────────────────────────────────────────────────
  const fetchTicketList = async () => {
    try {
      setErrorTicketList(null);
      setCorsError(false);

      if (!chosenDate) {
        setErrorTicketList("Please select a valid date range.");
        return;
      }

      setLoadingTicketList(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const chosenDateObj = new Date(chosenDate);
      const startDate = new Date(
        chosenDateObj.getFullYear(),
        chosenDateObj.getMonth(),
        1
      )
        .toISOString()
        .slice(0, 10);
      setFromDate(startDate);

      const endDate = new Date(
        chosenDateObj.getFullYear(),
        chosenDateObj.getMonth() + 1,
        0
      )
        .toISOString()
        .slice(0, 10);
      setToDate(endDate);

      let url = `${API_BASE_URL}/operations/ticket`;
      const params = new URLSearchParams();

      if (filterColumn && filterValue) {
        params.append("filter_by_col", filterColumn);
        params.append("filter_by_text", filterValue);
      }

      params.append("start_date", startDate);
      params.append("end_date", endDate);

      if (selectedTicket) {
        params.append("ticket_id", selectedTicket.value);
      }

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const ticketResponse = await axios.get(url, {
        headers: { Authorization: `Basic ${token}` },
        timeout: 30000,
      });

      const allTickets = ticketResponse.data?.express21?.results?.data || [];
      let filteredTickets = allTickets;

      if (filterId && !(filterColumn === "id" && filterValue)) {
        filteredTickets = filteredTickets.filter((t) =>
          t.id?.toString().toLowerCase().includes(filterId.toLowerCase())
        );
      }

      setTicketList(filteredTickets);

      const total = filteredTickets.length;
      const completed = filteredTickets.filter(
        (t) => t.status?.toUpperCase() === "SELESAI"
      ).length;
      const pending = filteredTickets.filter(
        (t) => t.status?.toUpperCase() !== "SELESAI"
      ).length;

      setTicketSummary((prev) => ({
        ...prev,
        total_tickets: total,
        open_tickets: pending,
        resolved: completed,
        now_date: today,
      }));

      setLoadingTicketList(false);
    } catch (err) {
      console.error("Error fetching tickets:", err);

      if (err.message?.includes("CORS") || err.code === "ERR_NETWORK") {
        setCorsError(true);
        setErrorTicketList(
          "CORS error: Unable to connect to the server. Please check if the backend is running and CORS is properly configured."
        );
      } else {
        setErrorTicketList(err.message || "Failed to fetch ticket data.");
      }
      setLoadingTicketList(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // DETAIL fetch — the ?filter_by_col=id&filter_by_text={id} call
  // ───────────────────────────────────────────────────────────
  const fetchTicketDetail = async (id) => {
    try {
      setDetailLoading(true);
      setDetailError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const response = await axios.get(
        `${API_BASE_URL}/operations/ticket?filter_by_col=id&filter_by_text=${id}`,
        {
          headers: { Authorization: `Basic ${token}` },
          timeout: 30000,
        }
      );

      // Extract the single ticket object from the array
      const arr = response.data?.express21?.results?.data || [];
      const oneTicket = arr.length > 0 ? arr[0] : null;

      // For JSON tab: store the single ticket (not the whole envelope)
      setRawData(oneTicket);

      if (!oneTicket) {
        setDetailError("Ticket not found.");
        setDetailTicket(null);
        setActivities([]);
      } else {
        setDetailTicket(oneTicket);
        const acts = [
          {
            id: 1,
            type: "created",
            user: oneTicket.created_by || "System",
            date: oneTicket.created_date,
            description: `Ticket created by ${oneTicket.created_by || "System"}`,
          },
        ];
        if (oneTicket.status) {
          acts.push({
            id: 2,
            type: "updated",
            user: oneTicket.created_by || "System",
            date: oneTicket.created_date,
            description: `Ticket status set to ${oneTicket.status}`,
          });
        }
        setActivities(acts);
      }

      setDetailLoading(false);
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      setDetailError(err.message || "Failed to fetch ticket details.");
      setDetailLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Click a ticket card → open inline detail
  // ───────────────────────────────────────────────────────────
  const handleTicketClick = (id) => {
    setSelectedTicketId(id);
    setShowDetail(true);
    setActiveTab("details");
    setDetailTicket(null);
    setRawData(null);
    setActivities([]);
    setDetailError(null);

    // Reflect selection in URL (optional, keeps shareable state)
    const next = new URLSearchParams(searchParams);
    next.set("ticket_id", String(id));
    setSearchParams(next);

    fetchTicketDetail(id);
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedTicketId(null);
    setDetailTicket(null);
    setRawData(null);
    setActivities([]);
    setDetailError(null);
    setActiveTab("details");

    const next = new URLSearchParams(searchParams);
    next.delete("ticket_id");
    setSearchParams(next);
  };

  const copyToClipboard = () => {
    if (rawData) {
      navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchTicketList();
  };

  const clearFilters = () => {
    setFilterColumn("");
    setFilterValue("");
    setFilterId("");
    setFilterStatus("all");
    setSelectedTicket(null);
    setSearchQuery("");
    const params = new URLSearchParams();
    if (urlPage > 1) params.set("page", urlPage.toString());
    if (urlItemsPerPage !== 10)
      params.set("itemsPerPage", urlItemsPerPage.toString());
    setSearchParams(params);
  };

  // ───────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────
  const getStatusBadgeStyle = (status) => {
    const statusUpper = status?.toUpperCase() || "";
    const styles = {
      SELESAI: "bg-emerald-500",
      DIPROSES: "bg-blue-500",
      PENDING: "bg-amber-500",
      DITOLAK: "bg-red-500",
      CREATED: "bg-indigo-500",
    };
    return styles[statusUpper] || "bg-gray-500";
  };

  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase() || "";
    const colors = {
      SELESAI: "text-emerald-600",
      DIPROSES: "text-blue-600",
      PENDING: "text-amber-600",
      DITOLAK: "text-red-600",
      CREATED: "text-indigo-600",
    };
    return colors[statusUpper] || "text-gray-600";
  };

  const getStatusIcon = (status) => {
    const statusUpper = status?.toUpperCase() || "";
    const icons = {
      SELESAI: <CheckCircle className="w-5 h-5" />,
      DIPROSES: <Loader2 className="w-5 h-5 animate-spin" />,
      PENDING: <Clock className="w-5 h-5" />,
      DITOLAK: <AlertCircle className="w-5 h-5" />,
      CREATED: <Zap className="w-5 h-5" />,
    };
    return icons[statusUpper] || <Clock className="w-5 h-5" />;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getShareableUrl = () => {
    const params = new URLSearchParams();
    if (filterColumn) params.set("filter_by_col", filterColumn);
    if (filterValue) params.set("filter_by_text", filterValue);
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (chosenDate) params.set("date", chosenDate);
    if (filterId) params.set("ticket_id", filterId);
    if (urlPage > 1) params.set("page", urlPage.toString());
    if (urlItemsPerPage !== 10)
      params.set("itemsPerPage", urlItemsPerPage.toString());
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  // ───────────────────────────────────────────────────────────
  // Small reusable components
  // ───────────────────────────────────────────────────────────
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className={`w-3 h-3 ${
                  trend > 0 ? "text-emerald-500" : "text-red-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  trend > 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`p-4 rounded-2xl ${color
            .replace("text", "bg")
            .replace("font-bold", "")} bg-opacity-10`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const QuickFilterButton = ({
    label,
    value,
    icon: Icon,
    active,
    onClick,
    count,
  }) => (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {count !== undefined && (
        <span
          className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
            active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const InfoItem = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className={`p-2 rounded-lg ${color || "bg-gray-100"}`}>
        <Icon className={`w-4 h-4 ${color ? "text-white" : "text-gray-500"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-700 mt-0.5 break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-xl">
      <div
        className={`p-2 rounded-full ${
          activity.type === "created" ? "bg-emerald-50" : "bg-blue-50"
        }`}
      >
        {activity.type === "created" ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
          <Clock className="w-4 h-4 text-blue-500" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="font-medium text-gray-700">{activity.description}</p>
          <span className="text-xs text-gray-400">
            {formatDateTime(activity.date)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">by {activity.user}</p>
      </div>
    </div>
  );

  const JSONTreeViewer = ({ data }) => {
    if (data === null) return <span className="text-gray-500">null</span>;
    if (typeof data === "boolean")
      return <span className="text-purple-400">{String(data)}</span>;
    if (typeof data === "number")
      return <span className="text-blue-400">{data}</span>;
    if (typeof data === "string")
      return <span className="text-green-400">"{data}"</span>;

    if (Array.isArray(data)) {
      if (data.length === 0) return <span className="text-gray-500">[]</span>;
      return (
        <div className="ml-4">
          <span className="text-gray-400">[</span>
          {data.map((item, index) => (
            <div key={index} className="ml-4 border-l border-gray-700 pl-4">
              <JSONTreeViewer data={item} />
              {index < data.length - 1 && (
                <span className="text-gray-500">,</span>
              )}
            </div>
          ))}
          <span className="text-gray-400">]</span>
        </div>
      );
    }

    if (typeof data === "object") {
      const keys = Object.keys(data);
      if (keys.length === 0)
        return <span className="text-gray-500">{"{}"}</span>;
      return (
        <div className="ml-4">
          <span className="text-gray-400">{"{"}</span>
          {keys.map((key, index) => (
            <div key={key} className="ml-4 border-l border-gray-700 pl-4">
              <span className="text-yellow-400">"{key}"</span>
              <span className="text-gray-400">: </span>
              <JSONTreeViewer data={data[key]} />
              {index < keys.length - 1 && (
                <span className="text-gray-500">,</span>
              )}
            </div>
          ))}
          <span className="text-gray-400">{"}"}</span>
        </div>
      );
    }

    return <span className="text-gray-400">{String(data)}</span>;
  };

  // ───────────────────────────────────────────────────────────
  // DETAIL VIEW
  // ───────────────────────────────────────────────────────────
  const TicketDetailView = () => {
    if (detailLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-500 mt-6 font-medium">
            Loading ticket details...
          </p>
        </div>
      );
    }

    if (detailError) {
      return (
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-red-500 mt-4 font-semibold">{detailError}</p>
          <button
            onClick={() => fetchTicketDetail(selectedTicketId)}
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }

    if (!detailTicket) {
      return (
        <div className="text-center py-20">
          <Ticket className="w-16 h-16 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-4 font-medium">Ticket not found</p>
        </div>
      );
    }

    return (
      <>
        {/* Ticket Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {detailTicket.title}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusBadgeStyle(
                      detailTicket.status
                    )}`}
                  >
                    {detailTicket.status || "Unknown"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    Ticket #{detailTicket.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {formatDate(detailTicket.created_date)}
                  </span>
                  {detailTicket.topic_title && (
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4" />
                      {detailTicket.topic_title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex gap-1 p-2 overflow-x-auto">
                  {["details", "comments", "history", "json"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {detailTicket.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Ticket Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoItem
                          label="ID"
                          value={detailTicket.id}
                          icon={Hash}
                          color="bg-purple-500"
                        />
                        <InfoItem
                          label="Title"
                          value={detailTicket.title}
                          icon={FileText}
                          color="bg-blue-500"
                        />
                        <InfoItem
                          label="Applicant"
                          value={detailTicket.applicant_name}
                          icon={UserCircle}
                          color="bg-indigo-500"
                        />
                        <InfoItem
                          label="Email"
                          value={detailTicket.applicant_email}
                          icon={Mail}
                          color="bg-pink-500"
                        />
                        <InfoItem
                          label="Topic"
                          value={detailTicket.topic_title}
                          icon={FolderOpen}
                          color="bg-green-500"
                        />
                        <InfoItem
                          label="Topic ID"
                          value={detailTicket.topic_id}
                          icon={Tag}
                          color="bg-teal-500"
                        />
                        <InfoItem
                          label="Created By"
                          value={detailTicket.created_by}
                          icon={User}
                          color="bg-amber-500"
                        />
                        <InfoItem
                          label="Created Date"
                          value={formatDateTime(detailTicket.created_date)}
                          icon={Calendar}
                          color="bg-red-500"
                        />
                        <InfoItem
                          label="Status"
                          value={detailTicket.status}
                          icon={AlertCircle}
                          color="bg-cyan-500"
                        />
                        <InfoItem
                          label="Target Division"
                          value={detailTicket.target_division || "N/A"}
                          icon={Building}
                          color="bg-gray-500"
                        />
                      </div>
                    </div>

                    {(detailTicket.link_filename || detailTicket.link_url) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          Attachments
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {detailTicket.link_filename && (
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                              <Paperclip className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {detailTicket.link_filename}
                              </span>
                            </div>
                          )}
                          {detailTicket.link_url && (
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
                              <Link2 className="w-4 h-4 text-gray-500" />
                              <a
                                href={detailTicket.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline"
                              >
                                View Link
                              </a>
                              <ExternalLink className="w-3 h-3 text-blue-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "comments" && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <MessageCircle className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mt-4 font-medium">
                      No comments yet
                    </p>
                    <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Add Comment
                    </button>
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Activity History
                    </h3>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
                      {activities.length > 0 ? (
                        activities.map((activity) => (
                          <ActivityItem
                            key={activity.id}
                            activity={activity}
                          />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400 text-sm">
                            No activity recorded yet
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "json" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-700">
                          Raw Ticket JSON
                        </h3>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 overflow-auto max-h-[600px]">
                      <div className="text-xs font-mono">
                        <JSONTreeViewer data={rawData} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Status Overview
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`flex items-center gap-2 font-medium ${getStatusColor(
                      detailTicket.status
                    )}`}
                  >
                    {getStatusIcon(detailTicket.status)}
                    {detailTicket.status || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Priority</span>
                  <span className="flex items-center gap-2 font-medium text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    Medium
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Assigned To</span>
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <UserCircle className="w-4 h-4" />
                    {detailTicket.created_by || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Mark as Resolved</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">In Progress</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Assign to Team</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Metadata
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Ticket ID</span>
                  <span className="font-mono text-gray-700 font-medium">
                    #{detailTicket.id}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-700">
                    {formatDateTime(detailTicket.created_date)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Topic ID</span>
                  <span className="text-gray-700">
                    {detailTicket.topic_id || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-medium ${getStatusColor(
                      detailTicket.status
                    )}`}
                  >
                    {detailTicket.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const statusCounts = {
    all: ticketList.length,
    selesai: ticketList.filter((t) => t.status?.toUpperCase() === "SELESAI")
      .length,
    diproses: ticketList.filter((t) => t.status?.toUpperCase() === "DIPROSES")
      .length,
    pending: ticketList.filter((t) => t.status?.toUpperCase() === "PENDING")
      .length,
  };

  // ───────────────────────────────────────────────────────────
  // MAIN RENDER
  // ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-20 bg-slate-50 p-6">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm">
            <div className="relative">
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-700 mt-6 font-semibold text-lg">
              Loading Tickets
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {showDetail ? (
          // ─────────────────────────────────────────────
          // DETAIL VIEW
          // ─────────────────────────────────────────────
          <>
            <button
              onClick={handleBackToList}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tickets
            </button>

            <TicketDetailView />
          </>
        ) : (
          // ─────────────────────────────────────────────
          // LIST VIEW
          // ─────────────────────────────────────────────
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                    <Ticket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                      Ticket Management
                    </h1>
                    <p className="text-slate-500 mt-0.5 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {ticketList.length} active tickets · Last updated{" "}
                      {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const url = getShareableUrl();
                    navigator.clipboard.writeText(url);
                    alert("Shareable URL copied to clipboard!");
                  }}
                  className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  New Ticket
                </button>
              </div>
            </div>

            {/* CORS Error Banner */}
            {corsError && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-500 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-800 font-semibold">
                      Connection Error
                    </h4>
                    <p className="text-red-600 text-sm mt-1">
                      {errorTicketList}
                    </p>
                    <button
                      onClick={fetchTicketList}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Connection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              <StatCard
                title="Total Tickets"
                value={ticketSummary.total_tickets}
                icon={BarChart3}
                color="text-blue-500"
                trend={12}
              />
              <StatCard
                title="Open"
                value={ticketSummary.open_tickets}
                icon={Clock}
                color="text-amber-500"
                trend={-3}
              />
              <StatCard
                title="Resolved"
                value={ticketSummary.resolved}
                icon={CheckCircle}
                color="text-emerald-500"
                trend={8}
              />
              <StatCard
                title="Topics"
                value={
                  new Set(ticketList.map((t) => t.topic_title)).size
                }
                icon={FolderOpen}
                color="text-purple-500"
              />
              <StatCard
                title="Applicants"
                value={
                  new Set(ticketList.map((t) => t.applicant_name)).size
                }
                icon={Users}
                color="text-indigo-500"
              />
            </div>

            {/* Search & Filter Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Tickets
                  </label>
                  <Select
                    options={ticketData}
                    value={selectedTicket}
                    onChange={(option) => setSelectedTicket(option)}
                    onInputChange={handleInputChange}
                    placeholder="Search by ticket ID, title, or description..."
                    inputValue={searchQuery}
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "14px",
                        borderColor: "#e5e7eb",
                        boxShadow: "none",
                        padding: "2px 0",
                        "&:hover": { borderColor: "#3b82f6" },
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        color: state.isSelected ? "white" : "#1f2937",
                        backgroundColor: state.isSelected
                          ? "#3b82f6"
                          : state.isFocused
                          ? "#eff6ff"
                          : "white",
                      }),
                    }}
                  />
                </div>

                <div className="w-full lg:w-auto">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Range
                  </label>
                  <input
                    type="date"
                    value={chosenDate}
                    onChange={(e) =>
                      handleFilterChange("date", e.target.value)
                    }
                    className="w-full lg:w-56 px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full lg:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Apply Filters
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full lg:w-auto px-4 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-2xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                  {showFilters ? (
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Filter by ID
                      </label>
                      <input
                        type="text"
                        value={filterId}
                        onChange={(e) =>
                          handleFilterChange("ticket_id", e.target.value)
                        }
                        placeholder="Enter ticket ID..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Filter by Column
                      </label>
                      <Select
                        options={filterColumns}
                        value={filterColumns.find(
                          (col) => col.value === filterColumn
                        )}
                        onChange={(option) =>
                          handleFilterChange("column", option?.value || "")
                        }
                        placeholder="Select column..."
                        isClearable
                        classNamePrefix="react-select"
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            borderRadius: "14px",
                            borderColor: "#e5e7eb",
                            boxShadow: "none",
                            padding: "2px 0",
                            "&:hover": { borderColor: "#3b82f6" },
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            color: state.isSelected ? "white" : "#1f2937",
                            backgroundColor: state.isSelected
                              ? "#3b82f6"
                              : state.isFocused
                              ? "#eff6ff"
                              : "white",
                          }),
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Value
                      </label>
                      <input
                        type="text"
                        value={filterValue}
                        onChange={(e) =>
                          handleFilterChange("value", e.target.value)
                        }
                        placeholder="Enter value to search..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700"
                        disabled={!filterColumn}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </button>
                    <span className="text-xs text-gray-400 ml-auto">
                      {ticketList.length} tickets match the current filters
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filters & View Options */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 mr-1" />
                <QuickFilterButton
                  label="All Tickets"
                  value="all"
                  active={filterStatus === "all"}
                  onClick={(val) => handleFilterChange("status", val)}
                  count={statusCounts.all}
                />
                <QuickFilterButton
                  label="Selesai"
                  value="selesai"
                  active={filterStatus === "selesai"}
                  onClick={(val) => handleFilterChange("status", val)}
                  count={statusCounts.selesai}
                />
                <QuickFilterButton
                  label="Diproses"
                  value="diproses"
                  active={filterStatus === "diproses"}
                  onClick={(val) => handleFilterChange("status", val)}
                  count={statusCounts.diproses}
                />
                <QuickFilterButton
                  label="Pending"
                  value="pending"
                  active={filterStatus === "pending"}
                  onClick={(val) => handleFilterChange("status", val)}
                  count={statusCounts.pending}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-blue-500"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-blue-500"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <button className="p-2 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Ticket List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Ticket Queue
                  </h2>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    {ticketList.length} tickets
                  </span>
                  {(filterColumn ||
                    filterId ||
                    filterStatus !== "all" ||
                    searchParams.toString()) && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-medium flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Filtered
                    </span>
                  )}
                </div>
                {loadingTicketList && (
                  <div className="flex items-center gap-2 text-blue-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Refreshing...</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {loadingTicketList ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-gray-500 mt-6 font-medium">
                      Loading tickets...
                    </p>
                    <p className="text-gray-400 text-sm">
                      Please wait while we fetch your data
                    </p>
                  </div>
                ) : errorTicketList ? (
                  <div className="text-center py-16">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <p className="text-red-500 mt-4 font-semibold">
                      {errorTicketList}
                    </p>
                    {!corsError && (
                      <button
                        onClick={fetchTicketList}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    )}
                  </div>
                ) : ticketList.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Ticket className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500 mt-4 font-semibold text-lg">
                      No tickets found
                    </p>
                    <p className="text-gray-400 text-sm">
                      Try adjusting your search or filters
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
                        : "space-y-4"
                    }
                  >
                    {ticketList.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => handleTicketClick(ticket.id)}
                        className={`group block bg-white rounded-2xl border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                          viewMode === "grid"
                            ? "p-6"
                            : "p-5 flex items-start justify-between"
                        }`}
                      >
                        {viewMode === "grid" ? (
                          <>
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                                    #{ticket.id}
                                  </span>
                                  <span
                                    className={`text-xs px-2.5 py-1 rounded-full text-white ${getStatusBadgeStyle(
                                      ticket.status
                                    )}`}
                                  >
                                    {ticket.status || "Unknown"}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors text-lg">
                                  {ticket.title}
                                </h3>
                                {ticket.description && (
                                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                    {ticket.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <UserCircle className="w-4 h-4" />
                                <span>{ticket.applicant_name || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Mail className="w-4 h-4" />
                                <span>{ticket.applicant_email || "N/A"}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between mt-3">
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {formatDateTime(ticket.created_date)}
                                </span>
                              </div>
                              {ticket.topic_title && (
                                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                                  {ticket.topic_title}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex-1 flex items-center gap-6">
                              <div className="flex items-center gap-2 min-w-[80px]">
                                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                                  #{ticket.id}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {ticket.title}
                                  </h3>
                                  <span
                                    className={`text-xs px-2.5 py-1 rounded-full text-white ${getStatusBadgeStyle(
                                      ticket.status
                                    )}`}
                                  >
                                    {ticket.status || "Unknown"}
                                  </span>
                                  {ticket.topic_title && (
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                                      {ticket.topic_title}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <UserCircle className="w-3.5 h-3.5" />
                                    {ticket.applicant_name || "N/A"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatDateTime(ticket.created_date)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-4" />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {ticketList.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                      {ticketList.length}
                    </span>{" "}
                    tickets
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      Previous
                    </button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TicketList;