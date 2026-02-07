'use client'
import { useState } from 'react'

export default function CTA () {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        //TODO:ここで実際の /api/subscribe 等へPOST
        await new Promise(r => setTimeout(r, 600))
        setSent(true)
    }
    
    if (sent) {
        return <p className="mt-4 text-sm text-emerald-400">You've been added to the invitation list. We'll be in touch soon.✉️</p>
    }

    return (
        <form onSubmit={onSubmit} className='mt-6 flex w-full max-w-lg items-center gap-3'>
            <input
              type="email"
              required
              placeholder='you@example.com'
              value={email}
              onChange={e=>setEmail(e.target.values)}
              className="flex-1 rounded-xl bg-zinc-900/60 px-4 py-3 outline-none ring-1 ring-zinc-800 focus:ring-brand-500"
        />
        <button className="btn" type="submit">Early Access</button>
        </form>
    )
    }
