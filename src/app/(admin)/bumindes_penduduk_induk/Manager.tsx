"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Penduduk Induk" endpoint="/api/bumindes_penduduk_induk" rowKey={(r:any) => r.id}
    columns={[{key:"nik",label:"NIK"},{key:"nama",label:"Nama"},{key:"sex",label:"L/P",render:(r:any)=>r.sex===1?"L":"P"}]}
    fields={[{name:"nik",label:"NIK",type:"text",required:true},{name:"nama",label:"Nama",type:"text",required:true},{name:"sex",label:"Jenis Kelamin",type:"select",options:[{value:1,label:"L"},{value:2,label:"P"}]}]} />
}
