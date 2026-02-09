import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuthToken, getUserDisplayName } from '../utils/session'

export default function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [query, setQuery] = useState('')
  const displayName = getUserDisplayName()
  const token = getAuthToken()

  useEffect(() => {
    let cancelled = false
    async function loadOrders() {
      const res = await fetch('https://farm-vwli.onrender.com/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await res.json()
      const items = Array.isArray(data.items) ? data.items : []
      if (!cancelled) setOrders(items)
    }
    loadOrders()
    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    try {
      setQuery(localStorage.getItem('searchQuery') || '')
    } catch {
      setQuery('')
    }
  }, [])

  const session = sessionStorage.getItem('user')
  const currentUser = session ? JSON.parse(session) : null
  const email = currentUser?.email

  const myOrders = useMemo(() => {
    if (!email) return orders
    return orders.filter((o) => (o.buyerEmail || o.user?.email) === email)
  }, [orders, email])

  return (
    <div className="min-h-screen bg-[#f3ffdf]">
      <header className="bg-[#071a11] text-white">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-bold text-green-950">F</div>
              <div className="font-semibold text-lg tracking-wide">Farmart</div>
            </div>

            <nav className="hidden md:flex items-center gap-10 text-sm font-semibold">
              <Link to="/" className="hover:text-green-300 transition">Home</Link>
              <Link to="/farmer/inventory" className="hover:text-green-300 transition">Market</Link>
              <Link to="/orders" className="hover:text-green-300 transition">Orders</Link>
              <Link to="/contact" className="hover:text-green-300 transition">Contact</Link>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-[#10291f] border border-[#284b3a] rounded-full px-4 py-2.5 w-64 text-sm">
                <span className="text-green-200">🔍</span>
                <input
                  className="bg-transparent placeholder-green-200/70 outline-none w-full"
                  placeholder="Search livestock..."
                  value={query}
                  onChange={(e) => {
                    const next = e.target.value
                    setQuery(next)
                    localStorage.setItem('searchQuery', next)
                  }}
                />
              </div>
              <Link
                to="/login"
                onClick={() => sessionStorage.removeItem('user')}
                className="rounded-full bg-[#10291f] border border-[#284b3a] px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#143226] transition"
              >
                {displayName}
                <span className="text-green-200">↗</span>
              </Link>
            </div>
          </div>
          <div className="text-center mt-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide">Order History</h1>
            <p className="text-green-300 mt-3">Your previous purchases and order status.</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {myOrders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-green-100 py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-500 flex items-center justify-center mx-auto mb-4">
              ⬚
            </div>
            <h3 className="text-lg font-semibold text-green-950">No orders yet</h3>
            <p className="text-sm text-green-700 mt-2">Orders you place will appear here.</p>
            <Link to="/farmer/inventory" className="mt-6 inline-block bg-[#071a11] text-white px-6 py-3 rounded-full font-semibold">
              Browse Market
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-green-950">Order {order.id}</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={`${order.id}-${idx}`} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-green-950">{item.title || item.name}</div>
                        <div className="text-xs text-green-700">
                          {item.qty || 1} × {item.weight || 'Item'}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-green-950">{item.price}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-green-100 flex items-center justify-between text-sm">
                  <span className="text-green-700">Total</span>
                  <span className="font-semibold text-green-950">${Number(order.total || 0).toLocaleString()}</span>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
