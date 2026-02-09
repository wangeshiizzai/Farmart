import React from 'react'
import { Link } from 'react-router-dom'

export default function TopNav() {
  return (
    <nav className="bg-gray-900 text-white py-6 px-8 flex items-center justify-between">
      {/* Left side - Links */}
      <div className="flex gap-24 flex-1">
        <Link to="/" className="text-3xl font-bold uppercase hover:text-blue-400 transition">
          Home
        </Link>
        <Link to="/market" className="text-3xl font-bold uppercase hover:text-blue-400 transition">
          Market
        </Link>
        <Link to="/delivery" className="text-3xl font-bold uppercase hover:text-blue-400 transition">
          Delivery
        </Link>
        <Link to="/contact" className="text-3xl font-bold uppercase hover:text-blue-400 transition">
          Contact Us
        </Link>
      </div>

      {/* Right side - Search field */}
      <input
        type="text"
        placeholder="Search products"
        className="px-4 py-2 rounded-lg text-black bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
      />
    </nav>
  )
}