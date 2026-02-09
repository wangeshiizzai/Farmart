import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken, getUserDisplayName, isFarmerUser } from '../utils/session'

export default function Payment() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [showPaid, setShowPaid] = useState(false)
  const isFarmer = isFarmerUser()
  const displayName = getUserDisplayName()
  const dashboardLink = isFarmer ? '/farmer/home' : '/'
  const token = getAuthToken()

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

  async function handlePay() {
    const session = sessionStorage.getItem('user')
    const user = session ? JSON.parse(session) : null
    const farmerEmails = Array.from(
      new Set((cart || []).map((item) => item.ownerEmail).filter(Boolean))
    )
    const farmerEmail = farmerEmails.length === 1 ? farmerEmails[0] : null

    const order = {
      id: `order-${Date.now()}`,
      items: cart,
      subtotal,
      shipping,
      total,
      status: 'Pending',
      buyerName: user?.name || user?.username || 'Customer',
      buyerEmail: user?.email || 'customer@example.com',
      user: {
        name: user?.name || user?.username || 'Customer',
        email: user?.email || 'customer@example.com',
      },
      createdAt: new Date().toISOString(),
    }

    const res = await fetch('https://farm-vwli.onrender.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        farmerEmail,
      }),
    })
    if (!res.ok) {
      setShowPaid(false)
      return
    }

    localStorage.setItem('cart', JSON.stringify([]))
    setShowPaid(true)
    setTimeout(() => {
      setShowPaid(false)
      navigate('/')
    }, 1200)
  }

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
    <div className="min-h-screen bg-[#f3ffdf] relative">
      {showPaid && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 px-6 py-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2">
              ✓
            </div>
            <div className="font-semibold text-green-950">Payment successful</div>
            <div className="text-sm text-green-700">Your order has been placed.</div>
          </div>
        </div>
      )}
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
          <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">2</div>
          <div className="h-[2px] w-40 bg-green-600"></div>
          <div className="w-9 h-9 rounded-full bg-[#071a11] text-white flex items-center justify-center font-semibold">3</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-8">
              <h2 className="text-2xl font-bold text-green-950 mb-6">Payment Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-green-900 mb-2">Card Number</label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <span className="text-gray-400">💳</span>
                    <input className="w-full bg-transparent outline-none text-gray-900" placeholder="0000 0000 0000 0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">MM/YY</label>
                  <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-900 mb-2">CVV</label>
                  <input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-900" placeholder="CVV" />
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/shipping" className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-semibold text-center">
                  Back
                </Link>
                <button
                  onClick={handlePay}
                  className="flex-1 bg-[#071a11] text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2"
                >
                  Pay ${total.toLocaleString()}
                  <span>🔒</span>
                </button>
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
