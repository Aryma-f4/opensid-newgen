"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Rekapitulasi Penduduk" endpoint="/api/bumindes_penduduk_rekapitulasi" rowKey={(r:any) => r.id}
    columns={[{key:"dusun",label:"Dusun"},{key:"rw",label:"RW"},{key:"rt",label:"RT"},{key:"jumlah",label:"Jumlah"}]}
    fields={[{name:"dusun",label:"Dusun",type:"text"},{name:"rw",label:"RW",type:"text"},{name:"rt",label:"RT",type:"text"},{name:"jumlah",label:"Jumlah",type:"number"}]} />
}
