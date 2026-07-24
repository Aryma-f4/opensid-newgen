"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Tanah Kas Desa" endpoint="/api/bumindes_tanah_kas_desa" rowKey={(r:any) => r.id}
    columns={[{key:"nama",label:"Nama"},{key:"luas",label:"Luas"},{key:"perolehan",label:"Perolehan"}]}
    fields={[{name:"nama",label:"Nama",type:"text",required:true},{name:"luas",label:"Luas",type:"text"},{name:"perolehan",label:"Perolehan",type:"text"}]} />
}
