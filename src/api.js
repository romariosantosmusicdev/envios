// src/api.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { baseUrl, apiKey, key, token } = require("./config");
const { sleep } = require("./utils");

const verInstancia = async () => {
  try {
    const response = await axios.get(`${baseUrl}/instance/fetchInstances`, {
      headers: {
        Authorization: `Apikey ${apiKey}`,
        apikey: apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    return { verInstancia: response.data };
  } catch (error) {
    return error;
  }
};

const verStatusInstancia = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/instance/connectionState/${instanceName}`,
      {
        headers: {
          Authorization: `Apikey ${apiKey}`,
          apikey: apiKey,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return { verStatusInstancia: response.data };
  } catch (error) {
    return error;
  }
};

const criarInstancia = async () => {
  try {
    var data = {
      instanceName: instanceName,
      token: token,
      qrcode: true,
      number: "551111111111",
    };
    const response = await axios.post(`${baseUrl}/instance/create`, data, {
      headers: {
        accept: "application/json",
        apikey: apiKey,
        "Content-Type": "application/json",
      },
    });
    return { criarInstancia: response.data };
  } catch (error) {
    return { criarInstancia: error };
  }
};

const connection = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/instance/connect/${instanceName}`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          apikey: key,
        },
      }
    );
    return response; // Retorna o código QR
  } catch (error) {
    return error.response?.data || error.message;
  }
};

const logout = async () => {
  try {
    const response = await axios.delete(
      `${baseUrl}/instance/logout/${instanceName}`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          apikey: apiKey,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Erro ao realizar logout:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const enviarMensagem = async (numero, mensagem, instanceName) => {
  var data = {
    number: numero,
    options: {
      delay: 1200,
      presence: "composing",
      linkPreview: false,
    },
    textMessage: {
      text: mensagem,
    },
  };
  try {
    const response = await axios.post(
      `${baseUrl}/message/sendText/${instanceName}`,
      data,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          apikey: apiKey,
        },
      }
    );
    return response;
  } catch (error) {
    console.error(
      "Erro ao enviar mensagem:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const deletarInstancia = async () => {
  try {
    // Faz a requisição POST para criar a instância
    const response = await axios.delete(
      `${baseUrl}/instance/delete/${instanceName}`,
      {
        headers: {
          accept: "application/json",
          apikey: apiKey,
        },
      }
    );

    return response;
  } catch (error) {
    return error.response?.data || error.message;
  }
};

const envioMedia = async (numero, media, mediaType, instanceName) => {
  var data = {
    number: numero,
    options: {
      delay: 1200,
      presence: "composing",
    },
    mediaMessage: {
      mediatype: mediaType,
      caption: `This is an example ${mediaType} file sent by Evolution-API via URL.`,
      media: media,
    },
  };
  try {
    const response = await axios.post(
      `${baseUrl}/message/sendMedia/${instanceName}`,
      data,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          apikey: apiKey,
        },
      }
    );
    return response;
  } catch (error) {
    console.error(
      `Erro ao enviar ${mediaType}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

const sendMassMessages = async (filePath, instanceName) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const messageTemplate = data[0]["mensagem"];

    for (const linha of data) {
      const phoneNumber = linha.numero_destino;

      const message = messageTemplate
        .replace("nome_destino", linha.nome_destino)
        .replace("numero_destino", phoneNumber)
        .replace("texto_1", linha.texto_1)
        .replace("texto_2", linha.texto_2)
        .replace("texto_3", linha.texto_3)
        .replace("texto_4", linha.texto_4)
        .replace("texto_5", linha.texto_5);

      await enviarMensagem(phoneNumber, message, instanceName);

      const mediaDir = path.join(__dirname, "../media");
      const files = fs.readdirSync(mediaDir);

      for (const file of files) {
        const ext = path.extname(file);
        const filePath = path.join(mediaDir, file);
        const media = fs.readFileSync(filePath, { encoding: "base64" });

        if (ext === ".jpg") {
          await envioMedia(phoneNumber, media, "image", instanceName);
        } else if (ext === ".mp4") {
          await envioMedia(phoneNumber, media, "video", instanceName);
        }
        await sleep(2000);
      }

      await sleep(2000);
    }

    const resp = [{ message: "Fim dos envios." }];
    return resp;
  } catch (error) {
    return { error: "Erro ao enviar mensagens", details: error };
  }
};

// const sendMassMessages = async () => {
//   const filePath = path.join(__dirname, "../data/contatos.xlsx");
//   try {
//     const workbook = xlsx.readFile(filePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     const messageTemplate = data[0]["mensagem"];

//     for (const linha of data) {
//       const phoneNumber = linha.numero_destino;

//       const message = messageTemplate
//         .replace("nome_destino", linha.nome_destino)
//         .replace("numero_destino", phoneNumber)
//         .replace("texto_1", linha.texto_1)
//         .replace("texto_2", linha.texto_2)
//         .replace("texto_3", linha.texto_3)
//         .replace("texto_4", linha.texto_4)
//         .replace("texto_5", linha.texto_5);

//       await enviarMensagem(phoneNumber, message);

//       const mediaDir = path.join(__dirname, "../media");
//       const files = fs.readdirSync(mediaDir);

//       for (const file of files) {
//         const ext = path.extname(file);
//         const filePath = path.join(mediaDir, file);
//         const media = fs.readFileSync(filePath, { encoding: "base64" });

//         if (ext === ".jpg") {
//           await envioMedia(phoneNumber, media, "image");
//         } else if (ext === ".mp4") {
//           await envioMedia(phoneNumber, media, "video");
//         }
//         await sleep(2000);
//       }

//       await sleep(2000);
//     }
//     const resp = [{ message: "Fim dos envios." }];
//     return resp ;
//   } catch (error) {
//     return error;
//   }
// };

module.exports = {
  verInstancia,
  verStatusInstancia,
  criarInstancia,
  deletarInstancia,
  connection,
  logout,
  sendMassMessages,
};
