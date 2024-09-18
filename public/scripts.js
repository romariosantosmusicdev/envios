// const instanceName = document.getElementById("inputId").value;
// console.log("variavel instaciada" + instanceName)
const resultado = document.getElementById("resultado");
// const qrcode = document.getElementById("qrcode");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await verInstancia();

    function criarLinhasTabela(dados) {
      const tbody = document.querySelector("#myTable tbody");
      tbody.innerHTML = ""; // Limpa o tbody antes de adicionar novas linhas

      response.forEach((dado) => {
        const tr = document.createElement("tr");

        const tdId = document.createElement("td");
        tdId.innerHTML = `<a href="/instance.html">${dado.instance.instanceId}</a>`;
        tr.appendChild(tdId);

        const tdNome = document.createElement("td");
        tdNome.textContent = dado.instance.profileName;
        tr.appendChild(tdNome);

        const tdEmail = document.createElement("td");
        tdEmail.textContent = dado.instance.instanceName;
        tr.appendChild(tdEmail);

        const tdTelefone = document.createElement("td");
        tdTelefone.textContent = dado.instance.status;
        tr.appendChild(tdTelefone);

        tbody.appendChild(tr);
      });
    }

    // Chama a função para criar as linhas da tabela
    criarLinhasTabela(dados);
  } catch (error) {
    resultado.innerHTML = `Erro: ${error.message}`;
  }
});

const verInstancia = async () => {
  try {
    const response = await fetch(`${dados.baseUrl}/instance/fetchInstances`, {
      method: "GET",
      headers: {
        Authorization: `Apikey ${dados.apiKey}`,
        apikey: dados.apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    return error;
  }
};

const deletarInstancia = async () => {
  try {
    // Obtém o valor do input com o ID 'inputId'
    let instanceName = document.getElementById("inputId").value;

    // Faz a requisição DELETE para deletar a instância
    const response = await fetch(
      `${dados.baseUrl}/instance/delete/${instanceName}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          apiKey: dados.apiKey,
        },
      }
    );
    const data = await response.json();
    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      // Se a resposta não for bem-sucedida, lança um erro com o status
      console.log(response);
    }

    // Retorna a resposta em formato JSON (se aplicável)
    return data;
  } catch (error) {
    // Retorna a mensagem de erro ou dados da resposta de erro

    return error;
  }
};

const connection = async () => {
  try {
    let instanceName = document.getElementById("inputId").value;

    const response = await fetch(
      `${dados.baseUrl}/instance/connect/${instanceName}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          apikey: dados.apiKey,
        },
      }
    );

    const responseData = await response.json();
    console.log(responseData);

    let qrcodeContainer = document.getElementById("qrcode");
    QRCode.toCanvas(qrcodeContainer, responseData.code, function (error) {});
  } catch (error) {
    console.log(error);
    return error.response?.data || error.message;
  }
};

const logout = async () => {
  try {
    let instanceName = document.getElementById("inputId").value;

    const response = await fetch(
      `${dados.baseUrl}/instance/logout/${instanceName}`,
      {
        method: "DELETE",
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

const criarInstancia = async () => {
  try {
    let instanceName = document.getElementById("inputId").value;
    let token = document.getElementById("token").value;
    // Ensure required data is present:
    if (!instanceName || !token || !dados.baseUrl || !dados.apiKey) {
      console.log(
        "Missing required data: instanceName, dados.token, dados.baseUrl, dados.apiKey"
      );
      // throw new Error('Missing required data: instanceName, dados.token, dados.baseUrl, dados.apiKey');
    }

    // Construct the request body with safer object destructuring:
    const { apiKey, baseUrl } = dados;
    const data = {
      instanceName,
      token,
      qrcode: true,
      number: "551111111112", // Replace with actual phone number (if applicable)
    };

    // Create a more robust Fetch API request:
    const response = await fetch(`${baseUrl}/instance/create`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apiKey: apiKey,
        // Authorization: `Bearer ${apiKey}`, // Use correct authorization header
      },
      body: JSON.stringify(data), // Properly stringify object
    });

    // Handle the response with error checking:
    if (!response.ok) {
      console.log(`API request failed with status: ${response.status}`);
      // throw new Error(`API request failed with status: ${response.status}`);
    }

    const responseData = await response.json();

    let qrcodeContainer = document.getElementById("qrcode");
    QRCode.toCanvas(
      qrcodeContainer,
      responseData.qrcode.code,
      function (error) {
        if (error) console.error("Erro ao gerar QR Code:", error);
      }
    );
  } catch (error) {
    console.log("Error creating instance:", error);
    // console.error('Error creating instance:', error);
    return { criarInstancia: error }; // Handle error gracefully (optional)
  }
};

const sendMassMessages = async () => {
  const response = await fetch("/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify( 'sendMassMessages' ),
  });
  const data = await response.json();
  console.log(data)
};
