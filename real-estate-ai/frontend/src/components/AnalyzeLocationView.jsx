import React from 'react'
import { BadgeCheck, Shield, Flame, GraduationCap, Bus, Train, MapPin, TrendingUp, Target, Activity, Navigation, Info, Building2 } from 'lucide-react'
import MapPreview from './MapPreview'

export default function AnalyzeLocationView({ result }) {
  if (!result) return null

  const scorePct = Math.round((result?.score || 0) * 100)
  const riskLevel = (result?.risk?.level || 'N/A').toString()
  const riskColor = riskLevel === 'High' ? 'bg-red-100 text-red-700 border-red-200' : riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : riskLevel === 'Low' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Location Overview</h3>
          </div>

          <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location Score</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{scorePct}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${scorePct >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : scorePct >= 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-pink-500'}`} 
                style={{ width: `${scorePct}%` }}
              ></div>
            </div>
          </div>

          {result.summary && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {Array.isArray(result.bullets) && result.bullets.length > 0 && (
            <div className="space-y-2">
              {result.bullets.slice(0, 5).map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <BadgeCheck className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span className="text-gray-700">{b}</span>
                </div>
              ))}
            </div>
          )}

          {result.facility_summary && (
            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-700 font-medium">{result.facility_summary}</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-white to-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Risk Assessment</h3>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className={`text-sm font-bold px-4 py-2 rounded-lg border-2 shadow-md ${riskColor}`}>
              {riskLevel} Risk
            </span>
          </div>

          <div className="space-y-3">
            {result.risk?.factors?.map((f, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${f.severity >= 4 ? 'bg-red-100' : f.severity >= 3 ? 'bg-yellow-100' : 'bg-green-100'}`}>
                    <Shield className={`w-4 h-4 ${f.severity >= 4 ? 'text-red-600' : f.severity >= 3 ? 'text-yellow-600' : 'text-green-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">{f.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.severity >= 4 ? 'bg-red-100 text-red-700' : f.severity >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        Level {f.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result.risk?.summary && (
            <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
              <p className="text-sm text-gray-700">{result.risk.summary}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-green-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Hospitals</h3>
          </div>
          {Array.isArray(result.nearby?.hospitals) && result.nearby.hospitals.length > 0 ? (
            <div className="space-y-2">
              {result.nearby.hospitals.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <span className="text-gray-700 font-medium">{h.name}</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">{h.distance_km} km</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No hospitals found within 1.5 km</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-md">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Religious Places</h3>
          </div>
          {Array.isArray(result.nearby?.religious_places) && result.nearby.religious_places.length > 0 ? (
            <div className="space-y-2">
              {result.nearby.religious_places.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-gray-700">{r.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">{r.distance_km} km</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No religious places found within 1.5 km</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Emergency Services</h3>
          </div>
          {Array.isArray(result.nearby?.police) && result.nearby.police.length + (result.nearby?.fire_stations?.length || 0) > 0 ? (
            <div className="space-y-2">
              {(result.nearby?.police || []).map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-gray-700">{p.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{p.distance_km} km</span>
                </div>
              ))}
              {(result.nearby?.fire_stations || []).map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-gray-700">{f.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">{f.distance_km} km</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No emergency services found within 1.5 km</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Education</h3>
          </div>
          {Array.isArray(result.nearby?.schools) && result.nearby.schools.length + (result.nearby?.universities?.length || 0) > 0 ? (
            <div className="space-y-2">
              {(result.nearby?.schools || []).map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-gray-700">{s.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">{s.distance_km} km</span>
                </div>
              ))}
              {(result.nearby?.universities || []).map((u, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-gray-700">{u.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">{u.distance_km} km</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No schools or universities found within 1.5 km</p>
          )}
        </div>

  <div className="bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Transport & Roads</h3>
          </div>
          {Array.isArray(result.nearby?.bus_stations) && (result.nearby.bus_stations.length + (result.nearby?.train_stations?.length || 0) + (result.nearby?.roads?.length || 0) > 0) ? (
            <div className="space-y-2">
              {(result.nearby?.bus_stations || []).map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Bus className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-gray-700">{b.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">{b.distance_km} km</span>
                </div>
              ))}
              {(result.nearby?.train_stations || []).map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Train className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-gray-700">{t.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">{t.distance_km} km</span>
                </div>
              ))}
              {(result.nearby?.roads || []).map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-gray-700">{r.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">{r.distance_km} km</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No transport hubs or major roads found nearby</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-white to-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Supermarkets & Pharmacies</h3>
          </div>

          {((result.nearby?.supermarkets || []).length + (result.nearby?.pharmacies || []).length) > 0 ? (
            <div className="space-y-2">
              {(result.nearby?.supermarkets || []).map((s, i) => (
                <div key={`sm-${i}`} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="text-gray-700">{s.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">{s.distance_km} km</span>
                </div>
              ))}
              {(result.nearby?.pharmacies || []).map((p, i) => (
                <div key={`ph-${i}`} className="flex items-center justify-between p-2 bg-white rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-gray-700">{p.name}</span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">{p.distance_km} km</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No supermarkets or pharmacies found nearby</p>
          )}
        </div>
      </div>
    </div>
  )
}
