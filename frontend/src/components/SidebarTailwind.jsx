import React from "react";

const Sidebar = () => (
  <aside className="bg-blue-700 text-white w-64 min-h-screen flex flex-col py-8 px-6 shadow-xl">
    <div className="mb-10 text-2xl font-extrabold tracking-tight">Smart Pet Care</div>
    <nav className="flex-1">
      <ul className="space-y-4">
        <li>
          <a href="/dashboard" className="flex items-center gap-3 font-bold text-lg hover:bg-blue-800 rounded-xl px-4 py-2 transition">
            <span>🏠</span> Dashboard
          </a>
        </li>
        <li>
          <a href="/pets" className="flex items-center gap-3 font-bold text-lg hover:bg-blue-800 rounded-xl px-4 py-2 transition">
            <span>🐾</span> My Pets
          </a>
        </li>
        <li>
          <a href="/appointments" className="flex items-center gap-3 font-bold text-lg hover:bg-blue-800 rounded-xl px-4 py-2 transition">
            <span>📅</span> Appointments
          </a>
        </li>
        <li>
          <a href="/consultations" className="flex items-center gap-3 font-bold text-lg hover:bg-blue-800 rounded-xl px-4 py-2 transition">
            <span>🎥</span> Consultations
          </a>
        </li>
        <li>
          <a href="/records" className="flex items-center gap-3 font-bold text-lg hover:bg-blue-800 rounded-xl px-4 py-2 transition">
            <span>📋</span> Medical Records
          </a>
        </li>
        <li>
          <a href="/notifications" className="flex items-center gap-3 font-bold text-lg hover:bg-blue-800 rounded-xl px-4 py-2 transition">
            <span>🔔</span> Notifications
          </a>
        </li>
        <li>
          <a href="/admin" className="flex items-center gap-3 font-bold text-lg hover:bg-blue-800 rounded-xl px-4 py-2 transition">
            <span>🛠️</span> Admin
          </a>
        </li>
      </ul>
    </nav>
    <div className="mt-auto pt-8">
      <button className="w-full bg-white text-blue-700 font-bold py-2 rounded-xl hover:bg-blue-100 transition">Logout</button>
    </div>
  </aside>
);

export default Sidebar;
