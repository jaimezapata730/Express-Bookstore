process.env.NODE_ENV = "test";

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let book_isbn;

beforeEach(async () => {
    let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '1234321229',
          'https://amazon.com/burrito',
          'Arnold',
          'Dutch',
          400,
          'POboy publishers',
          'hirtzleing', 2003)
        RETURNING isbn`);
  
    book_isbn = result.rows[0].isbn
});


describe('POST /books', () => {
    test("Upload a new book", async () => {
        const res = await request(app)
            .post(`/books`)
            .send({isbn: '98765432109', amazon_url: 'https://dumbdumbdummy.com', author: 'Benitox Perez' , language: 'spanish', 
                pages: 1001, publisher: 'snoopy dog', title: 'minini dog', year: 2022});
        expect(res.statusCode).toEqual(201);        
        expect(res.body.book).toHaveProperty("isbn");        
    });
    test("Ensures books have a title before creation", async () => {
        const res = await request(app)
        .post(`/books`)
        .send({ year: 2020 });
    expect(res.statusCode).toBe(400);
    });
});

describe('GET /books', () => {
    test("Return a list of 1 book", async () => {
        const res = await request(app)
            .get(`/books/`);
        const books = res.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty('isbn');
        expect(books[0]).toHaveProperty('amazon_url');
    });
});

describe('GET /books/:isbn', () => {
    test("Return a single book", async () => {
        const res = await request(app)
            .get(`/books/${book_isbn}`);
        expect(res.body.book).toHaveProperty('isbn');
        expect(res.body.book.isbn).toBe(book_isbn);
    });
    test("Can't find book in question", async () => {
        const res = await request(app)
        .get(`/books/999`)
    expect(res.statusCode).toBe(404);
    });
});

describe('PUT /books/:id', () => {
    test("Update a book", async () => {
        const res = await request(app)
            .put(`/books/${book_isbn}`)
            .send({ amazon_url: 'https://george.com', author: 'george', language: 'arabic', pages: 3000, publisher: 'hell yeah',
                title: 'THE WORKBOOK', year:2024  });
    expect(res.body.book).toHaveProperty('isbn');
    expect(res.body.book.title).toBe("THE WORKBOOK");
    });
});
    test("Prevbents a wrong update", async () => {
        const res = await request(app)
            .put(`/books/${book_isbn}`)
            .send({ isbn: '9632587412', badField: 'GO AWAY', amazon_url: 'https://george.com', author: 'george', language: 'arabic',
                pages: 3000, publisher: 'hell yeah',title: 'THE WORKBOOK', year:2024  });
        expect(res.statusCode).toBe(400);
    });

    test("Can't find book in question", async () => {
        //delete a book first
        await request(app)
            .delete(`/books/${book_isbn}`)
        const res = await request(app).delete(`/books/${book_isbn}`)
    expect(res.statusCode).toBe(404);
    });


describe('DELETE /books/:id', () => {
    test('Deletes a single book', async () => {
        const res = await request(app)
            .delete(`/books/${book_isbn}`)
        expect(res.body).toEqual({ message: "Book deleted!!!"})
    });
});





afterEach(async function () {
    await db.query("DELETE FROM BOOKS");
});
  
  
  
afterAll(async function () {
    await db.end()
});