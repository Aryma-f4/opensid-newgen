"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

// Elemen form mengikuti login-form-elements.css asli (aksen #263238, teks putih di atas latar gelap).
export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError("Username atau password salah")
    } else {
      router.push("/main")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-[#dd4b39]/90 text-white p-3 rounded text-sm">{error}</div>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full rounded-[4px] bg-white/90 border border-transparent px-4 py-2.5 text-[#263238] placeholder-[#888] focus:outline-none focus:border-[#263238]"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full rounded-[4px] bg-white/90 border border-transparent px-4 py-2.5 text-[#263238] placeholder-[#888] focus:outline-none focus:border-[#263238]"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#263238] text-white py-2.5 rounded-[4px] font-medium hover:opacity-80 disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
    </form>
  )
}
