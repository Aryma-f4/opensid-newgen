"use client"
import CrudManager from "@/components/admin/CrudManager"
export default function Manager() {
  return <CrudManager title="Inventaris Kekayaan" endpoint="/api/bumindes_inventaris_kekayaan" rowKey={(r:any) => r.id}
    columns={[{key:"nama_barang",label:"Nama Barang"},{key:"kode_barang",label:"Kode Barang"},{key:"harga",label:"Harga",render:(r:any)=>Number(r.harga??0).toLocaleString("id-ID")}]}
    fields={[{name:"nama_barang",label:"Nama Barang",type:"text",required:true},{name:"kode_barang",label:"Kode Barang",type:"text"},{name:"harga",label:"Harga",type:"number"}]} />
}
