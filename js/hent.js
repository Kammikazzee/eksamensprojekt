const {Builder, By, Key, until, promise} = require('selenium-webdriver');
const fs = require('fs');

let userdataJSON = fs.readFileSync('./user-credentials.json');

let userdata = JSON.parse(userdataJSON);

let username = userdata.user[0].name;
let password = userdata.user[0].password;

console.log("Username:", username + ", Password:", password);

(async function scrapeLudus() {
    let driver = await new Builder().withCapabilities({
        'browserName': 'firefox', 
        acceptSslCerts: true, 
        acceptInsecureCerts: true
    }).build()

    try {
        // Navigate to Rybners/Ludus login.
        await driver.get('https://ludus.rybners.dk/samllogin');

        await driver.findElement(By.name('UserName')).sendKeys(username);
        await driver.findElement(By.name('Password')).sendKeys(password);
        await driver.findElement(By.id("submitButton")).sendKeys(Key.RETURN);

        await driver.wait(until.titleIs('Skemaer'));
        await driver.wait(until.elementLocated(By.className('v-window-closebox'))).click();

        let menuKnapper = await driver.findElements(By.className('v-menubar-menuitem-caption'));

        /// Scrape under lektietabbet. ///

        let lektieKnap = menuKnapper[3];

        await lektieKnap.click();

        await driver.wait(until.titleIs('Lektier'));
        await driver.sleep(1000);

        console.log("sleep");
        await driver.sleep(1000);
        console.log("wake");

        let lektietabel = await driver.findElements(By.className('v-table-cell-wrapper'));

        // Clear the file's contents.
        fs.writeFile('lektier.txt', '', 'utf8', (err) => {
            if (err) throw err;
        });

        // Initialize iterator.
        let i = 0;
        promise.filter(lektietabel, (element) => {
            element.getText().then((tekst) => {
                console.log(tekst);

                // Append the new text.
                fs.appendFile('lektier.txt', tekst + '\n', 'utf8', (err) => {
                    if (err) throw err;
                    console.log('Text appended to lektier.txt');
                });
            });
        });
    
        /// Scrape under afleveringstabbet. ///

        let lektieMenuKnapper = await driver.findElements(By.className('v-caption'));
        let afleveringsKnap = await lektieMenuKnapper[1];

        await afleveringsKnap.click();

        console.log("sleep");
        await driver.sleep(1000);
        console.log("wake");

        let afleveringstabel = await driver.findElements(By.className('v-table-cell-wrapper'));

        // Clear the file's contents.
        fs.writeFile('afleveringer.txt', '', 'utf8', (err) => {
            if (err) throw err;
        });

        // Reset iterator.
        i = 0;
        promise.filter(afleveringstabel, (element) => {
            element.getText().then((tekst) => {
                console.log(tekst)

                // Append the new text.
                fs.appendFile('afleveringer.txt', tekst + '\n', 'utf8', (err) => {
                    if (err) throw err;
                    console.log('Text appended to afleveringer.txt');
                });
            });
        });
    } finally{
        //driver.quit();
    }
})();

