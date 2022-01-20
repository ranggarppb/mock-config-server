const fs = require("fs");
let config = JSON.parse(
  fs.readFileSync("./mocks/service/config/configs.json", "utf8")
);
let latestActiveConfig = config.filter(
  (c) =>
    (c.configId =
      Math.max.apply(
        Math,
        config.map(function (o) {
          return o.configId;
        })
      )) && c.isActive
)[0];

module.exports = async function (request, response) {
  if (!request.query || +request.query.id !== latestActiveConfig.configId) {
    response
      .status(200)
      .send({ latestActiveConfig, needToCreateNewCache: true });
  } else {
    let requestedField = request.query.field.split(",");
    requestedField.push("configId");
    const latestActiveConfigFiltered = requestedField.reduce(
      (obj, key) => ({ ...obj, [key]: latestActiveConfig.config[key] }),
      {}
    );
    response
      .status(200)
      .send({
        latestActiveConfig: latestActiveConfigFiltered,
        needToCreateNewCache: false,
      });
  }
};
