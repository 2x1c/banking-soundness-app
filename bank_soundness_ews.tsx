import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, AlertTriangle, Plus, Download, Upload } from 'lucide-react';

const BankSoundnessModel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [banks, setBanks] = useState([
    { id: 1, name: 'BTN', car: 18.5, npl: 4.2, roa: 1.8, roe: 12.5, ldr: 88, bopo: 78, nim: 4.5 },
    { id: 2, name: 'BRI', car: 23.5, npl: 2.8, roa: 3.2, roe: 15.8, ldr: 82, bopo: 68, nim: 6.8 },
    { id: 3, name: 'BNI', car: 20.2, npl: 2.5, roa: 2.5, roe: 14.2, ldr: 85, bopo: 72, nim: 5.2 },
    { id: 4, name: 'Mandiri', car: 22.8, npl: 2.3, roa: 3, roe: 16.5, ldr: 80, bopo: 65, nim: 6.5 },
  ]);
  const [selectedBank, setSelectedBank] = useState(banks[0]);
  const [manualInput, setManualInput] = useState({
    bankName: '',
    car: '',
    npl: '',
    roa: '',
    roe: '',
    ldr: '',
    bopo: '',
    nim: '',
  });

  const ojkThresholds = {
    car: { healthy: 12, warning: 8, critical: 0 },
    npl: { healthy: 5, warning: 8, critical: 12 },
    roa: { healthy: 1.5, warning: 0.5, critical: 0 },
    roe: { healthy: 12, warning: 8, critical: 0 },
    ldr: { healthy: 92, warning: 110, critical: 130 },
    bopo: { healthy: 85, warning: 90, critical: 95 },
    nim: { healthy: 3, warning: 1.5, critical: 0 },
  };

  const getHealthZone = (indicator, value) => {
    const thresholds = ojkThresholds[indicator];
    if (indicator === 'npl' || indicator === 'bopo' || indicator === 'ldr') {
      if (value <= thresholds.healthy) return { zone: 'Sehat', color: 'bg-green-100', textColor: 'text-green-800' };
      if (value <= thresholds.warning) return { zone: 'Waspada', color: 'bg-yellow-100', textColor: 'text-yellow-800' };
      return { zone: 'Kritis', color: 'bg-red-100', textColor: 'text-red-800' };
    } else {
      if (value >= thresholds.healthy) return { zone: 'Sehat', color: 'bg-green-100', textColor: 'text-green-800' };
      if (value >= thresholds.warning) return { zone: 'Waspada', color: 'bg-yellow-100', textColor: 'text-yellow-800' };
      return { zone: 'Kritis', color: 'bg-red-100', textColor: 'text-red-800' };
    }
  };

  const calculateCompositeScore = (bank) => {
    let zones = { 'Sehat': 0, 'Waspada': 0, 'Kritis': 0 };
    const indicators = ['car', 'npl', 'roa', 'roe', 'ldr', 'bopo', 'nim'];
    
    indicators.forEach(ind => {
      zones[getHealthZone(ind, bank[ind]).zone]++;
    });

    const score = (zones['Sehat'] / indicators.length) * 100;
    return Math.round(score);
  };

  const handleAddBank = () => {
    if (manualInput.bankName && manualInput.car) {
      const newBank = {
        id: banks.length + 1,
        name: manualInput.bankName,
        car: parseFloat(manualInput.car),
        npl: parseFloat(manualInput.npl) || 0,
        roa: parseFloat(manualInput.roa) || 0,
        roe: parseFloat(manualInput.roe) || 0,
        ldr: parseFloat(manualInput.ldr) || 0,
        bopo: parseFloat(manualInput.bopo) || 0,
        nim: parseFloat(manualInput.nim) || 0,
      };
      setBanks([...banks, newBank]);
      setSelectedBank(newBank);
      setManualInput({ bankName: '', car: '', npl: '', roa: '', roe: '', ldr: '', bopo: '', nim: '' });
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newBanks = lines.slice(1).filter(line => line.trim()).map((line, idx) => {
          const values = line.split(',');
          return {
            id: banks.length + idx + 1,
            name: values[headers.indexOf('name')] || values[0],
            car: parseFloat(values[headers.indexOf('car')]) || 0,
            npl: parseFloat(values[headers.indexOf('npl')]) || 0,
            roa: parseFloat(values[headers.indexOf('roa')]) || 0,
            roe: parseFloat(values[headers.indexOf('roe')]) || 0,
            ldr: parseFloat(values[headers.indexOf('ldr')]) || 0,
            bopo: parseFloat(values[headers.indexOf('bopo')]) || 0,
            nim: parseFloat(values[headers.indexOf('nim')]) || 0,
          };
        });
        setBanks([...banks, ...newBanks]);
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const template = 'name,car,npl,roa,roe,ldr,bopo,nim\nBank Name,12,5,1.5,12,92,85,3';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template));
    element.setAttribute('download', 'bank_template.csv');
    element.click();
  };

  const compositeScore = calculateCompositeScore(selectedBank);
  const comparisonData = banks.map(bank => ({
    name: bank.name,
    CAR: bank.car,
    NPL: bank.npl,
    ROA: bank.roa,
    ROE: bank.roe,
  }));

  const trendData = [
    { quarter: 'Q4 2024', BTN: 65, BRI: 78, BNI: 72, Mandiri: 80 },
    { quarter: 'Q1 2025', BTN: 68, BRI: 80, BNI: 74, Mandiri: 82 },
    { quarter: 'Q2 2025', BTN: 70, BRI: 82, BNI: 76, Mandiri: 84 },
    { quarter: 'Q3 2025', BTN: 72, BRI: 84, BNI: 78, Mandiri: 86 },
  ];

  const statusData = [
    { name: 'Sehat', value: banks.filter(b => calculateCompositeScore(b) >= 75).length },
    { name: 'Waspada', value: banks.filter(b => calculateCompositeScore(b) >= 50 && calculateCompositeScore(b) < 75).length },
    { name: 'Kritis', value: banks.filter(b => calculateCompositeScore(b) < 50).length },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Banking Soundness Model</h1>
            <p className="text-gray-600 text-sm">Financial Accounting Division</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">FAD Admin</p>
            <p className="text-xs text-gray-500">admin@btn.co.id</p>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-56 bg-white border-r min-h-screen p-6">
          <nav className="space-y-2">
            {['dashboard', 'comparison', 'reports', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                  activeTab === tab ? 'bg-blue-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'comparison' && '📈 Bank Comparison'}
                {tab === 'reports' && '📋 Reports'}
                {tab === 'settings' && '⚙️ Threshold Settings'}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Status Kesehatan Bank Keseluruhan</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center border-8 border-green-400">
                      <div>
                        <p className="text-3xl font-bold text-green-600">{compositeScore}</p>
                        <p className="text-xs text-gray-600">Score</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800">Sehat</p>
                    <p className="text-sm text-gray-600">Berdasarkan 7 indikator rasio keuangan OJK</p>
                  </div>
                  <div className="col-span-3">
                    <div className="grid grid-cols-2 gap-4">
                      {statusData.map((item, idx) => (
                        <div key={item.name} className="p-4 bg-gray-50 rounded text-center">
                          <p className={`text-2xl font-bold ${
                            idx === 0 ? 'text-green-600' : idx === 1 ? 'text-yellow-600' : 'text-red-600'
                          }`}>{item.value}</p>
                          <p className="text-sm text-gray-600">{item.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Indikator Rasio Keuangan - {selectedBank.name}</h3>
                <div className="grid grid-cols-4 gap-4">
                  {['car', 'npl', 'roa', 'roe', 'ldr', 'bopo', 'nim'].map(indicator => {
                    const zone = getHealthZone(indicator, selectedBank[indicator]);
                    const labels = {
                      car: 'Capital Adequacy Ratio',
                      npl: 'Non Performing Loan',
                      roa: 'Return on Assets',
                      roe: 'Return on Equity',
                      ldr: 'Loan to Deposit Ratio',
                      bopo: 'Biaya Operasional',
                      nim: 'Net Interest Margin',
                    };
                    return (
                      <div key={indicator} className={`p-4 rounded-lg border-2 ${zone.color}`}>
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-sm font-semibold ${zone.textColor}`}>
                            {indicator.toUpperCase()}
                          </span>
                          {zone.zone === 'Sehat' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {zone.zone === 'Waspada' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                          {zone.zone === 'Kritis' && <AlertCircle className="w-4 h-4 text-red-600" />}
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{selectedBank[indicator].toFixed(1)}%</p>
                        <p className="text-xs text-gray-600 mt-2">{labels[indicator]}</p>
                        <div className="h-2 bg-gray-300 rounded mt-2">
                          <div className={`h-full rounded ${
                            zone.zone === 'Sehat' ? 'bg-green-500' : zone.zone === 'Waspada' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} style={{width: Math.min(selectedBank[indicator] / 100 * 100, 100) + '%'}}></div>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${zone.color} ${zone.textColor}`}>
                          {zone.zone}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Tren Rasio Keuangan - 4 Kuartal Terakhir</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="BTN" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="BRI" stroke="#ef4444" />
                    <Line type="monotone" dataKey="BNI" stroke="#10b981" />
                    <Line type="monotone" dataKey="Mandiri" stroke="#f59e0b" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Perbandingan Antar Bank Himbara</h2>
                <h3 className="text-lg font-semibold mb-4">Perbandingan Capital Adequacy Ratio (CAR)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={banks.map(b => ({ name: b.name, CAR: b.car }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="CAR" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>

                <h3 className="text-lg font-semibold mt-8 mb-4">Perbandingan Semua Rasio</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="CAR" fill="#3b82f6" />
                    <Bar dataKey="NPL" fill="#ef4444" />
                    <Bar dataKey="ROA" fill="#10b981" />
                    <Bar dataKey="ROE" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>

                <h3 className="text-lg font-semibold mt-8 mb-4">Tabel Perbandingan Detail</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="px-4 py-2 text-left">Bank</th>
                        <th className="px-4 py-2 text-center">CAR (%)</th>
                        <th className="px-4 py-2 text-center">NPL (%)</th>
                        <th className="px-4 py-2 text-center">ROA (%)</th>
                        <th className="px-4 py-2 text-center">ROE (%)</th>
                        <th className="px-4 py-2 text-center">LDR (%)</th>
                        <th className="px-4 py-2 text-center">BOPO (%)</th>
                        <th className="px-4 py-2 text-center">NIM (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banks.map(bank => (
                        <tr key={bank.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedBank(bank)}>
                          <td className="px-4 py-2 font-semibold text-blue-600">{bank.name}</td>
                          <td className="px-4 py-2 text-center">{bank.car.toFixed(1)}</td>
                          <td className="px-4 py-2 text-center">{bank.npl.toFixed(1)}</td>
                          <td className="px-4 py-2 text-center">{bank.roa.toFixed(1)}</td>
                          <td className="px-4 py-2 text-center">{bank.roe.toFixed(1)}</td>
                          <td className="px-4 py-2 text-center">{bank.ldr.toFixed(1)}</td>
                          <td className="px-4 py-2 text-center">{bank.bopo.toFixed(1)}</td>
                          <td className="px-4 py-2 text-center">{bank.nim.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-6">Laporan & Ekspor Data</h2>
              <p className="text-gray-600 mb-6">Unduh laporan kesehatan bank dalam format PDF atau Excel</p>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Pengaturan Laporan</h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Periode Laporan</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Q3 2025</option>
                      <option>Q2 2025</option>
                      <option>Q1 2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Jenis Laporan</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Laporan Komprehensif</option>
                      <option>Ringkasan Eksekutif</option>
                      <option>Laporan Rasio Keuangan</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <button className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Ekspor ke PDF
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Ekspor ke Excel
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Template Laporan Tersedia</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="font-semibold">📊 Laporan Komprehensif</p>
                    <p className="text-sm text-gray-600 mt-2">Laporan lengkap mencakup semua rasio, analisis tren, dan rekomendasi</p>
                  </div>
                  <div className="p-4 border rounded-lg border-blue-500 bg-blue-50">
                    <p className="font-semibold">📋 Ringkasan Eksekutif</p>
                    <p className="text-sm text-gray-600 mt-2">Ringkasan untuk manajemen dengan highlights dan alert kritis</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Pengaturan Threshold</h2>
                <p className="text-gray-600 mb-6">Atur nilai ambang batas untuk setiap rasio keuangan</p>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Konfigurasi Threshold Rasio</h3>
                  <div className="space-y-4">
                    {Object.entries(ojkThresholds).map(([key, values]) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg border">
                        <label className="block font-semibold text-gray-800 mb-2 uppercase text-sm">{key}</label>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Nilai Threshold</p>
                            <input type="number" value={values.healthy} className="w-full px-3 py-2 border rounded" readOnly />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Standar OJK</p>
                            <input type="text" value={values.healthy + '%'} className="w-full px-3 py-2 border rounded" readOnly />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Status</p>
                            <span className="inline-block px-3 py-2 bg-green-100 text-green-800 text-sm rounded font-semibold">Default</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-6">Tambah Data Bank</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Input Manual</h3>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nama Bank"
                      value={manualInput.bankName}
                      onChange={(e) => setManualInput({...manualInput, bankName: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="CAR (%)"
                      value={manualInput.car}
                      onChange={(e) => setManualInput({...manualInput, car: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="NPL (%)"
                      value={manualInput.npl}
                      onChange={(e) => setManualInput({...manualInput, npl: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ROA (%)"
                      value={manualInput.roa}
                      onChange={(e) => setManualInput({...manualInput, roa: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="ROE (%)"
                      value={manualInput.roe}
                      onChange={(e) => setManualInput({...manualInput, roe: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="LDR (%)"
                      value={manualInput.ldr}
                      onChange={(e) => setManualInput({...manualInput, ldr: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="BOPO (%)"
                      value={manualInput.bopo}
                      onChange={(e) => setManualInput({...manualInput, bopo: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="NIM (%)"
                      value={manualInput.nim}
                      onChange={(e) => setManualInput({...manualInput, nim: e.target.value})}
                      className="px-3 py-2 border rounded"
                    />
                  </div>
                  <button onClick={handleAddBank} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Bank
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Import CSV</h3>
                  <div className="flex gap-4">
                    <label className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload CSV
                      <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                    </label>
                    <button onClick={downloadTemplate} className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Template
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">Format CSV: name, car, npl, roa, roe, ldr, bopo, nim</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankSoundnessModel;