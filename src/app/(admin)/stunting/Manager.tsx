"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Stunting" endpoint="/api/stunting" rowKey={(r:any) => r.id_sasaran_paud}
    columns={[{key:"nama_anak",label:"Nama Anak",render:(r:any)=><span>{r.kia?.tweb_penduduk_kia_anak_idTotweb_penduduk?.nama??"-"}</span>},{key:"kategori_usia",label:"Kategori Usia",render:(r:any)=>r.kategori_usia?"Balita":"Anak"}]}
    fields={[{name:"kategori_usia",label:"Kategori Usia",type:"select",options:[{value:1,label:"Balita"},{value:0,label:"Anak"}]}]} />
}
