import json, random, statistics, math
src=open("harness/grid3.py").read()
prefix=src.split("okx_sigs=signals_from")[0]   # functions + cache only
g={}
exec(prefix, g)
C=g["C"]; signals_from=g["signals_from"]; evaluate=g["evaluate"]; atr14=g["atr14"]

random.seed(20261101)
okx=g["signals_from"](C["okx"]); krk=g["signals_from"](C["kraken"])
okx_start=min(s["ts"] for s in okx)
out_period=[s for s in krk if s["ts"]<okx_start]
rk=C["kraken"]

# random-entry control mirroring the signal dictionary exactly
rand_sigs=[]
for sym, rows in rk.items():
    if len(rows)<80: continue
    for _ in range(200):
        i=random.randint(60,len(rows)-2)
        rand_sigs.append(dict(sym=sym,i=i,ts=rows[i][0],close=rows[i][4],
            e20=rows[i][4],zlo=rows[i][4]*0.99,zhi=rows[i][4]*1.01,
            lo10=min(r[3] for r in rows[i-9:i+1])*0.985,
            atr=atr14(rows,i),rows=rows))
rand_out=[s for s in rand_sigs if s["ts"]<okx_start]

print("=== CONTROL: random entries, same ATR x2 stop, same rules, out-of-period window")
for tgt in (1.0,1.5,2.0):
    r=evaluate(rand_out,"market","atr2",tgt)
    print(f"  random  atr2/{tgt:<3} : n={r['n']:4d}  exp={r['exp']:+.3f}R  PF={r['pf']:.2f}  win={r['win']:.1f}%")
print()
print("=== SIGNAL vs RANDOM (same window, same geometry):")
for tgt in (1.0,1.5,2.0):
    s=evaluate(out_period,"market","atr2",tgt); r=evaluate(rand_out,"market","atr2",tgt)
    print(f"  atr2/{tgt:<3} signal {s['exp']:+.3f}R (n={s['n']:3d}) vs random {r['exp']:+.3f}R (n={r['n']:4d})  delta {s['exp']-r['exp']:+.3f}R")
print()
# buy-and-hold baseline over the same 10-day horizon
bh=[]
for sym,rows in rk.items():
    for i in range(60,len(rows)-11,7):
        if rows[i][0] < okx_start:
            bh.append((rows[i+10][4]-rows[i][4])/rows[i][4]*100)
if bh:
    print(f"=== BUY-AND-HOLD baseline (10-day, {len(bh)} samples): mean {statistics.mean(bh):+.2f}%  median {statistics.median(bh):+.2f}%")
