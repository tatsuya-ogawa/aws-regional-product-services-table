const puppeteer = require('puppeteer');
const fs = require("fs");
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto('https://aws.amazon.com/jp/about-aws/global-infrastructure/regional-product-services/');
        const regionSelector = ".aws-dropdown-wrapper.lb-dropdown ul li";
        const initSelector = ".aws-plc-content table tr td a"
        await page.waitForSelector(initSelector);
        page.on('console', msg => {
            for (let i = 0; i < msg._args.length; ++i)
                console.log(`${i}: ${msg._args[i]}`);
        });
        const regionsElem = await page.evaluate((selector) => {
            return Array.from(document.querySelectorAll(selector)).map(dom => {
                return {
                    region: dom.getAttribute("data-region"),
                    textContent: dom.textContent,
                    innerHTML: dom.innerHTML
                };
            });
        }, regionSelector);
        let dic = {};
        for (let i = 0; i < regionsElem.length; i++) {
            const region = regionsElem[i].region;

            await page.click('.aws-dropdown-wrapper .button');
            // await page.waitForTimeout(500);
            await page.waitForSelector(`.aws-dropdown-wrapper .js-open`);
            await page.evaluate((selector, index) => document.querySelectorAll(selector)[index].click(), regionSelector, i);
            const serviceSelector = `.aws-plc-content [data-region*="${region}"] table tr td a`
            await page.waitForSelector(serviceSelector);
            // await page.screenshot({path: `${region}.png`});
            const data = await page.evaluate((selector) => {
                return Array.from(document.querySelectorAll(selector)).map(dom => {
                    return {
                        href: dom.href,
                        textContent: dom.textContent,
                        innerHTML: dom.innerHTML
                    };
                });
            }, serviceSelector);
            dic[region] = data;
        }
        let services = {};
        for(const region in dic){
            dic[region].forEach((service)=>{
                services[service.textContent] = {
                    href: service.href,
                    regions: [...(services[service.textContent] || {regions:[]}).regions,region]
                }
            });
        }

        //output.csv
        const regions = regionsElem.map(r=>r.region);
        const lines = [["","",...regions],...Object.entries(services).map((props)=>{
            const [service,prop] = props;
            return [service,prop.href,...regions.map(r=>prop.regions.includes(r) ? "1":"")]
        })];
        fs.writeFileSync("aws-services.csv", lines.map(line=>line.join(",")).join("\n"));
    } catch (err) {
        console.log(err);
        // エラーが起きた際の処理
    } finally {
        await browser.close();
    }
})();