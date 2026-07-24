"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Tanah Desa" endpoint="/api/bumindes_tanah_desa" rowKey={(r:any) => r.id}
    columns={[{key:"nama",label:"Nama"},{key:"luas",label:"Luas"},{key:"letak",label:"Letak"}]}
    fields={[{name:"nama",label:"Nama",type:"text",required:true},{name:"luas",label:"Luas",type:"text"},{name:"letak",label:"Letak",type:"text"}]} />
}
