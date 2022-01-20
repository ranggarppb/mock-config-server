const fs = require("fs");
const { Kafka } = require("kafkajs");
const clientId = "config-service";
const brokers = ["localhost:9092"];
const topic = "configuration";
const kafka = new Kafka({ clientId, brokers });
const producer = kafka.producer();
const uuid = require("uuid");
let config = JSON.parse(
  fs.readFileSync("./mocks/service/config/configs.json", "utf8")
);

const triggerPostConfigWarning = async (configId) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [
      {
        key: uuid.v4(),
        value: JSON.stringify({ configId, status: "invalid" }),
      },
    ],
  });
};

const postNewConfig = async (requestBody) => {
  return new Promise((resolve, reject) => {
    latestConfig = config.filter(
      (c) =>
        (c.configId = Math.max.apply(
          Math,
          config.map(function (o) {
            return o.configId;
          })
        ))
    )[0];

    newConfig = {
      configId: latestConfig.configId + 1,
      config: requestBody,
      isActive: true,
    };

    latestConfig = { ...latestConfig, isActive: false };

    config = config.filter(c => c.configId !== latestConfig.configId);
    config = [...config, latestConfig, newConfig];

    fs.writeFileSync(
      "./mocks/service/config/configs.json",
      JSON.stringify(config, null, 4)
    );

    resolve({
      latestConfigId: latestConfig.configId,
      newConfig: newConfig,
    });
  });
};

module.exports = async function (request, response) {
  const trigger = await postNewConfig(request.body);
  await triggerPostConfigWarning(trigger.latestConfigId);

  response.status(200).send(trigger.newConfig);
};
