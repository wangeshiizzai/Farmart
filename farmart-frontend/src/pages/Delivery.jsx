import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import cattleImage from '../assets/cattle.jpeg'
import { getAuthToken } from '../utils/session'

export default function Delivery() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [qty, setQty] = useState(1)
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const token = getAuthToken()

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('listings') || '[]')
    let found = all.find((l) => String(l.id) === String(id))
    if (!found) {
      // fallback sample (when visiting homepage samples)
      found = {
        id,
        title: 'Sample Holstein cow',
        price: 1200,
        description: 'Sample listing',
        img: cattleImage,
        ownerEmail: 'farmer@example.com',
      }
    }
    setListing(found)

    const session = sessionStorage.getItem('user')
    if (session) {
      const u = JSON.parse(session)
      if (u && u.email) setBuyerEmail(u.email)
      if (u && u.name) setBuyerName(u.name)
    }
  }, [id])

  function readOrders() {
    try {
      return JSON.parse(localStorage.getItem('orders') || '[]')
    } catch {
      return []
    }
  }

  function saveOrder(order) {
    const list = readOrders()
    list.unshift(order)
    localStorage.setItem('orders', JSON.stringify(list))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!buyerName || !buyerEmail) {
      alert('Please enter your name and email')
      return
    }

    setLoading(true)

    const priceNum = typeof listing.price === 'string' ? parseFloat(String(listing.price).replace(/[^0-9.]/g, '')) || 0 : Number(listing.price || 0)
    const total = priceNum * qty

    const order = {
      id: Date.now(),
      listingId: listing.id,
      buyerName,
      buyerEmail,
      farmerEmail: listing.ownerEmail || 'farmer@example.com',
      items: [{ name: listing.title || listing.name || 'Animal', qty, price: priceNum }],
      total,
      status: 'Pending',
      createdAt: Date.now(),
    }

    const res = await fetch('https://farm-vwli.onrender.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        items: order.items,
        total: order.total,
        farmerEmail: order.farmerEmail,
      }),
    })
    if (!res.ok) {
      setLoading(false)
      alert('Failed to place order')
      return
    }

    setTimeout(() => {
      setLoading(false)
      alert('Order placed — the farmer will be notified')
      navigate('/')
    }, 500)
  }

  if (!listing) return <div className="min-h-screen p-8">Loading...</div>

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex items-start justify-center">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <div className="flex gap-6">
          <img src={listing.img || 'https://via.placeholder.com/300x220'} alt={listing.title} className="w-48 h-40 object-cover rounded" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{listing.title || listing.name}</h2>
            <div className="text-gray-600 mb-3">{listing.description}</div>
            <div className="font-semibold text-lg mb-3">Price: ${typeof listing.price === 'number' ? listing.price : listing.price}</div>
            <div className="text-sm text-gray-500 mb-3">Seller: {listing.ownerEmail || 'farmer@example.com'}</div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700">Quantity</label>
                <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} className="w-28 px-3 py-2 border rounded text-black bg-white" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Your name</label>
                <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full px-3 py-2 border rounded text-black bg-white" placeholder="Your full name" />
              </div>

              <div>
                <label className="block text-sm text-gray-700">Your email</label>
                <input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="w-full px-3 py-2 border rounded text-black bg-white" placeholder="you@example.com" type="email" />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-700 text-white py-2 rounded" disabled={loading}>{loading ? 'Placing...' : 'Place Order'}</button>
                <button type="button" onClick={() => navigate(-1)} className="flex-1 bg-white border py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
