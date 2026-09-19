"""Keep geometry intact; downsize embedded images to 1024 for mobile delivery."""
import io,json,struct,sys
from pathlib import Path
from PIL import Image
for source,name in [('SABA SHIMON ALONE.glb','saba-alone.glb'),('SHALEV ALONE.glb','shalev-alone.glb')]:
    raw=(Path(sys.argv[1])/source).read_bytes(); n=struct.unpack_from('<I',raw,12)[0]
    doc=json.loads(raw[20:20+n]); binary=raw[28+n:]; replacements={}
    for image in doc.get('images',[]):
        index=image['bufferView']; view=doc['bufferViews'][index]; offset=view.get('byteOffset',0)
        im=Image.open(io.BytesIO(binary[offset:offset+view['byteLength']])).convert('RGB'); im.thumbnail((1024,1024),Image.Resampling.LANCZOS)
        out=io.BytesIO(); im.save(out,'JPEG',quality=88); replacements[index]=out.getvalue();image['mimeType']='image/jpeg'
    packed=bytearray()
    for index,view in enumerate(doc['bufferViews']):
        offset=view.get('byteOffset',0); data=replacements.get(index,binary[offset:offset+view['byteLength']])
        packed.extend(b'\0'*((-len(packed))%4));view['byteOffset']=len(packed);view['byteLength']=len(data);packed.extend(data)
    doc['buffers'][0]['byteLength']=len(packed);packed.extend(b'\0'*((-len(packed))%4))
    meta=json.dumps(doc,separators=(',',':')).encode();meta+=b' '*((-len(meta))%4)
    result=struct.pack('<III',0x46546c67,2,28+len(meta)+len(packed))+struct.pack('<II',len(meta),0x4e4f534a)+meta+struct.pack('<II',len(packed),0x004e4942)+packed
    (Path('dist/assets')/name).write_bytes(result);print(name,len(raw),'->',len(result))
