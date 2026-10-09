import { imageKind } from "@/lib/cms-validation";
export function imageInfo(bytes:Uint8Array) {
  const kind=imageKind(bytes); if (!kind || bytes.length<30) return null;
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength); let width=0,height=0;
  if (kind==="png" && new TextDecoder().decode(bytes.slice(12,16))==="IHDR") { width=view.getUint32(16); height=view.getUint32(20); }
  if (kind==="webp") {
    if (view.getUint32(4,true)+8!==bytes.length) return null;
    const format=new TextDecoder().decode(bytes.slice(12,16));
    if (format==="VP8X") { width=1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16); height=1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16); }
    if (format==="VP8L" && bytes[20]===47) { const size=view.getUint32(21,true); width=(size&16383)+1; height=((size>>>14)&16383)+1; }
    if (format==="VP8 " && bytes[23]===157 && bytes[24]===1 && bytes[25]===42) { width=view.getUint16(26,true)&16383; height=view.getUint16(28,true)&16383; }
  }
  if (kind==="jpg") {
    let offset=2;
    while(offset+4<bytes.length) {
      if(bytes[offset]!==255) break;
      const marker=bytes[offset+1]; offset+=2;
      if(marker===216 || marker===1) continue;
      if(marker===217 || marker===218) break;
      const length=view.getUint16(offset); if(length<2 || offset+length>bytes.length) break;
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker) && length>=8) { height=view.getUint16(offset+3); width=view.getUint16(offset+5); break; }
      offset+=length;
    }
  }
  return width>0 && height>0 && width<=8000 && height<=8000 && width*height<=24000000 ? {kind,width,height} : null;
}
