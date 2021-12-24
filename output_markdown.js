//output.csv

const awsService =require("./aws_service");

const fs = require("fs");
(async () => {
    const {services:services, regions:regions} = await awsService.getServices();
    const lines = [["service", "url", ...regions],[" ---- ", " --- ", ...regions.map(_=>" --- ")], ...Object.entries(services).map((props) => {
        const [service, prop] = props;
        return [service, prop.href, ...regions.map(r => prop.regions.includes(r) ? "[x]" : "[]")]
    })];
    fs.writeFileSync("data/aws-services.md", lines.map(line => "|"+line.join("|")+"|").join("\n"));
})();
