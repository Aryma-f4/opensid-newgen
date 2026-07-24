"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Surat Dinas" endpoint="/api/surat_dinas" rowKey={(r:any) => r.id}
    columns={[{key:"nomor",label:"Nomor"},{key:"perihal",label:"Perihal"},{key:"tujuan",label:"Tujuan"},{key:"tanggal",label:"Tanggal",render:(r:any)=>r.tanggal?.toLocaleDateString?.("id-ID")??"-"}]}
    fields={[{name:"nomor",label:"Nomor",type:"text"},{name:"perihal",label:"Perihal",type:"text",required:true},{name:"tujuan",label:"Tujuan",type:"text"},{name:"tanggal",label:"Tanggal",type:"date"}]} />
}
