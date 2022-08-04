import { faker } from '@faker-js/faker';

faker.setLocale('es');

const createFakeProducts = async () => {
    let products = [];
    for (let i = 0; i < 5; i++) {
        const product = {
            id: 1 + i,
            nombre: faker.music.songName(),
            precio: faker.commerce.price(),
            foto: faker.image.imageUrl("300", "300", 'Music', true),
            stock: faker.random.numeric(3),
        }
        products.push(product);
    }
    return products;
}

export { createFakeProducts };