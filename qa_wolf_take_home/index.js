// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try{
    // go to website
    await page.goto("https://news.ycombinator.com/newest");

    const timestamps = []
    
    while (timestamps.length < 100){

      //get what we want from the dom

      await page.waitForSelector('tr.athing + tr span.age', { timeout: 15000 });
      const pageDates = await page.$$eval('tr.athing', rows => {
        return rows.map(el => {
          const sib = el.nextElementSibling;
          const age = sib?.querySelector('span.age');
          return age?.getAttribute('title') || null;

          
        });
      });

      
      
      //change the info into just what we need
      for (const date of pageDates){
        if (!date) continue; 
        const iso = date.split(/\s+/)[0];
        const ms = Date.parse(iso);
        if (!Number.isNaN(ms)){
          timestamps.push(ms);
          if (timestamps.length >= 100) break;
            
        }
      
      }
      
      if (timestamps.length >= 100) break; 

      //click the more button at bottom 
      const hasmore = await page.$('a.morelink');
      if (!hasmore){
        console.error(`Only found ${timestamps.length} items and no More links.`);
        process.exitCode = 1;
        return;
      } 
      await Promise.all([
        page.waitForLoadState('domcontentloaded'),
        page.click('a.morelink'),
      ]);
      
      
   
    }

    //make sure we have enough
    if (timestamps.length < 100){
      console.error(`Only found ${timestamps.length} items (100 needed).`);
      process.exitCode = 1;
      return;
    }
    
   
    

    const first100 = timestamps.slice(0, 100);
    console.log("first timestamp", new Date(timestamps[0]).toISOString());
    console.log("last timestamp", new Date(timestamps[timestamps.length-1]).toISOString());

    //make sure they are in order
    let outOfOrder = false
    for (let i = 1; i < first100.length; i++){
      if(first100[i] > first100[i -1]){
        console.error(` FAIL: Out of order at index ${i}. Timestamps must be newest -> oldest`);
        outOfOrder = true;
        break;
      }
    }
    if (!outOfOrder){
      console.log("PASS: Articles are sorted newest -> oldest");
    }
  }finally{
    await browser.close();
  }
}

  


//whole function call
(async () => {
  await sortHackerNewsArticles();
})();
