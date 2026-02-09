import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserDisplayName, isFarmerUser } from '../utils/session'

export default function Shipping() {
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const isFarmer = isFarmerUser()
  const displayName = getUserDisplayName()
  const dashboardLink = isFarmer ? '/farmer/home' : '/'

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(Array.isArray(stored) ? stored : [])
    } catch {
      setCart([])
    }
  }, [])

  useEffect(() => {
    try {
      setQuery(localStorage.getItem('searchQuery') || '')
    } catch {
      setQuery('')
    }
  }, [])

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const raw = String(item.price || '').replace(/[^0-9.]/g, '')
      const val = raw ? Number(raw) : 0
      return sum + (Number.isNaN(val) ? 0 : val)
    }, 0)
  }, [cart])

  const shipping = cart.length ? 450 : 0
  const total = subtotal + shipping

  function updateQuantity(id, delta) {
    const next = cart.map((item) => {
      if (item.id !== id) return item
      const qty = Math.max(1, (item.qty || 1) + delta)
      return { ...item, qty }
    })
    setCart(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }

  function removeItem(id) {
    const next = cart.filter((i) => i.id !== id)
    setCart(next)
    localStorage.setItem('cart', JSON.stringify(next))
  }

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
              <Link to={dashboardLink} className="hover:text-green-300 transition">Dashboard</Link>
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
              <div className="relative">
                <Link to="/cart" className="w-10 h-10 rounded-full bg-[#10291f] border border-[#284b3a] flex items-center justify-center text-green-200">
                  🛒
                </Link>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">1</div>
          <div className="h-[2px] w-40 bg-green-600"></div>
          <div className="w-9 h-9 rounded-full bg-[#071a11] text-white flex items-center justify-center font-semibold">2</div>
          <div className="h-[2px] w-40 bg-green-200"></div>
          <div className="w-9 h-9 rounded-full bg-white border border-green-200 text-green-900 flex items-center justify-center font-semibold">3</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-8">
              <h2 className="text-2xl font-bold text-green-950 mb-6">Shipping Method</h2>

              <div className="border border-green-500 rounded-2xl p-5 flex items-center justify-between bg-green-50">
                <div className="flex items-center gap-4">
                  <span className="text-green-600 text-2xl">🚚</span>
                  <div>
                    <div className="font-semibold text-green-950">Professional Livestock Transport</div>
                    <div className="text-sm text-green-700">Climate controlled, vet-monitored. 3-5 days.</div>
                  </div>
                </div>
                <div className="font-semibold text-green-950">$450.00</div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/cart" className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-semibold text-center">
                  Back
                </Link>
                <Link to="/payment" className="flex-1 bg-[#071a11] text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2">
                  Continue to Payment
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6">
              <div className="flex items-center gap-2 text-green-950 font-semibold mb-4">
                <span>🧾</span>
                Order Summary ({cart.length} items)
              </div>

              <div className="space-y-4">
                {cart.length === 0 && (
                  <div className="text-sm text-green-700">No items in cart.</div>
                )}
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.img || item.image || 'https://via.placeholder.com/80'}
                      alt={item.title || item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-green-950">{item.title || item.name}</div>
                      <div className="text-xs text-green-700">{item.age || '8 weeks'} • {item.weight || '5-6 lbs'}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-gray-100 text-green-900 font-semibold"
                        >
                          −
                        </button>
                        <span className="text-sm">{item.qty || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-gray-100 text-green-900 font-semibold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-950">{item.price}</div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm">🗑</button>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-green-100 pt-4 text-sm text-green-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700">Shipping</span>
                  <span>${shipping.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold pt-2">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
