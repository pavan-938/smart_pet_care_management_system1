import React from "react";

const DashboardCard = ({ label, value, color = "blue" }) => (
  <div className={`rounded-2xl p-8 shadow-lg border-l-8 border-${color}-500 bg-white flex flex-col justify-center hover:scale-105 transition-transform duration-200`}>
    <span className="text-xs font-bold uppercase text-gray-400 mb-2">{label}</span>
    <span className="text-4xl font-extrabold text-gray-900">{value}</span>
  </div>
);

const Dashboard = ({ stats }) => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="mb-12">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-2">Smart Pet Care Dashboard</h1>
      <p className="text-lg text-gray-500 font-medium">Welcome to your professional veterinary telehealth platform.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <DashboardCard label="Total Appointments" value={stats.total} color="blue" />
      <DashboardCard label="Confirmed" value={stats.confirmed} color="green" />
      <DashboardCard label="Completed" value={stats.completed} color="purple" />
      <DashboardCard label="Pending" value={stats.pending} color="yellow" />
    </div>
    {/* Appointment Table Example */}
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Appointments</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pet</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Doctor</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody>
          {stats.appointments.map((apt, idx) => (
            <tr key={idx} className="hover:bg-blue-50">
              <td className="px-6 py-4 font-semibold text-gray-700">{apt.petName}</td>
              <td className="px-6 py-4 font-semibold text-gray-700">Dr. {apt.doctorName}</td>
              <td className="px-6 py-4 text-gray-500">{apt.date}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : apt.status === 'Completed' ? 'bg-purple-100 text-purple-700' : apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{apt.status}</span>
              </td>
              <td className="px-6 py-4">
                {apt.meetingLink && (
                  <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Join Consultation</a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default Dashboard;
