const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();


  async function getRandomName() {
    const response = await fetch('https://randomuser.me/api?inc=name');
    const data = await response.json(); 
    const { first } = data.results[0].name; 
    return `${first}`; 
  }

  async function submitQuiz() {
    const url = 'https://interactief.ketnet.be/20/v1.cfm?id=AB56452B-80C7-4DBC-81B9-802D7A289DF1';
    await page.goto(url, { waitUntil: 'networkidle2' });

    const megaSelector = '#check_choix_2951711_3'; 
    await page.waitForSelector(megaSelector);
    await page.click(megaSelector);

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const currentURL = page.url();

    // no clue why this gets split or added
    // dont really do anything with it
    const urlParams = new URLSearchParams(currentURL.split('?')[1]);
    const cfid = urlParams.get('cfid');
    const uk = urlParams.get('uk');
    const cftoken = urlParams.get('cftoken');
    if (!cfid || !uk || !cftoken)
      console.log(`failed to fetch [cfid: ${cfid}, uk: ${uk}, cftoken: ${cftoken}]`);

    const randomName = await getRandomName();
    await page.waitForSelector('#choix_216666'); 
    await page.type('#choix_216666', randomName);

    const randomAgeIndex = Math.floor(Math.random() * 9) + 6; 
    await page.waitForSelector('#choix_2091272'); 
    await page.select('#choix_2091272', `${randomAgeIndex} jaar`);

    const submitButtonSelector = '#register'; 
    await page.waitForSelector(submitButtonSelector); 
    await page.click(submitButtonSelector); 

    await page.waitForResponse((response) => response.url().includes('/v1.cfm') && response.status() === 200);

    await page.waitForSelector('p', { timeout: 120000 });  

    // no clue if content needs to be checked
    // depends if it's one of those devs that send a 200 ok but its still an error
    const content = await page.content();

    const res = content.includes('<p>Bedankt!</p>') ? 'SUCCES' : 'FAILED';

    console.log('ATTEMPT: ' + res);
  }

  function cleanup() {
    console.log("Cleaning up resources...");
    if (browser)
      browser.close().catch((err) => console.error("Error closing browser:", err));

    process.exit();
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", cleanup);

  for (let i = 0;; i++) {
    console.log(`ATTEMPT: ${i + 1}`);
    await submitQuiz();
  }
})();
