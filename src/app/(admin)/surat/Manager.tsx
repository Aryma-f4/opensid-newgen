"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Format Surat" endpoint="/api/surat" rowKey={(r:any) => r.id}
    columns={[{key:"kode_surat",label:"Kode Surat",render:(r:any)=><span className="font-mono">{r.kode_surat??"-"}</span>},{key:"nama",label:"Nama"},{key:"jenis",label:"Jenis"}]}
    fields={[{name:"kode_surat",label:"Kode Surat",type:"text",required:true},{name:"nama",label:"Nama",type:"text",required:true},{name:"jenis",label:"Jenis",type:"text"}]}
    extraRowActions={[{label:"Detail",icon:"fa-eye",href:(r:any)=>`/surat/${r.id}`}]} />
}
