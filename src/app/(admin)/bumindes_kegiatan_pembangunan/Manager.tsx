"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Kegiatan Pembangunan" endpoint="/api/bumindes_kegiatan_pembangunan" rowKey={(r:any) => r.uuid}
    columns={[{key:"program",label:"Program"},{key:"sumber_dana",label:"Sumber Dana"},{key:"besaran_dana",label:"Besaran Dana",render:(r:any)=>Number(r.besaran_dana??0).toLocaleString("id-ID")}]}
    fields={[{name:"program",label:"Program",type:"text",required:true},{name:"sumber_dana",label:"Sumber Dana",type:"text"},{name:"besaran_dana",label:"Besaran Dana",type:"number"}]} />
}
