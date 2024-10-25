import * as SQLite from 'expo-sqlite';

const dbPromise = SQLite.openDatabaseAsync('garden.db');

// Initialize the database
export const createTable = async () => {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      uri TEXT,
      species TEXT
    );
  `);
};

export const updateTableSchema = async () => {
  const db = await dbPromise;

  // Create a new table with the updated schema
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS images_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      uri TEXT,
      species TEXT
    );
  `);

  // Copy data from old table to new table
  await db.execAsync(`
    INSERT INTO images_new (id, name, uri, species)
    SELECT id, name, uri, species FROM images;
  `);

  // Drop the old table
  await db.execAsync('DROP TABLE images;');

  // Rename the new table to the old table name
  await db.execAsync('ALTER TABLE images_new RENAME TO images;');
};

// Call this function somewhere to update the schema
updateTableSchema();

// Insert an image into the database
export const insertImage = async (name: string, uri: string, species: string) => {
  const db = await dbPromise;
  await db.runAsync('INSERT INTO images (name, uri, species) VALUES (?, ?, ?);', [name, uri, species]);
};

// Get all images from the database
export const getImages = async (callback: (images: { name: string, uri: string, species: string }[]) => void) => {
  const db = await dbPromise;
  const rows: { name: string, uri: string, species: string }[] = await db.getAllAsync('SELECT * FROM images;');
  const images = rows.map(row => ({ name: row.name, uri: row.uri, species: row.species }));
  callback(images);
};

// Delete an image from the database
export const deleteImage = async (uri: string) => {
  const db = await dbPromise;
  await db.runAsync('DELETE FROM images WHERE uri = ?;', [uri]);
};

// Check the table schema
export const checkTableSchema = async () => {
  const db = await dbPromise;
  const result = await db.getAllAsync('PRAGMA table_info(images);');
  console.log(result);
};

// Call createTable to ensure the table is created
createTable();