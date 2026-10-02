"""Visual regression checks against a local server. No real accounts or cloud writes.
Requires Playwright + Chromium. Run: python3 scripts/check-visual.py
Set FAGIOLINI_TEST_URL to override http://localhost:8765.
Checks touch/desktop widths, light/dark themes, actual text contrast and page errors.
"""
import asyncio,json,os
from playwright.async_api import async_playwright

def contrast(a,b):
 def lum(c):
  rgb=[int(x)/255 for x in c.replace('rgb(','').replace(')','').split(',')[:3]]
  rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
  return sum(x*y for x,y in zip(rgb,[.2126,.7152,.0722]))
 a,b=sorted([lum(a),lum(b)])
 return (b+.05)/(a+.05)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch()
  for mobile in [True,False]:
   c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=mobile,has_touch=mobile)
   page=await c.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('https://cdn.jsdelivr.net/**',lambda r:r.fulfill(content_type='application/javascript',body="window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>{}}})};"))
   await page.goto(os.environ.get('FAGIOLINI_TEST_URL','http://localhost:8765'),wait_until='domcontentloaded')
   await page.evaluate("loginScreen.classList.add('hidden')")
   for width in ([320,375,390,430,735,844,1024] if mobile else [900,1280]):
    await page.set_viewport_size({'width':width,'height':844})
    for theme in ['light','dark']:
     await page.evaluate('t=>{applyTheme(t);go("home")}',theme)
     sizes=await page.evaluate("""()=>{let s=e=>document.querySelector(e).getBoundingClientRect();return {vw:innerWidth,doc:document.documentElement.scrollWidth,home:s('#home').width,choices:s('.appEntryChoices').width,welcome:s('.momWelcome').width}}""")
     assert abs(sizes['home']-sizes['choices'])<1,(mobile,width,theme,sizes)
     assert abs(sizes['home']-sizes['welcome'])<1,(mobile,width,theme,sizes)
     assert sizes['doc']<=sizes['vw'],(mobile,width,theme,sizes)
     colors=await page.evaluate("""()=>{let c=getComputedStyle(document.documentElement);return ['--ui-ink','--ui-muted','--ui-accent','--ui-surface','--ui-soft','--ui-action','--ui-on-action'].map(v=>{let e=document.createElement('span');e.style.color=c.getPropertyValue(v);document.body.append(e);let x=getComputedStyle(e).color;e.remove();return x;})}""")
     for fg,bg in [(0,3),(1,3),(1,4),(2,4),(6,5)]:assert contrast(colors[fg],colors[bg])>=4.5,(theme,fg,bg,contrast(colors[fg],colors[bg]))
     for view in ['calendar','children','person','menu','recipes','shop','organize','money','money-bills','money-moves','money-spending','money-savings','health','auto','maintenance','waste','reminders']:
      await page.evaluate("v=>v==='person'?openPerson('caty'):go(v)",view)
      assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(mobile,width,theme,view,'overflow')
      issues=await page.evaluate('''()=>{const parse=s=>s.match(/[\\d.]+/g)?.map(Number);const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);let out=[];for(let el of document.querySelectorAll('.view.on *,nav.mobileNav *,header *')){if(!el.checkVisibility()||el.closest('svg,button:disabled')||!Array.from(el.childNodes).some(n=>n.nodeType===3&&n.textContent.trim()))continue;let cs=getComputedStyle(el),color=parse(cs.color);if(!color)continue;let bg=null,e=el,gradient=false;while(e){let s=getComputedStyle(e);if(s.backgroundImage!=='none')gradient=true;let b=parse(s.backgroundColor);if(b&&(b.length<4||b[3]===1)){bg=b;break;}e=e.parentElement;}if(!bg||gradient)continue;let l1=lum(color),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05),large=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&parseInt(cs.fontWeight)>=700);if(ratio<(large?3:4.5))out.push({tag:el.tagName,cls:el.className,text:el.textContent.trim().slice(0,50),fg:cs.color,bg:JSON.stringify(bg),ratio:+ratio.toFixed(2)});}return out;}''')
      assert not issues,(mobile,width,theme,view,issues)
     print('PASS',mobile,width,theme,'full-width pages; no overflow; palette contrast >=4.5',flush=True)
   assert not errors,errors
   await c.close()
  await b.close()
asyncio.run(main())
