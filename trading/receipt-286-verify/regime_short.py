import json, statistics, math
src=open("harness/grid3.py").read()
g={}; exec(src.split("okx_sigs=signals_from")[0], g)
C=g["C"]; signals_from=g["signals_from"]; atr14=g["atr14"]
HOR=10; COST=0.007

okx=signals_from(C["okx"]); krk=signals_from(C["kraken"])
oks=min(s["ts"] for s in okx); out=[s for s in krk if s["ts"]<oks]

def resolve(sig, side, tgt_mult, stop_mult=2.0):
    rows=sig["rows"]; i=sig["i"]; fill=sig["close"]
    if side=="long":
        stop=fill-stop_mult*sig["atr"]; risk=fill-stop
        if risk<=0: return None
        tgt=fill+tgt_mult*risk
        for j in range(i+1,min(i+HOR,len(rows))):
            hs=rows[j][3]<=stop; ht=rows[j][2]>=tgt
            if hs and ht: return None
            if hs: return -1.0-COST*fill/risk
            if ht: return tgt_mult-COST*fill/risk
        return None
    else:
        stop=fill+stop_mult*sig["atr"]; risk=stop-fill
        if risk<=0: return None
        tgt=fill-tgt_mult*risk
        for j in range(i+1,min(i+HOR,len(rows))):
            hs=rows[j][2]>=stop; ht=rows[j][3]<=tgt
            if hs and ht: return None
            if hs: return -1.0-COST*fill/risk
            if ht: return tgt_mult-COST*fill/risk
        return None

def stats(Rs):
    if not Rs: return None
    w=[r for r in Rs if r>0]; l=[r for r in Rs if r<=0]
    pf=(sum(w)/abs(sum(l))) if l and sum(l)!=0 else float('inf')
    return dict(n=len(Rs),exp=statistics.mean(Rs),pf=pf,win=len(w)/len(Rs)*100)

print("=== HYPOTHESIS 1: is the edge directional? longs vs shorts, SAME signals, out-of-period")
for tm in (1.0,1.5,2.0):
    L=stats([r for r in (resolve(s,"long",tm) for s in out) if r is not None])
    S=stats([r for r in (resolve(s,"short",tm) for s in out) if r is not None])
    print(f"  1:{tm}  LONG n={L['n']:3d} exp={L['exp']:+.3f}R PF={L['pf']:.2f} win={L['win']:.0f}%  |  "
          f"SHORT n={S['n']:3d} exp={S['exp']:+.3f}R PF={S['pf']:.2f} win={S['win']:.0f}%")

print()
print("=== HYPOTHESIS 2: regime split (close vs own EMA50 at signal) — long-only, out-of-period")
def ema_last(vals,n):
    k=2/(n+1); e=vals[0]
    for x in vals[1:]: e=x*k+e*(1-k)
    return e
for tm in (1.0,1.5,2.0):
    bull=[];bear=[]
    for s in out:
        r=resolve(s,"long",tm)
        if r is None: continue
        closes=[row[4] for row in s["rows"][:s["i"]+1]]
        e50=ema_last(closes[-200:],50)
        (bull if s["close"]>e50 else bear).append(r)
    B=stats(bull); R=stats(bear)
    bs=f"n={B['n']:3d} exp={B['exp']:+.3f}R PF={B['pf']:.2f}" if B else "n=0"
    rs=f"n={R['n']:3d} exp={R['exp']:+.3f}R PF={R['pf']:.2f}" if R else "n=0"
    print(f"  1:{tm}  ABOVE EMA50 {bs}   |   BELOW EMA50 {rs}")
