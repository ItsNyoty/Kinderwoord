const puppeteer = require('puppeteer');
const fs = require('fs');

const repeatCount = 1000; 

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

    console.log('Selecteer "Mega" als antwoord.');
    const megaSelector = '#check_choix_2951711_3'; 
    await page.waitForSelector(megaSelector);
    await page.click(megaSelector);

    console.log('Wacht op de persoonlijke informatiepagina...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });


    const currentURL = page.url();
    const urlParams = new URLSearchParams(currentURL.split('?')[1]);
    const cfid = urlParams.get('cfid');
    const uk = urlParams.get('uk');
    const cftoken = urlParams.get('cftoken');

    console.log(`Gevonden cfid: ${cfid}`);
    console.log(`Gevonden uk: ${uk}`);
    console.log(`Gevonden cftoken: ${cftoken}`);

    console.log('Vul persoonlijke gegevens in...');
    const randomName = await getRandomName();
    await page.waitForSelector('#choix_216666'); 
    await page.type('#choix_216666', randomName);

    const randomAgeIndex = Math.floor(Math.random() * 9) + 6; 
    await page.waitForSelector('#choix_2091272'); 
    await page.select('#choix_2091272', `${randomAgeIndex} jaar`);

    console.log(`Ingevulde naam: ${randomName}`); 
    console.log(`Ingevulde leeftijd: ${randomAgeIndex + 5} jaar`);

    console.log('Verstuur de quiz via de submit-knop...');
    const submitButtonSelector = '#register'; 
    await page.waitForSelector(submitButtonSelector); 
    await page.click(submitButtonSelector); 


    console.log('Wacht op succesvolle POST-response...');
    await page.waitForResponse((response) => response.url().includes('/v1.cfm') && response.status() === 200);


    console.log('Wacht op de bevestigingstekst...');
    await page.waitForSelector('p', { timeout: 120000 });  

    const finalUrl = page.url(); 
    console.log('Eind URL:', finalUrl);

    const finalContent = await page.content();

    console.log('Quiz succesvol verzonden!');
  }

  for (let i = 0; i < repeatCount; i++) {
    console.log(`Verstuur poging ${i + 1} van ${repeatCount}`);
    await submitQuiz();
    console.log(`Poging ${i + 1} voltooid!`);
  }

  await browser.close();
})();
