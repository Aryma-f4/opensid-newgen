import { redirect } from "next/navigation"

// Parity with original OpenSID Main controller: post-login dispatcher.
export default function MainPage() {
  redirect("/beranda")
}
