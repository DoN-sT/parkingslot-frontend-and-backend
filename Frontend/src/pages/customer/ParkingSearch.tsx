import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ParkingFacility } from "../../types";
import Map from "../../components/common/Map";
import Button from "../../components/common/Button";
import { Search, MapPin, Filter, Car, Zap, DollarSign, Grid, List } from "lucide-react";

export const ParkingSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [selectedFacility, setSelectedFacility] = useState<ParkingFacility | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const fetchParking = async () => {
    setLoading(true);
    try {
      const res = await api.get("/parking", {
        params: { search, maxPrice },
      });
      if (res.data.success) {
        setFacilities(res.data.data);
      }
    } catch (err) {
      console.error("Error searching parking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParking();
  }, [search, maxPrice]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Search Parking Facilities</h1>
          <p className="text-xs text-slate-400 font-medium">Discover and compare available parking bays across the city</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              viewMode === "grid" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Grid View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              viewMode === "map" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Map View
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by facility name, street, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>Max Price Per Hour</span>
              <span className="font-bold text-blue-400">${maxPrice}/hr</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button size="sm" variant="outline" onClick={() => { setSearch(""); setMaxPrice(50); }}>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> Interactive Spatial Map Selection
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">Click markers to inspect & book bay slots</span>
          </div>
          <Map
            facilities={facilities}
            onSelectFacility={(fac) => navigate(`/customer/parking/${fac.id}`)}
            height="h-[500px]"
          />
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-900 h-64 rounded-2xl animate-pulse border border-slate-800"></div>
              ))}
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-3">
              <Car className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Parking Facilities Found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or price filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {facilities.map((fac) => (
                <div
                  key={fac.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-950">
                    <img
                      src={fac.images[0]}
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-emerald-400">
                      ${fac.hourlyRate}/hr
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-white">
                      {fac.availableSlotsCount ?? fac.totalSlots} Slots Available
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
                        {fac.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" /> {fac.address}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {fac.facilities.map((f, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Hours: {fac.openingTime} - {fac.closingTime}
                      </span>
                      <Link to={`/customer/parking/${fac.id}`}>
                        <Button size="sm" variant="primary">
                          View & Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkingSearch;
