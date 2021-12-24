//output.csv

import {awsServices} from "./aws_services";

const fs = require("fs");
(async () => {
    const [services, regions] = await awsServices();

    const lines = [["", "", ...regions], ...Object.entries(services).map((props) => {
        const [service, prop] = props;
        return [service, prop.href, ...regions.map(r => prop.regions.includes(r) ? "1" : "")]
    })];
    fs.writeFileSync("aws-services.csv", lines.map(line => line.join(",")).join("\n"));
})();
