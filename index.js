const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const { json } = require("body-parser");
server.use(bodyParser.json());

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const serverPort = '/' || 3000

server.post("/api", async (req, res) => {
	console.log(req.body)
  const { nome, email, cargo, nome_empresa, qnt_vendedores } = req.body.data;


  if (cargo == "gestor_vendas" && qnt_vendedores == "2") {
    const organizationRequestBody = {
      name: nome_empresa,
      customFields: {
        qnt_de_vendedores: qnt_vendedores,
      },
    };

    const dealRequestBody = {
      title: nome_empresa,
    };

    // ORGANIZATION
    const organizationResponse = await fetch(
      "https://api.agendor.com.br/v3/organizations",
      {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token a86014c5-dd46-41c8-b673-356d6d67b119",
        },
        body: JSON.stringify(organizationRequestBody),
      }
    );
    const responseBody = await organizationResponse.json();
    const organizationID = responseBody.data.id;

    const peopleRequestBody = {
      name: nome,
      organization: organizationID,
      contact: {
        email: email,
      },
      role: cargo,
    };

    // PEOPLE
    const peopleResponse = await fetch("https://api.agendor.com.br/v3/people", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token a86014c5-dd46-41c8-b673-356d6d67b119",
      },
      body: JSON.stringify(peopleRequestBody),
    });

    // DEAL
    const dealResponse = await fetch(
      `https://api.agendor.com.br/v3/organizations/${organizationID}/deals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token a86014c5-dd46-41c8-b673-356d6d67b119",
        },
        body: JSON.stringify(dealRequestBody),
      }
    );
  }

  return res.status(200).json(req.body);
});

server.listen("/", () => {
  console.log("Servidor funcionando na porta 3000");
});
