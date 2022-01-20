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

const triggerUpdateConfigWarning = async (configId, status, newConfig) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [
      {
        key: uuid.v4(),
        value: JSON.stringify({ configId, status, newConfig }),
      },
    ],
  });
};

const updateConfig = async (requestBody) => {
  return new Promise((resolve, reject) => {
    if (requestBody.configId) {
      let selectedConfig = config.filter(
        (c) => c.configId === +requestBody.configId
      )[0];
      const { configId, ...updatedValues } = requestBody;
      let updatedConfig = {
        configId: selectedConfig.configId,
        config: { ...selectedConfig.config, ...updatedValues },
        isActive: selectedConfig.isActive,
      };
      config = [
        ...config.filter((c) => c.configId !== +requestBody.configId),
        updatedConfig,
      ];
      fs.writeFileSync(
        "./mocks/service/config/configs.json",
        JSON.stringify(config, null, 4)
      );
      if (selectedConfig.isActive)
        resolve({
          updatedConfigId: updatedConfig.configId,
          updatedConfigField: Object.keys(updatedValues),
          updatedConfig: updatedConfig,
          needToTriggerWarning: true,
        });
      else
        resolve({
          updatedConfig: updatedConfig,
          needToTriggerWarning: false,
        });
    } else {
      reject({
        error: "No configId provided",
      });
    }
  });
};

module.exports = async function (request, response) {
  const trigger = await updateConfig(request.body);
  if (trigger.needToTriggerWarning) {
    await triggerUpdateConfigWarning(
      trigger.updatedConfigId,
      "updated",
      trigger.updatedConfig
    );
  }

  response.status(200).send(trigger.updatedConfig);
};
