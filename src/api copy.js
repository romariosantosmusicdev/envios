// src/api.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { baseUrl, apiKey, instanceName } = require('./config');
const { sleep } = require('./utils');

const criarInstancia = async () => {
    try {
        var data = {
            instanceName: "sdfgdf",
            token: "87F3F7D0-4B8A-45D0-8618-7399E4AD646",
            qrcode: true
            // number: "551111111111"
        };
        const response = await axios.post(`${baseUrl}/instance/create`, data, {
            headers: {
                'accept': 'application/json',
                'apikey': apiKey,
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar instância:', error.response?.data || error.message);
        throw error;
    }
};

const connection = async () => {
    try {
        const response = await axios.get(`${baseUrl}/instance/connect/${instanceName}`, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey,
            }
        });
        return response.data.code; // Retorna o código QR
    } catch (error) {
        console.error('Erro ao conectar:', error.response?.data || error.message);
        throw error;
    }
};

const logout = async () => {
    try {
        const response = await axios.delete(`${baseUrl}/instance/logout/${instanceName}`, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey,
            }
        });
        console.log('Logout realizado:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro ao realizar logout:', error.response?.data || error.message);
        throw error;
    }
};

const enviarMensagem = async (numero, mensagem) => {
    var data = {
        "number": numero,
        "options": {
            "delay": 1200,
            "presence": "composing",
            "linkPreview": false
        },
        "textMessage": {
            "text": mensagem
        }
    };
    try {
        const response = await axios.post(`${baseUrl}/message/sendText/${instanceName}`, data, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey,
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
        throw error;
    }
};

const envioMedia = async (numero, media, mediaType) => {
    var data = {
        "number": numero,
        "options": {
            "delay": 1200,
            "presence": "composing"
        },
        "mediaMessage": {
            "mediatype": mediaType,
            "caption": `This is an example ${mediaType} file sent by Evolution-API via URL.`,
            "media": media
        }
    };
    try {
        const response = await axios.post(`${baseUrl}/message/sendMedia/${instanceName}`, data, {
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'apikey': apiKey,
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error(`Erro ao enviar ${mediaType}:`, error.response?.data || error.message);
        throw error;
    }
};

const sendMassMessages = async () => {
    const filePath = path.join(__dirname, '../data/contatos.xlsx');
    try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const messageTemplate = data[0]['mensagem'];

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

            await enviarMensagem(phoneNumber, message);

            const mediaDir = path.join(__dirname, '../media');
            const files = fs.readdirSync(mediaDir);

            for (const file of files) {
                const ext = path.extname(file);
                const filePath = path.join(mediaDir, file);
                const media = fs.readFileSync(filePath, { encoding: 'base64' });

                if (ext === '.jpg') {
                    await envioMedia(phoneNumber, media, 'image');
                } else if (ext === '.mp4') {
                    await envioMedia(phoneNumber, media, 'video');
                }
                await sleep(2000);
            }

            await sleep(2000);
        }
        console.log('Fim dos envios.');
    } catch (error) {
        console.error('Erro ao enviar mensagens em massa:', error);
    }
};

// module.exports = {
//     criarInstancia,
//     connection,
//     logout,
//     sendMassMessages
// };

criarInstancia()