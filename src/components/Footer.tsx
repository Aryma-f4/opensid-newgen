import { getConfig, getSocialMedia } from "@/lib/helpers"

export default async function Footer() {
  const [config, sosmed] = await Promise.all([getConfig(), getSocialMedia()])
  if (!config) return null
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold mb-3">{config.nama_desa}</h3>
          <p className="text-sm">{config.alamat_kantor}</p>
          {config.email_desa && <p className="text-sm">Email: {config.email_desa}</p>}
          {config.telepon && <p className="text-sm">Telp: {config.telepon}</p>}
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">Media Sosial</h3>
          {sosmed.map((s: any) => (
            <a
              key={s.id}
              href={s.link}
              target="_blank"
              className="block text-sm hover:text-white mb-1"
            >
              {s.nama}
            </a>
          ))}
        </div>
        <div>
          <h3 className="text-white font-bold mb-3">Tentang</h3>
          <p className="text-sm">
            Sistem Informasi Desa {config.nama_desa} {config.nama_kecamatan},{" "}
            {config.nama_kabupaten}, {config.nama_propinsi}
          </p>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-xs">
        &copy; {new Date().getFullYear()} {config.nama_desa}. All rights reserved.
      </div>
    </footer>
  )
}
