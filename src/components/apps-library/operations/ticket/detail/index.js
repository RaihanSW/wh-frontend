// TicketDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Ticket,
  User,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Paperclip,
  Link2,
  Users,
  Edit3,
  MoreVertical,
  Printer,
  Share2,
  Download,
  Tag,
  Hash,
  FolderOpen,
  UserCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  FileText,
  Briefcase,
  Building,
  Phone,
  MapPin,
  Star,
  Award,
  TrendingUp,
  Activity,
  Zap,
  Info,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [activities, setActivities] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    express21: true,
    results: true,
    data: true,
  });

  const API_BASE_URL = process.env.REACT_APP_BACKEND_HOST;

  useEffect(() => {
    fetchTicketDetail();
  }, [id]);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const response = await axios.get(
        `${API_BASE_URL}/operations/ticket/${id}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
          timeout: 30000,
        }
      );

      // Store raw response data
      setRawData(response.data);

      // Parse the response data
      const responseData = response.data?.express21?.results?.data || [];
      
      // Get the first ticket from the array
      const ticketData = responseData.length > 0 ? responseData[0] : null;
      
      if (ticketData) {
        setTicket(ticketData);
        
        // Generate activities from ticket data
        const generatedActivities = [
          {
            id: 1,
            type: "created",
            user: ticketData.created_by || "System",
            date: ticketData.created_date,
            description: `Ticket created by ${ticketData.created_by || "System"}`,
          },
        ];
        
        if (ticketData.status) {
          generatedActivities.push({
            id: 2,
            type: "updated",
            user: ticketData.created_by || "System",
            date: ticketData.created_date,
            description: `Ticket status set to ${ticketData.status}`,
          });
        }
        
        setActivities(generatedActivities);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching ticket details:", err);
      setError(err.message || "Failed to fetch ticket details.");
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (rawData) {
      navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusBadgeStyle = (status) => {
    const statusUpper = status?.toUpperCase() || "";
    const styles = {
      SELESAI: "bg-emerald-500",
      DIPROSES: "bg-blue-500",
      PENDING: "bg-amber-500",
      DITOLAK: "bg-red-500",
      OPEN: "bg-blue-500",
      IN_PROGRESS: "bg-purple-500",
      RESOLVED: "bg-emerald-500",
      CLOSED: "bg-gray-500",
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
      OPEN: "text-blue-600",
      IN_PROGRESS: "text-purple-600",
      RESOLVED: "text-emerald-600",
      CLOSED: "text-gray-600",
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
      OPEN: <AlertCircle className="w-5 h-5" />,
      IN_PROGRESS: <Loader2 className="w-5 h-5 animate-spin" />,
      RESOLVED: <CheckCircle className="w-5 h-5" />,
      CLOSED: <CheckCircle className="w-5 h-5" />,
    };
    return icons[statusUpper] || <Clock className="w-5 h-5" />;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      month: "long",
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

  const InfoItem = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className={`p-2 rounded-lg ${color || "bg-gray-100"}`}>
        <Icon className={`w-4 h-4 ${color ? "text-white" : "text-gray-500"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5 break-words">{value || "N/A"}</p>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-xl">
      <div className={`p-2 rounded-full ${
        activity.type === "created" ? "bg-emerald-50" : "bg-blue-50"
      }`}>
        {activity.type === "created" ? (
          <CheckCircle className={`w-4 h-4 ${
            activity.type === "created" ? "text-emerald-500" : "text-blue-500"
          }`} />
        ) : (
          <Clock className="w-4 h-4 text-blue-500" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <p className="font-medium text-gray-700">{activity.description}</p>
          <span className="text-xs text-gray-400">{formatDateTime(activity.date)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">by {activity.user}</p>
      </div>
    </div>
  );

  // JSON Tree Viewer Component
  const JSONTreeViewer = ({ data, level = 0, path = "" }) => {
    if (data === null) return <span className="text-gray-500">null</span>;
    if (typeof data === "boolean") return <span className="text-purple-400">{String(data)}</span>;
    if (typeof data === "number") return <span className="text-blue-400">{data}</span>;
    if (typeof data === "string") return <span className="text-green-400">"{data}"</span>;

    if (Array.isArray(data)) {
      if (data.length === 0) return <span className="text-gray-500">[]</span>;
      return (
        <div className="ml-4">
          <span className="text-gray-400">[</span>
          {data.map((item, index) => (
            <div key={index} className="ml-4 border-l border-gray-700 pl-4">
              <JSONTreeViewer data={item} level={level + 1} path={`${path}[${index}]`} />
              {index < data.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-400">]</span>
        </div>
      );
    }

    if (typeof data === "object") {
      const keys = Object.keys(data);
      if (keys.length === 0) return <span className="text-gray-500">{'{}'}</span>;
      return (
        <div className="ml-4">
          <span className="text-gray-400">{'{'}</span>
          {keys.map((key, index) => (
            <div key={key} className="ml-4 border-l border-gray-700 pl-4">
              <span className="text-yellow-400">"{key}"</span>
              <span className="text-gray-400">: </span>
              <JSONTreeViewer data={data[key]} level={level + 1} path={`${path}.${key}`} />
              {index < keys.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
          <span className="text-gray-400">{'}'}</span>
        </div>
      );
    }

    return <span className="text-gray-400">{String(data)}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-gray-500 mt-6 font-medium">Loading ticket details...</p>
            <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-4">Error Loading Ticket</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              <button
                onClick={fetchTicketDetail}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Retry
              </button>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-4">Ticket Not Found</h3>
            <p className="text-gray-500 mt-2">The ticket you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/Dashboard/Tickets")}
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <button
            onClick={() => navigate("/Dashboard/Tickets")}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Tickets</span>
          </button>
          <div className="flex items-center gap-3">
            <button className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300">
              <Printer className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-300">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200">
              <Edit3 className="w-4 h-4" />
              Edit Ticket
            </button>
          </div>
        </div>

        {/* Ticket Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Ticket className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-800">{ticket.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusBadgeStyle(ticket.status)}`}>
                    {ticket.status || "Unknown"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    Ticket #{ticket.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Created {formatDate(ticket.created_date)}
                  </span>
                  {ticket.topic_title && (
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4" />
                      {ticket.topic_title}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                <MoreVertical className="w-4 h-4 inline mr-1" />
                More
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
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
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {ticket.description || "No description provided."}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Ticket Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoItem
                          label="ID"
                          value={ticket.id}
                          icon={Hash}
                          color="bg-purple-500"
                        />
                        <InfoItem
                          label="Title"
                          value={ticket.title}
                          icon={FileText}
                          color="bg-blue-500"
                        />
                        <InfoItem
                          label="Applicant"
                          value={ticket.applicant_name}
                          icon={UserCircle}
                          color="bg-indigo-500"
                        />
                        <InfoItem
                          label="Email"
                          value={ticket.applicant_email}
                          icon={Mail}
                          color="bg-pink-500"
                        />
                        <InfoItem
                          label="Topic"
                          value={ticket.topic_title}
                          icon={FolderOpen}
                          color="bg-green-500"
                        />
                        <InfoItem
                          label="Topic ID"
                          value={ticket.topic_id}
                          icon={Tag}
                          color="bg-teal-500"
                        />
                        <InfoItem
                          label="Created By"
                          value={ticket.created_by}
                          icon={User}
                          color="bg-amber-500"
                        />
                        <InfoItem
                          label="Created Date"
                          value={formatDateTime(ticket.created_date)}
                          icon={Calendar}
                          color="bg-red-500"
                        />
                        <InfoItem
                          label="Status"
                          value={ticket.status}
                          icon={AlertCircle}
                          color="bg-cyan-500"
                        />
                        <InfoItem
                          label="Target Division"
                          value={ticket.target_division || "N/A"}
                          icon={Building}
                          color="bg-gray-500"
                        />
                      </div>
                    </div>

                    {/* Attachments */}
                    {(ticket.link_filename || ticket.link_url) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          Attachments
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {ticket.link_filename && (
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 hover:border-blue-300 transition-colors">
                              <Paperclip className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{ticket.link_filename}</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </div>
                          )}
                          {ticket.link_url && (
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 hover:border-blue-300 transition-colors">
                              <Link2 className="w-4 h-4 text-gray-500" />
                              <a 
                                href={ticket.link_url} 
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
                    <p className="text-gray-500 mt-4 font-medium">No comments yet</p>
                    <p className="text-gray-400 text-sm">Start a conversation about this ticket</p>
                    <button className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
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
                          <ActivityItem key={activity.id} activity={activity} />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400 text-sm">No activity recorded yet</p>
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
                        <h3 className="text-sm font-semibold text-gray-700">Raw API Response</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-mono">
                          {rawData ? Object.keys(rawData).length : 0} keys
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (rawData) {
                              const jsonStr = JSON.stringify(rawData, null, 2);
                              const blob = new Blob([jsonStr], { type: 'application/json' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `ticket-${ticket.id}-data.json`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
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
                    </div>

                    <div className="bg-gray-900 rounded-xl p-6 overflow-auto max-h-[600px]">
                      <div className="text-xs font-mono">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <span className="text-yellow-400">//</span>
                          <span>Complete API Response</span>
                          <span className="text-gray-500">- Ticket #{ticket.id}</span>
                        </div>
                        <JSONTreeViewer data={rawData} />
                      </div>
                    </div>

                    {/* Summary of data */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">Total Keys</p>
                        <p className="text-sm font-semibold text-gray-700">{rawData ? Object.keys(rawData).length : 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">Data Objects</p>
                        <p className="text-sm font-semibold text-gray-700">{rawData?.express21?.results?.data?.length || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">Ticket ID</p>
                        <p className="text-sm font-semibold text-gray-700">#{ticket.id}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-400">Status</p>
                        <p className={`text-sm font-semibold ${getStatusColor(ticket.status)}`}>{ticket.status}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Status Overview
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`flex items-center gap-2 font-medium ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status || "Unknown"}
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
                    {ticket.created_by || "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600">Created By</span>
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <User className="w-4 h-4" />
                    {ticket.created_by || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
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
                <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Mark as Priority</span>
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Metadata
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Ticket ID</span>
                  <span className="font-mono text-gray-700 font-medium">#{ticket.id}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-700">{formatDateTime(ticket.created_date)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-gray-700">{formatDateTime(ticket.created_date)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">Topic ID</span>
                  <span className="text-gray-700">{ticket.topic_id || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;