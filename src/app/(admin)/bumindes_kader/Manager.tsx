"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Kader Pemberdayaan" endpoint="/api/bumindes_kader" rowKey={(r:any) => r.id}
    columns={[{key:"nama",label:"Nama"},{key:"jabatan",label:"Jabatan"},{key:"alamat",label:"Alamat"}]}
    fields={[{name:"nama",label:"Nama",type:"text",required:true},{name:"jabatan",label:"Jabatan",type:"text"},{name:"alamat",label:"Alamat",type:"text"}]} />
}
