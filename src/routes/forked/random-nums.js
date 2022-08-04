
const getRandomNumbers = (cant) => {
    const resultados = {};
    for (let i = 0; i < cant; i++) {
        const numeroAleatorio = Math.floor(Math.random() * 1000) + 1;
        if (resultados[numeroAleatorio]) resultados[numeroAleatorio]++;
        else resultados[numeroAleatorio] = 1;
    }
    return resultados;
};

process.on("message", (cantidad) => {
  const result = getRandomNumbers(cantidad);
  process.send(result);
});


export default getRandomNumbers;