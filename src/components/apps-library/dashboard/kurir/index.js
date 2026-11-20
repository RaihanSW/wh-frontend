import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { debounce } from "lodash";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import loadingGif from "../../../../assets/img/Loading-Screen-panjang.gif"

const KurirDashboard = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [kurirData, setKurirData] = useState([]);
  const [selectedKurir, setSelectedKurir] = useState(null);
  const [deliveryList, setDeliveryList] = useState([]);
  const [podList, setPodList] = useState([]);
  const [chosenDate, setChosenDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadingDeliveryList, setLoadingDeliveryList] = useState(false);
  const [errorDeliveryList, setErrorDeliveryList] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalReceived, setTotalReceived] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // const [totalReceivedMonth, setTotalReceivedMonth] = useState(0);

  const [podSummary, setPodSummary] = useState({
    received_thismonth: 0,
    ttl_thismonth: 0,
    ttl_lastmonth: 0,
    ttl_thisweek: 0,
    ttl_lastweek: 0,
    ttl_service_eco: 0,
    ttl_service_ons: 0,
    ttl_service_sds: 0,
    ttl_service_darat: 0,
    now_date: "",
  });

  // // bisa d delete
  useEffect(() => {
    setChosenDate(today);
    setPodSummary((prev) => ({
      ...prev,
      now_date: today,
    }));
  }, []);

  useEffect(() => {
      fetchDeliveryList();
  }, [chosenDate,selectedKurir]);

  const fetchKurirData = async (search) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/dashboard/kurirlist?search=${search}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );

      const kurirOptions = response.data.express21.results.data.map((kurir) => ({
        value: kurir.employee_id,
        label: `${kurir.employee_code} ${kurir.username}`,
      }));

      setKurirData(kurirOptions);
    } catch (err) {
      console.error(err.message || "Failed to fetch courier data.");
    }
  };


  const debouncedFetchKurirData = debounce((newQuery) => {
    if (newQuery.length >= 3) {
      fetchKurirData(newQuery); 
    } else {
      setKurirData([]);
    }
  }, 500);

  const handleInputChange = (newValue) => {
    setSearchQuery(newValue);
    debouncedFetchKurirData(newValue);
  };

  // ini khusus untuk get, ngambil datanya
  // harus ada yg khusus untuk post, narik query ke db
  // dibuat auto bila ada messenger_id (selectedKurir.value)
  const fetchDeliveryList = async () => {
    try {
        setErrorDeliveryList(null)
      if (!chosenDate || !selectedKurir) {
        setErrorDeliveryList("Please select a courier and valid date range.");
        return;
      }

      setLoadingDeliveryList(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const chosendate = new Date(chosenDate);
      const startDate = new Date(chosendate.getFullYear(), chosendate.getMonth(), 1)
                                .toISOString()
                                .slice(0, 10); // YYYY-MM-DD format
      setFromDate(startDate)
      // Get the last day of the month
      const endDate = new Date(chosendate.getFullYear(), chosendate.getMonth() + 1, 0)
                              .toISOString()
                              .slice(0, 10); // YYYY-MM-DD format
      setToDate(endDate)

      const deliveryResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/dashboard/deliverylist?messenger_id=${selectedKurir.value}&start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );
      setDeliveryList(deliveryResponse.data.express21.results.data || []);
      
      // dashboard pod ini nanti diganti pakai API couriercaching
      const podResponse2 = await axios.get(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/couriercaching?filter_by_col=courier_id&filter_by_text=${selectedKurir.value}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        }
      );

      // const podResponse = await axios.get(
      //   `${process.env.REACT_APP_BACKEND_HOST}/devkits/dashboard/pod?messenger_id=${selectedKurir.value}&start_date=${fromDate}&end_date=${toDate}`,
      //   {
      //     headers: {
      //       Authorization: `Basic ${token}`,
      //     },
      //   }
      // );

      const podData2 = podResponse2?.data?.express21?.results?.data?.[0];

      setPodSummary({
        received_thismonth: podData2?.received_thismonth ?? 0,
        ttl_thismonth: podData2?.ttl_thismonth ?? 0,
        ttl_lastmonth: podData2?.ttl_lastmonth ?? 0,
        ttl_thisweek: podData2?.ttl_thisweek ?? 0,
        ttl_lastweek: podData2?.ttl_lastweek ?? 0,
        ttl_service_eco: podData2?.ttl_service_eco ?? 0,
        ttl_service_ons: podData2?.ttl_service_ons ?? 0,
        ttl_service_sds: podData2?.ttl_service_sds ?? 0,
        ttl_service_darat: podData2?.ttl_service_darat ?? 0,
        now_date: podData2?.now_date ?? today,
      });

      setLoadingDeliveryList(false);
    } catch (err) {
      console.error(err.message || "Failed to fetch delivery data.");
      setLoadingDeliveryList(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      alert('No token found. Please log in.');
      return;
    }

    setLoading(true);

    const dataToSend = {
      messenger_id: selectedKurir.value || "",
      date_now: chosenDate,
      start_date: fromDate,
      end_date: toDate,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_HOST}/devkits/couriercaching`,
        dataToSend,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert(`Data berhasil dikirim: ID: ${dataToSend.messenger_id}`);
      } else {
        alert(`Gagal mengirim data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Terjadi kesalahan saat mengirim data.');
    }

    fetchDeliveryList();
    setLoading(false);
  };

  // // bisa d delete
  // useEffect(() => {
  //   fetchKurirData("");
  // }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl ml-12 text-black font-bold mb-6">Kurir Dashboard</h1>
      <div className="flex flex-wrap gap-6">
        {/* Select Courier and Date Range */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl ml-12 text-black font-bold mb-4">Select Courier and Date Range</h3>
          <div className="flex items-end gap-4 mb-4">
            <div className="flex-1">
              <label className="block ml-12 text-sm font-medium text-gray-700 mb-2">
                Select Courier
              </label>
              <Select
                options={kurirData}
                value={selectedKurir}
                onChange={(option) => setSelectedKurir(option)}
                onInputChange={handleInputChange}
                placeholder="Search courier..."
                inputValue={searchQuery}
                className="ml-10 w-3/4 text-black"
                styles={{
                  singleValue: (provided) => ({ ...provided, color: "black" }),
                }}
              />
            </div>
            <div>
              <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
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
            {/* <div>
              <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1 p-2 text-black border rounded-md shadow-sm w-full"
              />
            </div> */}

            {/* <button
              onClick={fetchDeliveryList}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
            >
              Fetch Data
            </button> */}
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
            >
              Search
            </button>
          </div>

          {/* POD Summary */}
          {/* <div className="flex-1 bg-white p-4 rounded-lg ">
            <h3 className="text-xl text-black font-bold mb-4">POD Summary</h3>
            <div className="flex gap-8 items-center">
              <div style={{ width: "300px", height: "300px" }}>
                <CircularProgressbar
                  value={(totalReceived / totalRecords) * 100 || 0}
                  text={`${((totalReceived / totalRecords) * 100 || 0).toFixed(1)}%`}
                  styles={buildStyles({
                    textColor: "black",
                    pathColor: "#3b82f6",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>
              <div>
                <p className="text-xl font-bold text-black">Total Received:</p>
                <p className="text-6xl font-bold text-blue-600">{totalReceived}</p>
                <p className="text-lg font-bold text-black">Total POD:</p>
                <p className="text-6xl font-bold text-gray-700">{totalRecords}</p>
              </div>
            </div>
          </div> */}

          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="text-center">
                  <img src={loadingGif} alt="Loading..." className="w-[48rem] h-auto" />
                </div>
            </div>
            )}

          <div className="flex-1 bg-white p-4 rounded-lg mt-12 ml-8">
            <h3 className="text-xl text-black font-bold mb-4">
              POD Summary {new Date(podSummary.now_date).getDate()}{" "}
              {new Date(podSummary.now_date).toLocaleString("default", { month: "long" })}
            </h3>
            <div className="flex gap-8 items-center">
              <div style={{ width: "300px", height: "300px" }}>
                <CircularProgressbar
                  value={(podSummary.received_thismonth / podSummary.ttl_thismonth) * 100 || 0}
                  text={`${((podSummary.received_thismonth / podSummary.ttl_thismonth) * 100 || 0).toFixed(1)}%`}
                  styles={buildStyles({
                    textColor: "black",
                    pathColor: "#3b82f6",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>
              <div  className="self-start">
                <p className="text-l font-bold text-black">Received This Month:</p>
                <p className="text-2xl font-bold text-blue-600">{podSummary.received_thismonth}</p>
                <p className="text-xl font-bold text-black">Total This Month:</p>
                <p className="text-6xl font-bold text-blue-600">{podSummary.ttl_thismonth}</p>
                <p className="text-lg font-bold text-black">Total Last Month:</p>
                <p className="text-6xl font-bold text-gray-700">{podSummary.ttl_lastmonth}</p>
              </div>
              <div  className="self-start mt-14">
                <p className="text-xl font-bold text-black">Total This Week:</p>
                <p className="text-6xl font-bold text-blue-600">{podSummary.ttl_thisweek}</p>
                <p className="text-lg font-bold text-black">Total Last Week:</p>
                <p className="text-6xl font-bold text-gray-700">{podSummary.ttl_lastweek}</p>
              </div>
              <div  className="self-start">
                <p className="text-xl font-bold text-black">Total ECO:</p>
                <p className="text-3xl font-bold text-green-600">{podSummary.ttl_service_eco}</p>
                <p className="text-lg font-bold text-black">Total ONS:</p>
                <p className="text-3xl font-bold text-yellow-300">{podSummary.ttl_service_ons}</p>
                <p className="text-xl font-bold text-black">Total SDS:</p>
                <p className="text-3xl font-bold text-red-500">{podSummary.ttl_service_sds}</p>
                <p className="text-lg font-bold text-black">Total Darat:</p>
                <p className="text-3xl font-bold text-blue-700">{podSummary.ttl_service_darat}</p>
              </div>
            </div>
          </div>
        </div>

        {/* List DO */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl text-black font-bold mb-4">List DO</h3>
          {loadingDeliveryList ? (
            <p className="text-center text-gray-500">Loading delivery list...</p>
          ) : errorDeliveryList ? (
            <p className="text-center text-red-500">{errorDeliveryList}</p>
          ) : deliveryList.length === 0 ? (
            <p className="text-center text-gray-500">No deliveries found.</p>
          ) : (
            <div style={{ height: "700px", overflowY: "auto" }}>
              <ul className="space-y-4">
                {deliveryList.map((delivery, index) => (
                  <li
                    key={index}
                    className="p-4 border rounded-lg shadow-sm hover:bg-gray-100"
                  >
                    <Link
                      to={`/Dashboard/Kurir/ListDo/${delivery.code}`}
                      className="block text-black no-underline hover:underline"
                    >
                      <p className="font-semibold text-black">
                        Delivery Code: {delivery.code}
                      </p>
                      <p className="text-sm text-gray-600">
                        Date Processed:{" "}
                        {new Date(delivery.date_process).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Messenger: {delivery.messenger_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Pieces: {delivery.ttl_piece}
                      </p>
                      <p className="text-sm text-gray-600">
                        Chargeable Weight: {delivery.ttl_chargeable_weight} kg
                      </p>
                      <p className="text-sm text-gray-600">
                        Gross Weight: {delivery.ttl_gross_weight} kg
                      </p>
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

export default KurirDashboard;