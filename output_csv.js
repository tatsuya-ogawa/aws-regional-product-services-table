//output.csv

const awsService =require("./aws_service");

const fs = require("fs");
(async () => {
    const {services:services, regions:regions} = await awsService.getServices();
    const lines = [["service", "url", ...regions], ...Object.entries(services).map((props) => {
        const [service, prop] = props;
        return [service, prop.href, ...regions.map(r => prop.regions.includes(r) ? "1" : "")]
    })];
    fs.writeFileSync("data/aws-services.csv", lines.map(line => line.join(",")).join("\n"));
})();
