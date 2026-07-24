"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Hasil Pembangunan" endpoint="/api/bumindes_hasil_pembangunan" rowKey={(r:any) => r.id}
    columns={[{key:"nama_kegiatan",label:"Nama Kegiatan"},{key:"sumber_dana",label:"Sumber Dana"},{key:"anggaran",label:"Anggaran",render:(r:any)=>Number(r.anggaran??0).toLocaleString("id-ID")}]}
    fields={[{name:"nama_kegiatan",label:"Nama Kegiatan",type:"text",required:true},{name:"sumber_dana",label:"Sumber Dana",type:"text"},{name:"anggaran",label:"Anggaran",type:"number"}]} />
}
