"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Permohonan Surat" endpoint="/api/surat_mohon" rowKey={(r:any) => r.id}
    columns={[{key:"keterangan",label:"Keperluan"},{key:"created_at",label:"Tanggal",render:(r:any)=>r.created_at?.toLocaleDateString?.("id-ID")??"-"}]}
    fields={[{name:"keterangan",label:"Keperluan",type:"text",required:true}]} />
}
