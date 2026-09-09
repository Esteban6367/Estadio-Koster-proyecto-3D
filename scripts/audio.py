"""Original synthetic ambience and footsteps, CC0. No recorded voices or third-party samples."""
from pathlib import Path
import wave
import numpy as np
out=Path(__file__).resolve().parents[1]/'dist/audio';out.mkdir(exist_ok=True)
rng=np.random.default_rng(5470);rate=22050

def save(name,x):
    x=np.clip(x,-.9,.9)
    with wave.open(str(out/(name+'.wav')),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(np.int16(x*32767).tobytes())

# Four individually generated sole/friction samples per file, at offsets 0/.5/1/1.5 s.
# No periodic 110 Hz impact. Smooth heel/toe envelopes and zero endpoints avoid clicks.
t=np.arange(int(.38*rate))/rate
fade=np.minimum(1,t/.025)*np.minimum(1,(.38-t)/.05)
for surface in ['paving','grass']:
    bank=[]
    for variant in range(4):
        noise=rng.normal(0,1,len(t))
        soft=np.convolve(noise,np.ones(13+variant*2)/(13+variant*2),'same')
        low=np.convolve(noise,np.ones(110)/110,'same')
        mid=soft-low
        heel=np.exp(-((t-(.055+variant*.003))/.026)**2)
        toe=np.exp(-((t-.155)/(.055+variant*.003))**2)
        rub=np.exp(-((t-.245)/.067)**2)
        x=(mid*(.16*heel+.13*toe+.09*rub)+low*(.11*heel+.09*toe))*fade if surface=='paving' else soft*(.14*toe+.15*rub)*fade
        bank.extend(x);bank.extend(np.zeros(int(.5*rate)-len(t)))
    save(surface,np.array(bank))
# Periodic low-level wind / road ambience. The loop has exactly matching endpoints.
cityrng=np.random.default_rng(5470);cityrng.normal(0,1,int(.29*rate))
n=rate*8;f=np.fft.rfftfreq(n,1/rate);spectrum=(cityrng.normal(size=len(f))+1j*cityrng.normal(size=len(f)))*np.exp(-f/1100);spectrum[f<55]=0
city=np.fft.irfft(spectrum,n);city/=max(abs(city));tt=np.arange(n)/rate
city*=.21*(.82+.18*np.sin(2*np.pi*tt/8))
save('city',city)
print('3 original mono WAVs generated: two banks of 4 soft steps plus city (22.05 kHz PCM16).')
