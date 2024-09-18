// src/utils.js serve para dar tempo de espera
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
    sleep
};
