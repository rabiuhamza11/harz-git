#!/usr/bin/env python3
# One clean merged pass: seed sites + hub pages, raised caps, depth 3, links stored.
from crawler import Crawler, norm_url
import crawler as C

HUBS = {
 "EDUCATION": ["https://en.wikipedia.org/wiki/Portal:Contents","https://en.wikipedia.org/wiki/Nigeria",
  "https://en.wikipedia.org/wiki/Computer_science","https://en.wikipedia.org/wiki/Education",
  "https://en.wikipedia.org/wiki/Science","https://en.wikipedia.org/wiki/Business",
  "https://simple.wikipedia.org/wiki/Main_Page","https://www.khanacademy.org/science",
  "https://openstax.org/subjects","https://ocw.mit.edu/search/","https://nptel.ac.in/courses",
  "https://developer.mozilla.org/en-US/docs/Learn","https://developer.mozilla.org/en-US/docs/Web/API"],
 "NIGERIA-NEWS-BUSINESS": ["https://punchng.com/topics/","https://punchng.com/editorial/",
  "https://techcabal.com/category/news/","https://nairametrics.com/category/business/",
  "https://businessday.ng/categories/","https://techpoint.africa/category/startups/","https://guardian.ng/business/"],
 "TECHNOLOGY": ["https://docs.python.org/3/tutorial/index.html","https://docs.python.org/3/library/index.html",
  "https://nodejs.org/en/learn","https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
  "https://web.dev/learn","https://developers.cloudflare.com/workers/how-it-works/"],
 "SCIENCE": ["https://science.nasa.gov/solar-system/","https://www.noaa.gov/news",
  "https://www.usgs.gov/news","https://arxiv.org/list/cs.NI/recent"],
 "NIGERIA-GOV": ["https://www.cbn.gov.ng/News/","https://efcc.gov.ng/efcc/news","https://ncdc.gov.ng/news",
  "https://www.nafdac.gov.ng/index.php/news","https://nitda.gov.ng/news-events/"],
 "OPEN-SOURCE": ["https://www.gnu.org/software/","https://www.rust-lang.org/learn","https://go.dev/doc/",
  "https://www.postgresql.org/docs/","https://nginx.org/en/docs/"],
}
RAISED = {"en.wikipedia.org":55,"developer.mozilla.org":45,"docs.python.org":25,
 "punchng.com":25,"simple.wikipedia.org":25,"ocw.mit.edu":20,"www.khanacademy.org":15,
 "nairametrics.com":20,"techcabal.com":20,"businessday.ng":20,"guardian.ng":20,
 "techpoint.africa":15,"www.gnu.org":12,"www.rust-lang.org":10,"go.dev":10,
 "www.postgresql.org":12,"nginx.org":12,"science.nasa.gov":15,"www.noaa.gov":10,
 "www.usgs.gov":10,"arxiv.org":12,"www.cbn.gov.ng":15,"efcc.gov.ng":15,
 "ncdc.gov.ng":15,"www.nafdac.gov.ng":15,"nitda.gov.ng":15,"web.dev":12,
 "developers.cloudflare.com":15,"nodejs.org":12,"nptel.ac.in":12}

C.DEFAULT_DOMAIN_CAP = 15
C.MAX_DEPTH = 3
for k,v in RAISED.items(): C.BIG_SITES[k] = v

c = Crawler()
for cat, urls in HUBS.items():
    for u in urls:
        nu = norm_url(u)
        if nu and nu not in c.seen_urls:
            c.seen_urls.add(nu); c.queue.append((nu,0,cat))
c.run(target=1400, workers=24, minutes=10)
