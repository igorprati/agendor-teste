require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const server = express();
const { json } = require("body-parser");
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args));

server.use(bodyParser.json());


server.post("/api", async (req, res) => {
  const { nome, email, cargo, nome_empresa, qnt_vendedores } = req.body;

  /**
   * Caso o cargo seja 'gestor de vendas' e 
   * a quantidade de vendedores seja 4 ou mais (representada pelo value "2")
   * o script será executado
   */
  if (cargo == "gestor_vendas" && qnt_vendedores == "4 ou mais") {

    const organizationRequestBody = {
      name: nome_empresa,
      customFields: {
        qnt_de_vendedores: qnt_vendedores,
      },
    };

    const dealRequestBody = {
      title: nome_empresa,
    };

    /**
     * Requisição para criação 
     * da organização
     */
    const organizationResponse = await fetch(
      "https://api.agendor.com.br/v3/organizations",
      {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.AUTH_TOKEN,
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

    /**
     * Requisição para criação 
     * da pessoa
     */
    const peopleResponse = await fetch("https://api.agendor.com.br/v3/people", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.AUTH_TOKEN,
      },
      body: JSON.stringify(peopleRequestBody),
    });

    /**
     * Requisição para
     * criação do negócio, utilizando
     * como parâmetro ID da organização
     */
    const dealResponse = await fetch(
      `https://api.agendor.com.br/v3/organizations/${organizationID}/deals`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.AUTH_TOKEN,
        },
        body: JSON.stringify(dealRequestBody),
      }
    );

    /**
     * resposta OK caso todos
     * os steps ocorram tudo bem
     */
    return res.status(200).json(req.body);
  } 

  /**
     * reposta caso a condição
     * inicial não seja atendida
     */
  return res.status(400).json({ info: 'Não foi possível inserir no nosso sistema.', atencao: { cargo: 'Necessário que seja: gestor_vendas', qnt_funcionarios: 'Necessario que seja: 4 ou mais' }});
});

server.listen(3000, () => {
  console.log("Servidor funcionando na porta 3000");
});
