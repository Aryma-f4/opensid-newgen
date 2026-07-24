"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Arsip Surat Dinas" endpoint="/api/surat_dinas_arsip" rowKey={(r:any) => r.id}
    columns={[{key:"no_surat",label:"No Surat"},{key:"keterangan",label:"Keterangan"},{key:"tanggal",label:"Tanggal",render:(r:any)=>r.tanggal?.toLocaleDateString?.("id-ID")??"-"}]}
    fields={[{name:"no_surat",label:"No Surat",type:"text"},{name:"keterangan",label:"Keterangan",type:"text",required:true},{name:"tanggal",label:"Tanggal",type:"date"}]} />
}
