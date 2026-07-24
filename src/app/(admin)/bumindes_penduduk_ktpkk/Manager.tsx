"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Penduduk KTP/KK" endpoint="/api/bumindes_penduduk_ktpkk" rowKey={(r:any) => r.id}
    columns={[{key:"nik",label:"NIK"},{key:"nama",label:"Nama"},{key:"status_ktp",label:"Status KTP"}]}
    fields={[{name:"nik",label:"NIK",type:"text",required:true},{name:"nama",label:"Nama",type:"text",required:true},{name:"status_ktp",label:"Status KTP",type:"text"}]} />
}
