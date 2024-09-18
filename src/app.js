// src/app.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");

const {
  verInstancia,
  verStatusInstancia,
  criarInstancia,
  deletarInstancia,
  connection,
  logout,
  sendMassMessages,
} = require("./api");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

// Verifica se a pasta existe, caso contrário, cria a pasta
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
// Configurando o destino e nome do arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../data"));
  },
  filename: (req, file, cb) => {
    cb(null, "contatos.xlsx");
  },
});

const upload = multer({ storage });

app.post("/upload-contatos", upload.single("contatos"), async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/contatos.xlsx");
console.log(filePath)
    // Verifica se o arquivo foi realmente salvo
    if (!fs.existsSync(filePath)) {
      throw new Error("O arquivo não foi salvo.");
    }

    // Execute sua lógica
    const response = await sendMassMessages(filePath);

    // Exclua o arquivo após a execução
    fs.unlinkSync(filePath);

    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao processar o arquivo", details: error.message });
  }
});

app.post("/execute", async (req, res) => {
  const { action } = req.body;

  try {
    let response;
    switch (action) {
      case "verInstancia":
        response = await verInstancia();
        break;
      case "deletarInstancia":
        response = await deletarInstancia();
        break;
      case "verStatusInstancia":
        response = await verStatusInstancia();
        break;
      case "criarInstancia":
        response = await criarInstancia("5575998160564", "OI");
        break;
      case "connection":
        response = await connection();
        break;
      case "logout":
        response = await logout();
        break;
      case "sendMassMessages":
        const resp = await verStatusInstancia();

        if (resp.verStatusInstancia.instance.state == "open") {
          await sendMassMessages();
          const data = {
            sendMassMessages: {
              status: "success",
              message: "Ação executada com sucesso!",
            },
          };

          response = data;
        } else {
          response = await verStatusInstancia();
        }
        break;
      default:
        response = { message: "Ação inválida" };
    }
    res.json(response);
  } catch (error) {
    return error;
  }
});



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
