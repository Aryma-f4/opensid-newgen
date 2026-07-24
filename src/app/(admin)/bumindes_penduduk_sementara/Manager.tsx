"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Penduduk Sementara" endpoint="/api/bumindes_penduduk_sementara" rowKey={(r:any) => r.id}
    columns={[{key:"nik",label:"NIK"},{key:"nama",label:"Nama"},{key:"alamat_sekarang",label:"Alamat Sekarang"}]}
    fields={[{name:"nik",label:"NIK",type:"text",required:true},{name:"nama",label:"Nama",type:"text",required:true},{name:"alamat_sekarang",label:"Alamat Sekarang",type:"text"}]} />
}
