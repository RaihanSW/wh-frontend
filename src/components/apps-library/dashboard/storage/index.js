import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaTimesCircle,
} from "react-icons/fa";
import "./storage.css";

const ClaimList = () => {
    const [summary, setSummary] = useState({
        total: 0,
        accepted: 0,
        pending: 0,
        returnedOrRejected: 0,
    });

    const plotLayout = [
    ["empty", "empty", "road", "empty", "occupied", "road"],
    ["empty", "empty", "road", "empty", "empty", "road"],
    ["empty", "empty", "road", "road", "road", "road"],
    ["empty", "occupied", "empty", "empty", "empty", "road"],
    ["empty", "empty", "empty", "empty", "empty", "road"],
    ];

    useEffect(() => {
    const fetchSummary = async () => {
        const baseUrl = process.env.REACT_APP_BACKEND_HOST;
        const token = localStorage.getItem("token");

        try {
        const response = await fetch(`${baseUrl}/operations/claim`, {
            headers: {
            Authorization: token ? `Basic ${token}` : "",
            "Content-Type": "application/json",
            },
        });
        const jsonResponse = await response.json();

        let claims = [];
        let total = 0;

        if (Array.isArray(jsonResponse?.express21?.results?.data)) {
            claims = jsonResponse.express21.results.data;
            total = jsonResponse.express21.results.total_records || claims.length;
        } else if (Array.isArray(jsonResponse?.results?.data)) {
            claims = jsonResponse.results.data;
            total = jsonResponse.results.total_records || claims.length;
        } else if (Array.isArray(jsonResponse)) {
            claims = jsonResponse;
            total = claims.length;
        } else if (Array.isArray(jsonResponse?.data)) {
            claims = jsonResponse.data;
            total = jsonResponse.total_records || claims.length;
        } else {
            console.warn("Unknown response structure:", jsonResponse);
        }

        setSummary({
            total,
            accepted: claims.filter((claim) => claim.status_name === "ACCEPTED").length,
            pending: claims.filter(
            (claim) => claim.status_name === "CREATED" || claim.status_name === "VERIFIED"
            ).length,
            returnedOrRejected: claims.filter(
            (claim) => claim.status_name === "RETURNED" || claim.status_name === "REJECTED"
            ).length,
        });
        } catch (error) {
        console.error("Error fetching claim summary:", error);
        setSummary({
            total: 0,
            accepted: 0,
            pending: 0,
            returnedOrRejected: 0,
        });
        }
    };

    fetchSummary();
    }, []);

    const handlePlotClick = (rowIndex, colIndex, status) => {
        if (status === "road") return;

        console.log({
            x: colIndex + 1,
            y: rowIndex + 1,
            status: status,
        });
    };

    return (
    <div className="min-h-screen pt-[100px] pb-12 px-4 sm:px-8 font-sans text-gray-900">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Warehouse Management</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Total Klaim</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                    <FaFileAlt className="text-blue-600" size={20} />
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Klaim Diterima</p>
                    <p className="text-2xl font-bold text-emerald-600">{summary.accepted}</p>
                </div>
                <div className="bg-emerald-100 rounded-full p-3">
                    <FaCheckCircle className="text-emerald-600" size={20} />
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Menunggu Proses</p>
                    <p className="text-2xl font-bold text-amber-600">{summary.pending}</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                    <FaClock className="text-amber-600" size={20} />
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Ditolak/Dikembalikan</p>
                    <p className="text-2xl font-bold text-red-600">{summary.returnedOrRejected}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                    <FaTimesCircle className="text-red-600" size={20} />
                </div>
                </div>
            </div>
        </div>
        {/* ini untuk Plot, bentuknya kotak2  */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12">
            <div className="relative flex justify-center items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Storage Plot Layout
                </h2>
                <span className="text-sm text-gray-500 absolute right-4">
                    5 Rows × 6 Columns
                </span>
            </div>

            {/* GRID */}
            <div className="overflow-x-auto">
                <div
                className="grid w-max gap-2  mx-auto"
                style={{
                    gridTemplateColumns: `repeat(${plotLayout[0].length}, 4.5rem)`,
                }}
                >

                {plotLayout.map((row, rowIndex) =>
                    row.map((status, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className="relative h-[4.5rem] w-[4.5rem]"
                    >
                        <button
                            type="button"
                            disabled={status === "road"}
                            onClick={() =>
                            handlePlotClick(rowIndex, colIndex, status)
                            }
                            title={`X: ${colIndex + 1}, Y: ${rowIndex + 1}, Status: ${status}`}
                            className={`
                            absolute left-0 top-0 z-10 h-16 w-16 rounded-md
                            storage-plot-tile storage-plot-tile--${status}
                            `}
                        />
                    </div>
                    ))
                )}

                </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-6 justify-center">

                <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-200 border border-blue-300" />
                <span className="text-sm text-gray-600">Empty</span>
                </div>

                <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-green-200 border border-green-300" />
                <span className="text-sm text-gray-600">Occupied</span>
                </div>

                <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-gray-300 border border-gray-300" />
                <span className="text-sm text-gray-600">Road</span>
                </div>

            </div>
        </div>

        <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">List Transaksi</p>
                        <p className="text-2xl font-bold text-emerald-600">{summary.accepted}</p>
                    </div>
                    <div className="bg-emerald-100 rounded-full p-3">
                        <FaCheckCircle className="text-emerald-600" size={20} />
                    </div>
                </div>
            </div>
        </div>
        </div>
    </div>
  );
};

export default ClaimList;
