"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Rencana Pembangunan" endpoint="/api/bumindes_rencana_pembangunan" rowKey={(r:any) => r.id}
    columns={[{key:"nama_kegiatan",label:"Nama Kegiatan"},{key:"lokasi",label:"Lokasi"},{key:"anggaran",label:"Anggaran",render:(r:any)=>Number(r.anggaran??0).toLocaleString("id-ID")}]}
    fields={[{name:"nama_kegiatan",label:"Nama Kegiatan",type:"text",required:true},{name:"lokasi",label:"Lokasi",type:"text"},{name:"anggaran",label:"Anggaran",type:"number"}]} />
}
