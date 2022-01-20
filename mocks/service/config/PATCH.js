const fs = require("fs");
let config = JSON.parse(
  fs.readFileSync("./mocks/service/config/GET.json", "utf8")
);

module.exports = function (request, response) {
  if (request.body.configId) {
    let selectedConfig = config.filter(
      (c) => c.configId === +request.body.configId
    )[0];
    const { configId, ...updatedValues } = request.body;
    let updatedConfig = {
      configId: selectedConfig.configId,
      config: {...selectedConfig.config, ...updatedValues},
      isActive: selectedConfig.isActive,
    };
    config = [
      ...config.filter((c) => c.configId !== +request.body.configId),
      updatedConfig,
    ];
    fs.writeFileSync(
      "./mocks/service/config/GET.json",
      JSON.stringify(config, null, 4)
    );
    response.send(updatedConfig);
  } else {
    response.status(400).send("Please provide a configId");
  }
};
