"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Arsip Surat" endpoint="/api/bumindes_arsip" rowKey={(r:any) => r.id}
    columns={[{key:"no_urut",label:"No Urut"},{key:"nama",label:"Nama"},{key:"tgl_upload",label:"Tgl Upload",render:(r:any)=>r.tgl_upload?.toLocaleDateString?.("id-ID")??"-"}]}
    fields={[{name:"no_urut",label:"No Urut",type:"text",required:true},{name:"nama",label:"Nama",type:"text"}]} />
}
