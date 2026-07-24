"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Penduduk Mutasi" endpoint="/api/bumindes_penduduk_mutasi" rowKey={(r:any) => r.id}
    columns={[{key:"nik",label:"NIK"},{key:"nama",label:"Nama"},{key:"keterangan",label:"Keterangan"}]}
    fields={[{name:"nik",label:"NIK",type:"text",required:true},{name:"nama",label:"Nama",type:"text",required:true},{name:"keterangan",label:"Keterangan",type:"text"}]} />
}
