const fs = require("fs");
let config = JSON.parse(
  fs.readFileSync("./mocks/service/config/configs.json", "utf8")
);
let latestActiveConfig = config.filter(
  (c) =>
    (c.configId = Math.max.apply(
      Math,
      config.map(function (o) {
        return o.configId;
      })
    )) && c.isActive
)[0];

module.exports = async function (request, response) {
  if (Object.keys(request.query).length === 0) {
    response.status(200).send(latestActiveConfig);
  } else if (+request.query.id === latestActiveConfig.configId) {
    let requestedField = request.query.field.split(",");
    const latestActiveConfigFiltered = requestedField.reduce(
      (obj, key) => ({ ...obj, [key]: latestActiveConfig.config[key] }),
      {}
    );
    response
      .status(200)
      .send({ configId: +request.query.id, ...latestActiveConfigFiltered });
  } else {
    response.status(400).send({
      message: "Invalid config id / config has been deactivated",
    });
  }
};
