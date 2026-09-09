"""Original, deterministic, periodic PBR surfaces. No photographs or external assets."""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'dist/textures';out.mkdir(exist_ok=True)
rng=np.random.default_rng(146);N=1024

def periodic(scale):
    # Fourier-filtered periodic noise has no seam when tiled.
    n=rng.normal(0,1,(N,N));fy=np.fft.fftfreq(N)[:,None];fx=np.fft.fftfreq(N)[None,:]
    a=np.fft.ifft2(np.fft.fft2(n)*np.exp(-(fx*fx+fy*fy)*(scale*scale))).real
    return a/(a.std()+1e-9)

def save(name,rgb,height,rough,strength):
    dx=(np.roll(height,-1,1)-np.roll(height,1,1))*.5*strength
    dy=(np.roll(height,-1,0)-np.roll(height,1,0))*.5*strength
    normal=np.stack((-dx,-dy,np.ones_like(dx)),axis=-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
    Image.fromarray(np.uint8(np.clip(rgb,0,255))).save(out/f'{name}.jpg',quality=89,optimize=True)
    Image.fromarray(np.uint8(np.clip(rough,0,255))).save(out/f'{name}-rough.jpg',quality=82,optimize=True)
    Image.fromarray(np.uint8(np.clip((normal*.5+.5)*255,0,255))).save(out/f'{name}-normal.jpg',quality=90,optimize=True)

for name,base in [('concrete',(174,174,168)),('grass',(70,103,42)),('track',(143,84,66)),('paving',(162,164,161)),('metal',(172,183,191))]:
    fine=periodic(2.5);medium=periodic(18);broad=periodic(140)
    h=fine*.25+medium*.25;rough=np.clip(218+fine*6,0,255)
    rgb=np.array(base)[None,None,:]+fine[:,:,None]*4+medium[:,:,None]*2+broad[:,:,None]*3
    if name=='grass':
        # Thousands of short leaf strokes within a 2 m tile, with dark interstices.
        leaf=Image.new('L',(N,N),90);dr=ImageDraw.Draw(leaf)
        for _ in range(65000):
            x=int(rng.integers(N));y=int(rng.integers(N));dx=int(rng.integers(-3,4));dy=int(rng.integers(3,11));v=int(rng.integers(80,180))
            dr.line((x,y,x+dx,y+dy),fill=v,width=1)
        blade=np.array(leaf,dtype=float)-118
        rgb=np.array(base)[None,None,:]+blade[:,:,None]*np.array([.35,.48,.21])+medium[:,:,None]*np.array([3,4,2])+broad[:,:,None]*2
        h=blade*.018+fine*.15;rough=244+fine*3
    elif name=='concrete':
        pores=np.minimum(fine+1.4,0)*7
        rgb+=pores[:,:,None];h+=pores*.03;rough=226+fine*5
        # Subtle fine aggregate and casting variation at a three-metre repeat.
        aggregate=np.maximum(medium-.8,0)*1.6
        rgb-=aggregate[:,:,None];h+=aggregate*.025
        rough+=broad*2
    elif name=='track':
        speck=(fine>1.1)*9-(fine<-.8)*7;rgb+=speck[:,:,None];h+=speck*.04;rough=239+fine*3
    elif name=='paving':
        yy,xx=np.indices((N,N));joint=(xx%256<2)|(yy%256<2);edge=(xx%256<6)|(yy%256<6)
        slab=rng.uniform(-4,4,(4,4));rgb+=slab[yy//256,xx//256,None];rgb-=edge[:,:,None]*3;rgb-=joint[:,:,None]*25;h-=joint*.8;rough=229+fine*4
        grain=np.maximum(fine-1.1,0)*2;rgb+=grain[:,:,None];h+=grain*.03
    else:
        xx=np.arange(N);fold=np.cos(xx*2*np.pi/32);rib=np.maximum(0,fold)**8
        rgb+=fold[None,:,None]*3-rib[None,:,None]*9;h+=rib[None,:]*1.3;rough=164+fine*4+broad*3
        seam=(np.arange(N)[None,:]%512<2);rgb-=seam[:,:,None]*7;h+=seam*.35
    save(name,rgb,h,rough,.8 if name!='grass' else .5)
print('15 original 1024px PBR texture maps generated.')
