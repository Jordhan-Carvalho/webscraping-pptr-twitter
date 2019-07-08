const inquirer = require("inquirer");

const questions = [
  {
    type: "input",
    name: "name",
    message: "What's your email?"
  },
  {
    type: "password",
    name: "password",
    message: "Password?"
  }
];

const utils = {
  getUserData: async () => {
    const resp = await inquirer.prompt(questions).then(answers => {
      console.log(`Hello ${answers.name}! Initializing...`);
      return answers;
    });
    return resp;
  }
};

module.exports = utils;
