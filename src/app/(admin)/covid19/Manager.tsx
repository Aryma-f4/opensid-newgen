"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Covid-19" endpoint="/api/covid19" rowKey={(r:any) => r.id}
    columns={[{key:"nama",label:"Nama"},{key:"status",label:"Status"},{key:"tanggal",label:"Tanggal",render:(r:any)=>r.tanggal?.toLocaleDateString?.("id-ID")??"-"},{key:"suhu",label:"Suhu"},{key:"keterangan",label:"Keterangan"}]}
    fields={[{name:"nama",label:"Nama",type:"text",required:true},{name:"status",label:"Status",type:"text"},{name:"tanggal",label:"Tanggal",type:"date"},{name:"suhu",label:"Suhu",type:"number"},{name:"keterangan",label:"Keterangan",type:"text"}]} />
}
